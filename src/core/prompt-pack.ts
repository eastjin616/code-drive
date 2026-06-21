import * as fs from 'node:fs';
import * as path from 'node:path';
import { analyzeProject, analyzeSourceFiles } from './analyzer.js';
import { getSourceFiles } from './analysis-scope.js';
import type { AnalysisScopeOptions } from './analysis-scope.js';

export interface PromptPackOptions extends AnalysisScopeOptions {
  readonly file?: string;
}

const IMPORTANT_ARTIFACTS = [
  'README.md',
  'docs/README.md',
  'ARCHITECTURE.md',
  'DESIGN.md',
  'CHANGELOG.md',
  'AGENTS.md',
  'CODEX.md',
  'CLAUDE.md',
  'OPENCODE.md',
] as const;

function resolveActualPath(targetDir: string, raw: string): string | null {
  const exact = path.join(targetDir, raw);
  if (fs.existsSync(exact)) return exact;

  for (const ext of ['.ts', '.tsx', '.js', '.jsx', '.mjs']) {
    const withExt = exact + ext;
    if (fs.existsSync(withExt)) return withExt;
    const index = path.join(exact, `index${ext}`);
    if (fs.existsSync(index)) return index;
  }

  return null;
}

function existingArtifacts(targetDir: string): string[] {
  return IMPORTANT_ARTIFACTS.filter((artifact) => fs.existsSync(path.join(targetDir, artifact)));
}

function generatedArtifactLines(targetDir: string): string[] {
  const artifacts = [
    { label: '.cdd/config.json', path: '.cdd/config.json' },
    { label: 'docs/README.md', path: 'docs/README.md' },
    { label: 'ARCHITECTURE.md', path: 'ARCHITECTURE.md' },
    { label: 'DESIGN.md', path: 'DESIGN.md' },
    { label: 'CHANGELOG.md', path: 'CHANGELOG.md' },
  ];

  return artifacts.map((artifact) => {
    const status = fs.existsSync(path.join(targetDir, artifact.path)) ? 'generated' : 'missing';
    return `- ${artifact.label}: ${status}`;
  });
}

function formatList(items: readonly string[]): string[] {
  if (items.length === 0) return ['- None detected'];
  return items.map((item) => `- ${item}`);
}

function focusFileSection(targetDir: string, options: PromptPackOptions): string[] {
  if (!options.file) return [];

  const filePath = resolveActualPath(targetDir, options.file);
  if (!filePath) {
    throw new Error(`File not found: ${options.file}`);
  }

  const relativeFile = path.relative(targetDir, filePath).replace(/\\/g, '/');
  const scopedFiles = getSourceFiles(targetDir, '{ts,tsx,js,jsx,mjs}', options);
  if (!scopedFiles.includes(relativeFile)) {
    throw new Error(`File not found: ${options.file}`);
  }

  const content = fs.readFileSync(filePath, 'utf-8');
  const lineCount = content.split('\n').length;
  const analysis = analyzeSourceFiles(targetDir, options);
  const functions = analysis.functions.filter((fn) => fn.file === relativeFile);
  const classes = analysis.classes.filter((cls) => cls.file === relativeFile);
  const interfaces = analysis.interfaces.filter((iface) => iface.file === relativeFile);
  const imports = analysis.imports.filter((edge) => edge.from === relativeFile);

  const lines = ['', `## Focus File: ${relativeFile}`, '', `- Lines: ${lineCount}`];

  if (functions.length > 0) {
    lines.push('- Functions:');
    for (const fn of functions) {
      const params = fn.params?.join(', ') ?? '';
      const returnType = fn.returnType ? `: ${fn.returnType}` : '';
      lines.push(`  - ${fn.name}(${params})${returnType}`);
    }
  }

  if (classes.length > 0) {
    lines.push('- Classes:');
    for (const cls of classes) lines.push(`  - ${cls.name}`);
  }

  if (interfaces.length > 0) {
    lines.push('- Interfaces:');
    for (const iface of interfaces) lines.push(`  - ${iface.name}`);
  }

  if (imports.length > 0) {
    lines.push('- Imports:');
    for (const edge of imports) lines.push(`  - ${edge.to}`);
  }

  return lines;
}

export function generatePromptPack(projectDir: string, options: PromptPackOptions = {}): string {
  const targetDir = path.resolve(projectDir);
  if (!fs.existsSync(targetDir)) {
    throw new Error(`Directory not found: ${targetDir}`);
  }

  const project = analyzeProject(targetDir, options);
  const artifacts = existingArtifacts(targetDir);
  const dependencies = project.dependencies.length > 0 ? project.dependencies.join(', ') : 'none detected';
  const entryPoints = project.entryPoints.length > 0 ? project.entryPoints.join(', ') : 'none detected';

  const lines = [
    '# Copy-Paste AI Prompt Pack',
    '',
    'Use this prompt in ChatGPT, Claude, Gemini, or another AI chat when the tool cannot automatically read repository Markdown files.',
    '',
    'You are helping me understand, improve, or plan work in this codebase. Use the project context below, stay grounded in the listed files, and ask for missing file contents instead of inventing APIs.',
    '',
    '## Project',
    '',
    `Project: ${project.name} v${project.version}`,
    `Language: ${project.language}`,
    `Source files: ${project.sourceFiles.length}`,
    `Entry points: ${entryPoints}`,
    `Dependencies: ${dependencies}`,
    '',
    '## Goal',
    '',
    'Goal: <describe what you want the AI to help with>',
    '',
    '## Important Context Files',
    '',
    ...formatList(artifacts),
    '',
    'If you can attach or paste files, prioritize README.md, ARCHITECTURE.md, CHANGELOG.md, docs/README.md, and the source files related to your question.',
    '',
    '## Generated Code Drive Artifacts',
    '',
    ...generatedArtifactLines(targetDir),
    '',
    '## Constraints',
    '',
    '- Code is the source of truth.',
    '- Generated docs are context, not final authority.',
    '- Do not invent functions, commands, files, or APIs not shown in the provided context.',
    '- If the task requires implementation, propose a small testable plan before changing code.',
    ...focusFileSection(targetDir, options),
    '',
    '## Useful Questions',
    '',
    '1. Explain this project to me as a new maintainer.',
    '2. What files should I paste next for this task?',
    '3. Find risky or stale parts of the architecture.',
    '4. Turn my goal into a small implementation plan with tests.',
    options.file ? '5. Review this file in the context of the project.' : '5. Suggest the next high-leverage improvement.',
    '',
  ];

  return lines.join('\n');
}
