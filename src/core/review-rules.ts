import * as fs from 'node:fs';
import * as path from 'node:path';
import { analyzeAll } from './analyzer.js';
import type { AnalysisScopeOptions } from './analysis-scope.js';

export interface ReviewFinding {
  readonly severity: 'error' | 'warn' | 'info';
  readonly rule: string;
  readonly message: string;
  readonly file?: string;
  readonly line?: number;
}

export interface ReviewSummary {
  readonly projectName: string;
  readonly version: string;
  readonly functionCount: number;
  readonly classCount: number;
  readonly interfaceCount: number;
  readonly findings: readonly ReviewFinding[];
}

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

  if (extImports.length > 0 && localImports.length === 0) {
    findings.push({
      severity: 'warn',
      rule: 'dependency-management',
      message: `File "${imports[0]?.from ?? '?'}" has ${extImports.length} external imports but no local imports — may indicate missing abstraction layer.`,
    });
  }

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

function reviewSourceSize(sourceFiles: readonly string[], rootDir: string): ReviewFinding[] {
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
      continue;
    }
  }
  return findings;
}

export function collectReviewFindings(
  targetDir: string,
  options: AnalysisScopeOptions = {},
): ReviewSummary {
  const { project, functions, classes, interfaces, imports, annotations } = analyzeAll(targetDir, options);
  const findings: ReviewFinding[] = [
    ...reviewNaming(functions),
    ...reviewAnnotations(annotations),
    ...reviewDependencies(imports),
    ...reviewSourceSize(project.sourceFiles, targetDir),
  ];

  return {
    projectName: project.name,
    version: project.version,
    functionCount: functions.length,
    classCount: classes.length,
    interfaceCount: interfaces.length,
    findings,
  };
}
