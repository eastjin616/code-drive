import * as fs from 'node:fs';
import * as path from 'node:path';
import { execSync } from 'node:child_process';
import chalk from 'chalk';
import { analyzeProject, analyzeAll } from '../core/analyzer.js';
import type { AnalysisScopeOptions } from '../core/analysis-scope.js';
import { readCddConfig } from '../core/analysis-scope.js';
import { assessArtifactFreshness } from '../core/artifact-freshness.js';
import { isGitRepo } from '../core/changelog-parser.js';

interface Check {
  readonly label: string;
  readonly status: 'pass' | 'warn' | 'fail' | 'info';
  readonly message: string;
}

interface DoctorOptions {
  readonly includeTests?: boolean;
}

function ok(msg: string): Check {
  return { label: '', status: 'pass', message: msg };
}
function warn(msg: string): Check {
  return { label: '⚠', status: 'warn', message: msg };
}
function fail(msg: string): Check {
  return { label: '✗', status: 'fail', message: msg };
}
function info(msg: string): Check {
  return { label: 'ℹ', status: 'info', message: msg };
}

function addRecommendation(recommendations: string[], message: string): void {
  if (!recommendations.includes(message)) recommendations.push(message);
}

export async function doctorCommand(dir: string, options: DoctorOptions = {}): Promise<void> {
  const targetDir = path.resolve(dir);
  const analysisOptions: AnalysisScopeOptions = { includeTests: options.includeTests };

  if (!fs.existsSync(targetDir)) {
    throw new Error(`Directory not found: ${targetDir}`);
  }

  const checks: Check[] = [];
  const recommendations: string[] = [];
  let sourceFiles: readonly string[] = [];

  // ── System checks ─────────────────────────────────────────────────

  // Node version
  const nodeVer = process.versions.node;
  const nodeMajor = parseInt(nodeVer.split('.')[0], 10);
  if (nodeMajor >= 18) {
    checks.push(ok(`Node.js v${nodeVer} (≥18)`));
  } else {
    checks.push(fail(`Node.js v${nodeVer} (<18) — upgrade required`));
  }

  // Git availability
  try {
    const gitVer = execSync('git --version', { encoding: 'utf-8' }).trim();
    checks.push(ok(gitVer));
  } catch {
    checks.push(fail('Git not found — install git'));
  }

  // ── Project checks ────────────────────────────────────────────────

  // CDD config
  const configPath = path.join(targetDir, '.cdd', 'config.json');
  if (fs.existsSync(configPath)) {
    try {
      const cfg = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
      checks.push(ok(`CDD initialized (${cfg.generator ? 'generator' : 'config'} v${cfg.version || '?'})`));
      const config = readCddConfig(targetDir);
      if (config.projectRoot && path.resolve(config.projectRoot) !== targetDir) {
        checks.push(warn(`CDD config projectRoot points to ${config.projectRoot}`));
        addRecommendation(recommendations, 'Run `cdd init --force .` to refresh stale .cdd/config.json metadata.');
      }
    } catch {
      checks.push(warn('CDD config exists but is invalid JSON — re-run cdd init'));
      addRecommendation(recommendations, 'Run `cdd init --force .` to replace invalid .cdd/config.json.');
    }
  } else {
    checks.push(warn('Not CDD initialized — run cdd init first'));
    addRecommendation(recommendations, 'Run `cdd init .` before generating long-lived CDD artifacts.');
  }

  // Git repo status
  if (isGitRepo(targetDir)) {
    try {
      const branch = execSync('git rev-parse --abbrev-ref HEAD', { cwd: targetDir, encoding: 'utf-8' }).trim();
      const status = execSync('git status --porcelain', { cwd: targetDir, encoding: 'utf-8' }).trim();
      checks.push(ok(`Git repository (${branch})${status ? ' — uncommitted changes' : ''}`));
      if (status) {
        const changed = status.split('\n').length;
        checks.push(info(`${changed} uncommitted file(s)`));
        addRecommendation(recommendations, 'Review local changes before publishing or regenerating release artifacts.');
      }
    } catch {
      checks.push(warn('Git repository detected but status unavailable'));
    }
  } else {
    checks.push(fail('Not a git repository — cdd changelog/review require git'));
  }

  // Project analysis
  try {
    const project = analyzeProject(targetDir, analysisOptions);
    sourceFiles = project.sourceFiles;
    const { functions, classes, interfaces } = analyzeAll(targetDir, analysisOptions);
    checks.push(ok(`${project.sourceFiles.length} source files · ${functions.length} functions · ${classes.length} classes · ${interfaces.length} interfaces`));
    if (project.sourceFiles.length === 0) {
      addRecommendation(recommendations, 'Check `.cdd/config.json` sourceDir/include/exclude because no source files were found.');
    }
    if (project.dependencies.length > 0) {
      checks.push(info(`${project.dependencies.length} dependencies: ${project.dependencies.join(', ')}`));
    }
  } catch (e) {
    checks.push(warn(`Project analysis failed: ${e}`));
  }

  // ── Artifact checks ───────────────────────────────────────────────

  const generatedPaths: { path: string; label: string }[] = [
    { path: path.join(targetDir, 'docs/README.md'), label: 'docs/README.md' },
    { path: path.join(targetDir, 'ARCHITECTURE.md'), label: 'ARCHITECTURE.md' },
    { path: path.join(targetDir, 'DESIGN.md'), label: 'DESIGN.md' },
  ];
  const changelogPath = path.join(targetDir, 'CHANGELOG.md');
  const artifactsDir = path.join(targetDir, 'docs');
  if (fs.existsSync(artifactsDir)) {
    let fileCount = 0;
    try {
      fileCount = fs.readdirSync(artifactsDir, { recursive: true }).length;
    } catch {
      fileCount = 0;
    }
    checks.push(ok(`docs/ — ${fileCount} generated file(s)`));
  } else {
    checks.push(info('docs/ — not generated yet'));
    addRecommendation(recommendations, 'Run `cdd docgen .` or `cdd sync .` to generate docs/.');
  }

  const freshness = assessArtifactFreshness(targetDir, generatedPaths, sourceFiles);
  for (const artifact of freshness) {
    if (artifact.status === 'missing') {
      checks.push(info(`${artifact.label} — not generated yet`));
      if (artifact.label === 'docs/README.md') {
        addRecommendation(recommendations, 'Run `cdd docgen .` or `cdd sync .` to generate docs/.');
      }
      if (artifact.label === 'ARCHITECTURE.md') {
        addRecommendation(recommendations, 'Run `cdd spec .` or `cdd sync .` to generate ARCHITECTURE.md.');
      }
      if (artifact.label === 'DESIGN.md') {
        addRecommendation(recommendations, 'Run `cdd design .` if this project owns UI or design tokens.');
      }
      continue;
    }

    const size = fs.statSync(artifact.path).size;
    const sizeLabel = size > 1024 ? `${(size / 1024).toFixed(1)}KB` : `${size}B`;
    if (artifact.status === 'stale') {
      checks.push(warn(`${artifact.label} is older than source files (${sizeLabel})`));
      addRecommendation(recommendations, 'Run `cdd sync .` to refresh stale generated artifacts.');
    } else {
      checks.push(ok(`${artifact.label} (${sizeLabel})`));
    }
  }

  if (fs.existsSync(changelogPath)) {
    const size = fs.statSync(changelogPath).size;
    checks.push(ok(`CHANGELOG.md (${size > 1024 ? `${(size / 1024).toFixed(1)}KB` : `${size}B`})`));
  } else {
    checks.push(info('CHANGELOG.md — not generated yet'));
  }

  // ── Output ────────────────────────────────────────────────────────

  const passCount = checks.filter((c) => c.status === 'pass').length;
  const warnCount = checks.filter((c) => c.status === 'warn').length;
  const failCount = checks.filter((c) => c.status === 'fail').length;
  const infoCount = checks.filter((c) => c.status === 'info').length;

  console.log('');
  console.log(chalk.cyan.bold('🏥 CDD Doctor'));
  console.log(chalk.dim(`  ${path.basename(targetDir)}`));
  console.log('');

  let lastSection = '';
  for (const c of checks) {
    let section = '';
    if (c.label === '' && c.status === 'pass') section = 'pass';
    else if (c.status === 'fail') section = 'fail';
    else if (c.status === 'warn') section = 'warn';
    else if (c.status === 'info') section = 'info';

    if (lastSection !== section && section !== '') {
      lastSection = section;
    }

    const icon =
      c.status === 'pass' ? chalk.green('✓') :
      c.status === 'warn' ? chalk.yellow('⚠') :
      c.status === 'fail' ? chalk.red('✗') :
      chalk.cyan('ℹ');
    const msg = c.status === 'pass' ? chalk.dim(c.message) : c.message;
    console.log(`  ${icon} ${msg}`);
  }

  console.log('');
  console.log(chalk.dim(`  ${'─'.repeat(40)}`));
  const summaryParts: string[] = [];
  if (passCount > 0) summaryParts.push(chalk.green(`${passCount} passed`));
  if (warnCount > 0) summaryParts.push(chalk.yellow(`${warnCount} warnings`));
  if (failCount > 0) summaryParts.push(chalk.red(`${failCount} failed`));
  if (infoCount > 0) summaryParts.push(chalk.cyan(`${infoCount} info`));
  console.log(`  ${summaryParts.join(' · ')}`);
  console.log('');

  if (recommendations.length > 0) {
    console.log(chalk.bold('  Next actions'));
    recommendations.forEach((message, index) => {
      console.log(`  ${index + 1}. ${message}`);
    });
    console.log('');
  }
}
