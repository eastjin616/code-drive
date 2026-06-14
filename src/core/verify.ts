import * as fs from 'node:fs';
import * as path from 'node:path';
import { execSync } from 'node:child_process';
import { analyzeProject } from './analyzer.js';
import type { AnalysisScopeOptions } from './analysis-scope.js';
import { assessArtifactFreshness } from './artifact-freshness.js';
import { isGitRepo } from './changelog-parser.js';
import { findAiContextFiles } from './ai-context.js';
import { collectReviewFindings } from './review-rules.js';

export type VerifyStatus = 'ready' | 'needs-sync' | 'needs-attention';
export type VerifyCheckStatus = 'pass' | 'warn' | 'fail' | 'info';

export interface VerifyCheck {
  readonly status: VerifyCheckStatus;
  readonly code: string;
  readonly message: string;
  readonly target?: string;
}

export interface VerifyResult {
  readonly status: VerifyStatus;
  readonly projectName: string;
  readonly checks: readonly VerifyCheck[];
  readonly nextActions: readonly string[];
}

export type VerifyOptions = AnalysisScopeOptions;

const GENERATED_ARTIFACTS = [
  { label: 'docs/README.md', relativePath: 'docs/README.md' },
  { label: 'ARCHITECTURE.md', relativePath: 'ARCHITECTURE.md' },
  { label: 'DESIGN.md', relativePath: 'DESIGN.md' },
  { label: 'CHANGELOG.md', relativePath: 'CHANGELOG.md' },
] as const;

function pass(code: string, message: string, target?: string): VerifyCheck {
  return { status: 'pass', code, message, target };
}

function warn(code: string, message: string, target?: string): VerifyCheck {
  return { status: 'warn', code, message, target };
}

function fail(code: string, message: string, target?: string): VerifyCheck {
  return { status: 'fail', code, message, target };
}

function info(code: string, message: string, target?: string): VerifyCheck {
  return { status: 'info', code, message, target };
}

function addNextAction(actions: string[], action: string): void {
  if (!actions.includes(action)) actions.push(action);
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function readProjectName(projectDir: string): string {
  const packagePath = path.join(projectDir, 'package.json');
  if (!fs.existsSync(packagePath)) return path.basename(projectDir);

  try {
    const parsed: unknown = JSON.parse(fs.readFileSync(packagePath, 'utf-8'));
    if (isRecord(parsed)) {
      const name = parsed.name;
      if (typeof name === 'string' && name.trim()) return name;
    }
  } catch {
    return path.basename(projectDir);
  }

  return path.basename(projectDir);
}

function verifyNode(): VerifyCheck {
  const nodeMajor = Number.parseInt(process.versions.node.split('.')[0] ?? '0', 10);
  return nodeMajor >= 18
    ? pass('node-version', `Node.js v${process.versions.node}`)
    : fail('node-version', `Node.js v${process.versions.node} is below 18`);
}

function verifyGit(projectDir: string): VerifyCheck[] {
  const checks: VerifyCheck[] = [];
  try {
    const version = execSync('git --version', { encoding: 'utf-8', stdio: 'pipe' }).trim();
    checks.push(pass('git-available', version));
  } catch {
    checks.push(fail('git-available', 'Git is not available'));
  }

  checks.push(
    isGitRepo(projectDir)
      ? pass('git-repository', 'Git repository detected')
      : fail('git-repository', 'Not a git repository'),
  );
  return checks;
}

function verifyConfig(projectDir: string): VerifyCheck {
  const configPath = path.join(projectDir, '.cdd', 'config.json');
  if (!fs.existsSync(configPath)) {
    return fail('cdd-config-missing', '.cdd/config.json is missing', '.cdd/config.json');
  }

  try {
    JSON.parse(fs.readFileSync(configPath, 'utf-8'));
    return pass('cdd-config-valid', '.cdd/config.json is valid', '.cdd/config.json');
  } catch {
    return fail('cdd-config-invalid', '.cdd/config.json is invalid JSON', '.cdd/config.json');
  }
}

function verifyArtifacts(
  projectDir: string,
  sourceFiles: readonly string[],
): { readonly checks: readonly VerifyCheck[]; readonly needsSync: boolean } {
  const targets = GENERATED_ARTIFACTS.map((artifact) => ({
    label: artifact.label,
    path: path.join(projectDir, artifact.relativePath),
  }));
  const freshness = assessArtifactFreshness(projectDir, targets, sourceFiles);
  const checks: VerifyCheck[] = [];
  let needsSync = false;

  for (const artifact of freshness) {
    if (artifact.status === 'missing') {
      needsSync = true;
      checks.push(warn('artifact-missing', `${artifact.label} is missing`, artifact.label));
    } else if (artifact.status === 'stale') {
      needsSync = true;
      checks.push(warn('artifact-stale', `${artifact.label} is older than source files`, artifact.label));
    } else {
      checks.push(pass('artifact-fresh', `${artifact.label} is fresh`, artifact.label));
    }
  }

  return { checks, needsSync };
}

function determineStatus(checks: readonly VerifyCheck[], needsSync: boolean): VerifyStatus {
  if (checks.some((check) => check.status === 'fail')) return 'needs-attention';
  if (needsSync) return 'needs-sync';
  return 'ready';
}

export function verifyProject(projectDir: string, options: VerifyOptions = {}): VerifyResult {
  const targetDir = path.resolve(projectDir);
  if (!fs.existsSync(targetDir)) {
    throw new Error(`Directory not found: ${targetDir}`);
  }

  const checks: VerifyCheck[] = [verifyNode(), ...verifyGit(targetDir), verifyConfig(targetDir)];
  const nextActions: string[] = [];
  let projectName = readProjectName(targetDir);
  let sourceFiles: readonly string[] = [];
  let needsSync = false;

  try {
    const project = analyzeProject(targetDir, options);
    projectName = project.name;
    sourceFiles = project.sourceFiles;
    if (project.sourceFiles.length > 0) {
      checks.push(pass('source-analysis', `${project.sourceFiles.length} source files analyzed`));
    } else {
      checks.push(fail('source-analysis-empty', 'No source files found'));
      addNextAction(nextActions, 'Check `.cdd/config.json` sourceDir/include/exclude settings.');
    }
  } catch (error) {
    checks.push(fail('source-analysis-failed', `Source analysis failed: ${String(error)}`));
  }

  const artifactResult = verifyArtifacts(targetDir, sourceFiles);
  checks.push(...artifactResult.checks);
  if (artifactResult.needsSync) {
    needsSync = true;
    addNextAction(nextActions, 'Run `cdd sync .` to generate or refresh CDD artifacts.');
  }

  const aiFiles = findAiContextFiles(targetDir);
  if (aiFiles.length > 0) {
    checks.push(pass('ai-context-installed', `AI context routing installed in ${aiFiles.join(', ')}`));
  } else {
    checks.push(fail('ai-context-missing', 'CDD AI context routing is not installed'));
    addNextAction(nextActions, 'Run `cdd ai install .` to install AI context routing.');
  }

  try {
    const review = collectReviewFindings(targetDir, options);
    const errorCount = review.findings.filter((finding) => finding.severity === 'error').length;
    const warningCount = review.findings.filter((finding) => finding.severity === 'warn').length;
    if (errorCount > 0) {
      checks.push(fail('review-errors', `${errorCount} review error(s) found`));
      addNextAction(nextActions, 'Run `cdd review .` and fix review errors.');
    } else {
      checks.push(pass('review-errors', 'No review errors found'));
    }
    if (warningCount > 0) {
      checks.push(info('review-warnings', `${warningCount} review warning(s) found`));
    }
  } catch (error) {
    checks.push(fail('review-failed', `Review failed: ${String(error)}`));
  }

  return {
    status: determineStatus(checks, needsSync),
    projectName,
    checks,
    nextActions,
  };
}
