import * as fs from 'node:fs';
import * as path from 'node:path';
import chalk from 'chalk';
import { analyzeProject, analyzeSourceFiles } from '../core/analyzer.js';
import { generateArchitectureSpec, writeDocs } from '../core/generator.js';

export async function specCommand(
  dir: string,
  options: { output?: string; full?: boolean },
): Promise<void> {
  const targetDir = path.resolve(dir);
  const outputPath = options.output
    ? path.resolve(options.output)
    : path.join(targetDir, 'ARCHITECTURE.md');

  if (!fs.existsSync(targetDir)) {
    console.error(chalk.red(`Directory not found: ${targetDir}`));
    process.exit(1);
  }

  console.log(chalk.cyan('Analyzing code architecture...'));

  const project = analyzeProject(targetDir);
  const { functions, classes, interfaces, imports } = analyzeSourceFiles(targetDir);

  console.log(chalk.dim(`  ${functions.length} functions`));
  console.log(chalk.dim(`  ${classes.length} classes`));
  console.log(chalk.dim(`  ${interfaces.length} interfaces`));
  console.log(chalk.dim(`  ${imports.length} import relationships`));

  const spec = generateArchitectureSpec(project, functions, classes, interfaces, imports);

  writeDocs([{ filePath: outputPath, content: spec }]);

  console.log(chalk.green('✓ Architecture spec generated'));
  console.log(chalk.dim(`  Output: ${outputPath}`));
}
