import * as fs from 'node:fs';
import * as path from 'node:path';
import chalk from 'chalk';
import { extractDesignTokens } from '../core/design-extractor.js';
import { generateDesignDoc, writeDocs, mergeWithExisting } from '../core/design-generator.js';
import { analyzeProject } from '../core/analyzer.js';
import { isProjectDirectory } from '../core/project-detector.js';

export async function designCommand(
  dir: string,
  options: { output?: string },
): Promise<void> {
  const targetDir = path.resolve(dir);
  const outputPath = options.output
    ? path.resolve(options.output)
    : path.join(targetDir, 'DESIGN.md');

  if (!fs.existsSync(targetDir)) {
    throw new Error(`Directory not found: ${targetDir}`);
  }

  console.log(chalk.cyan('Scanning for design tokens...'));

  const project = analyzeProject(targetDir);
  if (!isProjectDirectory(targetDir, project.sourceFiles)) {
    console.log(chalk.yellow('No project-level sources found; skipping DESIGN.md generation.'));
    return;
  }

  const tokens = extractDesignTokens(targetDir, project.name);

  // Summary
  console.log(chalk.dim(`  ${tokens.colors.length} colors`));
  console.log(chalk.dim(`  ${tokens.typography.length} typography entries`));
  console.log(chalk.dim(`  ${tokens.spacing.length} spacing tokens`));
  console.log(chalk.dim(`  ${tokens.borderRadius.length} border-radius tokens`));
  console.log(chalk.dim(`  ${tokens.shadows.length} shadow tokens`));
  console.log(chalk.dim(`  ${tokens.styleUsage.length} style rule groups`));
  if (tokens.hasTailwind) console.log(chalk.dim('  Tailwind CSS config detected'));

  const doc = generateDesignDoc(tokens);
  const merged = mergeWithExisting(doc, outputPath);
  writeDocs([{ filePath: outputPath, content: merged }]);

  console.log(chalk.green('✓ Design spec generated'));
  console.log(chalk.dim(`  Output: ${outputPath}`));
}
