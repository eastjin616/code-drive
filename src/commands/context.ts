import * as fs from 'node:fs';
import * as path from 'node:path';
import chalk from 'chalk';
import { analyzeAll, analyzeProject, analyzeSourceFiles } from '../core/analyzer.js';
import type { ImportEdge } from '../core/analyzer.js';

function fmt(num: number): string {
  return num.toString().padStart(3);
}

function buildReverseImports(imports: ImportEdge[]): Map<string, { file: string; symbols: string[] }[]> {
  const map = new Map<string, { file: string; symbols: string[] }[]>();
  for (const edge of imports) {
    const from = path.normalize(edge.from);
    const to = path.normalize(edge.to.replace(/^\.\//, ''));
    if (!map.has(to)) map.set(to, []);
    map.get(to)!.push({ file: from, symbols: edge.symbols });
  }
  return map;
}

function resolveActualPath(targetDir: string, raw: string): string | null {
  // Try exact match
  const exact = path.join(targetDir, raw);
  if (fs.existsSync(exact)) return exact;

  // Try with extensions
  for (const ext of ['.ts', '.tsx', '.js', '.jsx', '.mjs']) {
    const withExt = exact + ext;
    if (fs.existsSync(withExt)) return withExt;
    // Try /index.ts etc
    const index = path.join(exact, `index${ext}`);
    if (fs.existsSync(index)) return index;
  }

  return null;
}

// ─── Full project context ─────────────────────────────────────────────

function projectContext(targetDir: string, relativeDir: string): string {
  const project = analyzeProject(targetDir);
  const { functions, classes, interfaces, imports, annotations } = analyzeAll(targetDir);
  const reverseImports = buildReverseImports(imports);

  const lines: string[] = [];
  lines.push(`📁 Project: ${project.name} v${project.version} (${project.language})`);
  lines.push(`📂 ${project.sourceFiles.length} source files`);
  lines.push(`   ${functions.length} functions · ${classes.length} classes · ${interfaces.length} interfaces`);
  lines.push(`   ${imports.length} imports · ${project.dependencies.length} dependencies`);
  lines.push('');

  // Directory tree
  const dirs = new Set<string>();
  const fileMap = new Map<string, string[]>();
  for (const f of project.sourceFiles) {
    const dir = path.dirname(f);
    dirs.add(dir);
    if (!fileMap.has(dir)) fileMap.set(dir, []);
    fileMap.get(dir)!.push(path.basename(f));
  }

  lines.push('── Directory Structure ──');
  for (const dir of [...dirs].sort()) {
    const files = fileMap.get(dir) || [];
    const prefix = dir === '.' ? '' : dir + '/';
    lines.push(`  ${dir}/`);
    for (const file of files) {
      const fullPath = path.join(targetDir, prefix + file);
      let lineCount = 0;
      try {
        lineCount = fs.readFileSync(fullPath, 'utf-8').split('\n').length;
      } catch {}
      const fnCount = functions.filter(f => f.file === (prefix + file)).length;
      const badge = lineCount > 0 ? chalk.dim(` (${lineCount} lines${fnCount > 0 ? `, ${fnCount} fn` : ''})`) : '';
      lines.push(`    ${file}${badge}`);
    }
  }
  lines.push('');

  // Key functions
  const exported = functions.filter(f => f.exportKind !== 'none');
  if (exported.length > 0) {
    lines.push('── Exported Functions ──');
    for (const fn of exported.slice(0, 20)) {
      const params = fn.params ? `(${fn.params.join(', ')})` : '()';
      const ret = fn.returnType ? `: ${fn.returnType}` : '';
      const doc = fn.doc ? chalk.dim(`  ${fn.doc}`) : '';
      lines.push(`  ${fn.name}${params}${ret}  ${chalk.dim(fn.file)}${doc ? ' ' + doc : ''}`);
    }
    if (exported.length > 20) {
      lines.push(chalk.dim(`  ... and ${exported.length - 20} more`));
    }
    lines.push('');
  }

  // Key classes
  if (classes.length > 0) {
    lines.push('── Classes ──');
    for (const cls of classes) {
      const methods = cls.methods?.length ? ` [methods: ${cls.methods.join(', ')}]` : '';
      lines.push(`  ${cls.name}${cls.extendsClause ? ` extends ${cls.extendsClause}` : ''}  ${chalk.dim(cls.file)}${methods}`);
    }
    lines.push('');
  }

  // Dependencies
  if (project.dependencies.length > 0) {
    lines.push('── Dependencies ──');
    lines.push(`  ${project.dependencies.join(', ')}`);
    lines.push('');
  }

  return lines.join('\n');
}

// ─── Single file context ──────────────────────────────────────────────

function fileContext(targetDir: string, filePath: string): string {
  const { functions, classes, interfaces, imports } = analyzeSourceFiles(targetDir);
  const reverseImports = buildReverseImports(imports);

  const relativeFile = path.relative(targetDir, filePath).replace(/\\/g, '/');

  const lines: string[] = [];
  lines.push(`📄 ${relativeFile}`);
  lines.push('');

  // File info
  try {
    const content = fs.readFileSync(filePath, 'utf-8');
    const lineCount = content.split('\n').length;
    lines.push(`   ${lineCount} lines`);
  } catch {}
  lines.push('');

  // Exports
  const fileFunctions = functions.filter(f => f.file === relativeFile);
  const fileClasses = classes.filter(c => c.file === relativeFile);
  const fileInterfaces = interfaces.filter(i => i.file === relativeFile);

  if (fileFunctions.length > 0) {
    lines.push('── Functions ──');
    for (const fn of fileFunctions) {
      const exported = fn.exportKind !== 'none' ? chalk.cyan('export ') : '';
      const params = fn.params ? `(${fn.params.join(', ')})` : '()';
      const ret = fn.returnType ? `: ${fn.returnType}` : '';
      const doc = fn.doc ? chalk.dim(`  // ${fn.doc}`) : '';
      lines.push(`  ${exported}${fn.name}${params}${ret}  ${doc}`);
    }
    lines.push('');
  }

  if (fileClasses.length > 0) {
    lines.push('── Classes ──');
    for (const cls of fileClasses) {
      const exported = cls.exportKind !== 'none' ? chalk.cyan('export ') : '';
      lines.push(`  ${exported}${cls.name}`);
      if (cls.methods?.length) {
        lines.push(`    methods: ${cls.methods.join(', ')}`);
      }
      if (cls.properties?.length) {
        lines.push(`    properties: ${cls.properties.join(', ')}`);
      }
    }
    lines.push('');
  }

  if (fileInterfaces.length > 0) {
    lines.push('── Interfaces ──');
    for (const iface of fileInterfaces) {
      lines.push(`  ${iface.name}`);
    }
    lines.push('');
  }

  // Imports
  const fileImports = imports.filter(i => i.from === relativeFile);
  if (fileImports.length > 0) {
    lines.push('── Imports ──');
    for (const imp of fileImports) {
      const symbols = imp.symbols.length > 0 ? ` { ${imp.symbols.join(', ')} }` : '';
      lines.push(`  ${imp.to}${symbols}`);
    }
    lines.push('');
  }

  // Dependents (reverse imports)
  const name = path.basename(relativeFile, path.extname(relativeFile));
  const dependents = reverseImports.get(name) || reverseImports.get(relativeFile) || [];
  if (dependents.length > 0) {
    lines.push('── Imported By ──');
    for (const dep of dependents) {
      lines.push(`  ${dep.file}`);
    }
    lines.push('');
  }

  return lines.join('\n');
}

// ─── Command ──────────────────────────────────────────────────────────

export async function contextCommand(dir: string, options: { file?: string }): Promise<void> {
  const targetDir = path.resolve(dir);

  if (!fs.existsSync(targetDir)) {
    console.error(chalk.red(`Directory not found: ${targetDir}`));
    process.exit(1);
  }

  if (options.file) {
    const filePath = resolveActualPath(targetDir, options.file);
    if (!filePath) {
      console.error(chalk.red(`File not found: ${options.file}`));
      process.exit(1);
    }
    console.log(fileContext(targetDir, filePath));
  } else {
    console.log(projectContext(targetDir, dir));
  }
}
