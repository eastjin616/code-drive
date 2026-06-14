import * as fs from 'node:fs';
import * as path from 'node:path';
import chalk from 'chalk';
import { watch } from 'chokidar';
import { analyzeProject, analyzeSourceFiles, extractAnnotations } from '../core/analyzer.js';
import type { AnalysisScopeOptions } from '../core/analysis-scope.js';
import { generateReadmeDocs, generateApiDocs, writeDocs } from '../core/generator.js';
import type { DocResult } from '../core/generator.js';

// ─── Doc Generation ───────────────────────────────────────────────────

export function generateDocs(
  targetDir: string,
  outputDir: string,
  options: AnalysisScopeOptions = {},
): DocResult[] {
  const project = analyzeProject(targetDir, options);
  const { functions, classes, interfaces } = analyzeSourceFiles(targetDir, options);
  const annotations = extractAnnotations(targetDir, options);

  // README
  const readme = generateReadmeDocs(project, functions, classes, interfaces, annotations);

  const results: DocResult[] = [{ filePath: path.join(outputDir, 'README.md'), content: readme }];

  // Per-file API docs
  const filesWithExports = new Set<string>();
  for (const fn of functions) {
    if (fn.exportKind !== 'none') filesWithExports.add(fn.file);
  }
  for (const cls of classes) {
    if (cls.exportKind !== 'none') filesWithExports.add(cls.file);
  }
  for (const iface of interfaces) {
    if (iface.exportKind !== 'none') filesWithExports.add(iface.file);
  }

  const apiDir = path.join(outputDir, 'api');
  for (const file of filesWithExports) {
    const fileFunctions = functions.filter((f) => f.file === file);
    const fileClasses = classes.filter((c) => c.file === file);
    const fileInterfaces = interfaces.filter((i) => i.file === file);

    const apiDoc = generateApiDocs(file, fileFunctions, fileClasses, fileInterfaces);

    const docFileName = file.replace(/\.(ts|tsx|js|jsx)$/, '.md').replace(/\//g, '--');
    results.push({
      filePath: path.join(apiDir, docFileName),
      content: apiDoc,
    });
  }

  return results;
}

// ─── Command ──────────────────────────────────────────────────────────

export async function docgenCommand(
  dir: string,
  options: { output?: string; watch?: boolean; includeTests?: boolean },
): Promise<void> {
  const targetDir = path.resolve(dir);
  const outputDir = options.output ? path.resolve(options.output) : path.join(targetDir, 'docs');
  const analysisOptions: AnalysisScopeOptions = { includeTests: options.includeTests };

  if (!fs.existsSync(targetDir)) {
    throw new Error(`Directory not found: ${targetDir}`);
  }

  // Initial generation
  console.log(chalk.cyan('Scanning codebase...'));

  const results = generateDocs(targetDir, outputDir, analysisOptions);
  writeDocs(results);

  const project = analyzeProject(targetDir, analysisOptions);
  const { functions, classes, interfaces } = analyzeSourceFiles(targetDir, analysisOptions);
  const annotations = extractAnnotations(targetDir, analysisOptions);

  console.log(
    chalk.dim(
      `  ${project.sourceFiles.length} source files, ` +
        `${functions.length} functions, ${classes.length} classes, ` +
        `${interfaces.length} interfaces, ${annotations.length} annotations`,
    ),
  );
  console.log(chalk.green(`✓ ${results.length} documentation files generated`));
  console.log(chalk.dim(`  Output: ${outputDir}/`));

  // Watch mode
  if (options.watch) {
    const sourcePatterns = [
      path.join(targetDir, 'src/**/*.{ts,tsx,js,jsx}'),
      path.join(targetDir, '!src/node_modules/**'),
    ];

    const watcher = watch(sourcePatterns, {
      ignoreInitial: true,
      ignored: /node_modules|dist|\.git/,
    });

    const generate = () => {
      const start = Date.now();
      console.log(chalk.dim('\nChange detected, regenerating...'));
      const newResults = generateDocs(targetDir, outputDir, analysisOptions);
      writeDocs(newResults);
      const elapsed = Date.now() - start;
      console.log(chalk.green(`✓ Regenerated ${newResults.length} files (${elapsed}ms)`));
    };

    watcher.on('change', generate);
    watcher.on('add', generate);
    watcher.on('unlink', generate);

    console.log(chalk.cyan('\nWatching for file changes...'));
    console.log(chalk.dim('  Press Ctrl+C to stop.\n'));

    // Keep alive — silence the floating promise lint
    await new Promise<void>((resolve) => {
      process.on('SIGINT', () => {
        watcher.close().then(() => {
          console.log(chalk.cyan('\nWatch mode stopped.'));
          resolve();
        });
      });
      process.on('SIGTERM', () => {
        watcher.close().then(() => {
          resolve();
        });
      });
    });
  }
}
