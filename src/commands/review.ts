import * as fs from 'node:fs';
import * as path from 'node:path';
import chalk from 'chalk';
import { analyzeAll } from '../core/analyzer.js';

interface ReviewFinding {
  severity: 'error' | 'warn' | 'info';
  rule: string;
  message: string;
  file?: string;
  line?: number;
}

// ─── CDD Review Rules ─────────────────────────────────────────────────

function reviewNaming(functions: ReturnType<typeof analyzeAll>['functions']): ReviewFinding[] {
  const findings: ReviewFinding[] = [];
  for (const fn of functions) {
    if (fn.name.startsWith('_') && fn.exportKind === 'export') {
      findings.push({
        severity: 'warn',
        rule: 'naming',
        message: `Exported function "${fn.name}" starts with underscore — likely internal naming leaked to public API.`,
        file: fn.file,
        line: fn.line,
      });
    }
    if (!fn.doc && fn.exportKind !== 'none' && !fn.name.startsWith('_')) {
      findings.push({
        severity: 'info',
        rule: 'documentation',
        message: `Exported function "${fn.name}" has no JSDoc/TSDoc comment.`,
        file: fn.file,
        line: fn.line,
      });
    }
  }
  return findings;
}

function reviewAnnotations(
  annotations: ReturnType<typeof analyzeAll>['annotations'],
): ReviewFinding[] {
  const findings: ReviewFinding[] = [];
  const todos = annotations.filter((a) => a.tag === 'todo');
  const fixmes = annotations.filter((a) => a.tag === 'fixme');
  const hacks = annotations.filter((a) => a.tag === 'hack');

  for (const ann of [...todos, ...fixmes, ...hacks]) {
    findings.push({
      severity: 'warn',
      rule: 'code-health',
      message: `${ann.tag.toUpperCase()}: ${ann.content}`,
      file: ann.file,
      line: ann.line,
    });
  }
  return findings;
}

function reviewDependencies(imports: ReturnType<typeof analyzeAll>['imports']): ReviewFinding[] {
  const findings: ReviewFinding[] = [];
  const localImports = imports.filter((i) => i.to.startsWith('.') || i.to.startsWith('/'));
  const extImports = imports.filter((i) => !i.to.startsWith('.') && !i.to.startsWith('/'));

  // Check for excessive external dependencies in small modules
  if (extImports.length > 0 && localImports.length === 0) {
    findings.push({
      severity: 'warn',
      rule: 'dependency-management',
      message: `File "${imports[0]?.from ?? '?'}" has ${extImports.length} external imports but no local imports — may indicate missing abstraction layer.`,
    });
  }

  // Circular dependency detection
  const pairs = new Set<string>();
  for (const edge of imports) {
    const key = `${edge.from}->${edge.to}`;
    if (pairs.has(`${edge.to}->${edge.from}`)) {
      findings.push({
        severity: 'error',
        rule: 'circular-dependency',
        message: `Circular dependency detected between "${edge.from}" and "${edge.to}".`,
        file: edge.from,
      });
    }
    pairs.add(key);
  }

  return findings;
}

function reviewSourceSize(sourceFiles: string[], rootDir: string): ReviewFinding[] {
  const findings: ReviewFinding[] = [];
  for (const file of sourceFiles.slice(0, 100)) {
    try {
      const fullPath = path.join(rootDir, file);
      const lines = fs.readFileSync(fullPath, 'utf-8').split('\n').length;

      if (lines > 500) {
        findings.push({
          severity: 'warn',
          rule: 'module-size',
          message: `File "${file}" has ${lines} lines (recommended: <500). Consider splitting.`,
          file,
        });
      }
    } catch {
      // skip
    }
  }
  return findings;
}

// ─── Command ──────────────────────────────────────────────────────────

export async function reviewCommand(dir: string, options: { output?: string }): Promise<void> {
  const targetDir = path.resolve(dir);

  if (!fs.existsSync(targetDir)) {
    throw new Error(`Directory not found: ${targetDir}`);
  }

  console.log(chalk.cyan('Running CDD review...'));

  const { project, functions, classes, interfaces, imports, annotations } = analyzeAll(targetDir);

  const findings: ReviewFinding[] = [
    ...reviewNaming(functions),
    ...reviewAnnotations(annotations),
    ...reviewDependencies(imports),
    ...reviewSourceSize(project.sourceFiles, targetDir),
  ];

  // ── Summary ──
  const errors = findings.filter((f) => f.severity === 'error');
  const warnings = findings.filter((f) => f.severity === 'warn');
  const infos = findings.filter((f) => f.severity === 'info');

  console.log('');
  console.log(chalk.bold(`CDD Review — ${project.name} v${project.version}`));
  console.log(
    chalk.dim(
      `  ${functions.length} functions, ${classes.length} classes, ${interfaces.length} interfaces`,
    ),
  );
  console.log('');

  if (findings.length === 0) {
    console.log(chalk.green('✓ No issues found. Your code follows CDD principles!'));
    return;
  }

  if (errors.length > 0) {
    console.log(chalk.bold.red(`Errors (${errors.length}):`));
    for (const e of errors) {
      const loc = e.file ? chalk.dim(` [${e.file}${e.line ? `:${e.line}` : ''}]`) : '';
      console.log(`  ${chalk.red('✖')} ${e.message}${loc}`);
    }
    console.log('');
  }

  if (warnings.length > 0) {
    console.log(chalk.bold.yellow(`Warnings (${warnings.length}):`));
    for (const w of warnings) {
      const loc = w.file ? chalk.dim(` [${w.file}${w.line ? `:${w.line}` : ''}]`) : '';
      console.log(`  ${chalk.yellow('⚠')} ${w.message}${loc}`);
    }
    console.log('');
  }

  if (infos.length > 0) {
    console.log(chalk.bold.cyan(`Info (${infos.length}):`));
    for (const i of infos) {
      const loc = i.file ? chalk.dim(` [${i.file}${i.line ? `:${i.line}` : ''}]`) : '';
      console.log(`  ${chalk.cyan('ℹ')} ${i.message}${loc}`);
    }
    console.log('');
  }

  if (options.output) {
    const outputPath = path.resolve(options.output);
    const reportLines: string[] = [
      `# CDD Review Report — ${project.name}`,
      '',
      `**${findings.length} findings:** ${errors.length} errors, ${warnings.length} warnings, ${infos.length} info`,
      '',
      ...findings.map(
        (f) =>
          `- [${f.severity.toUpperCase()}] ${f.rule}: ${f.message}${f.file ? ` (${f.file}${f.line ? `:${f.line}` : ''})` : ''}`,
      ),
      '',
      '*Generated by code-drive*',
    ];
    fs.writeFileSync(outputPath, reportLines.join('\n'), 'utf-8');
    console.log(chalk.dim(`  Report saved: ${outputPath}`));
  }
}
