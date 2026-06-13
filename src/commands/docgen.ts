import * as fs from 'node:fs';
import * as path from 'node:path';
import chalk from 'chalk';
import { analyzeProject, extractAnnotations } from '../core/analyzer.js';
import { generateReadmeDocs, writeDocs } from '../core/generator.js';

export async function docgenCommand(
  dir: string,
  options: { output?: string; watch?: boolean },
): Promise<void> {
  const targetDir = path.resolve(dir);
  const outputDir = options.output ? path.resolve(options.output) : path.join(targetDir, 'docs');

  if (!fs.existsSync(targetDir)) {
    console.error(chalk.red(`Directory not found: ${targetDir}`));
    process.exit(1);
  }

  console.log(chalk.cyan('Scanning codebase...'));

  const project = analyzeProject(targetDir);
  const annotations = extractAnnotations(targetDir);

  console.log(chalk.dim(`  Found ${project.sourceFiles.length} source files`));
  console.log(chalk.dim(`  Found ${annotations.length} code annotations`));

  const readme = generateReadmeDocs(project, annotations);

  const results = [
    {
      filePath: path.join(outputDir, 'README.md'),
      content: readme,
    },
  ];

  writeDocs(results);

  console.log(chalk.green('✓ Documentation generated'));
  console.log(chalk.dim(`  Output: ${outputDir}/`));

  if (options.watch) {
    console.log(chalk.yellow('Watch mode is not yet implemented.'));
    console.log(chalk.yellow('Run without --watch for one-time generation.'));
  }
}
