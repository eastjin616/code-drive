import * as fs from 'node:fs';
import * as path from 'node:path';
import chalk from 'chalk';
import { analyzeProject, buildModuleTree } from '../core/analyzer.js';
import { generateArchitectureSpec, writeDocs } from '../core/generator.js';

export async function specCommand(
  dir: string,
  options: { output?: string },
): Promise<void> {
  const targetDir = path.resolve(dir);
  const outputPath = options.output
    ? path.resolve(options.output)
    : path.join(targetDir, 'ARCHITECTURE.md');

  if (!fs.existsSync(targetDir)) {
    console.error(chalk.red(`Directory not found: ${targetDir}`));
    process.exit(1);
  }

  console.log(chalk.cyan('Analyzing module structure...'));

  const project = analyzeProject(targetDir);
  const modules = buildModuleTree(targetDir, 'src');

  const spec = generateArchitectureSpec(modules, project);

  writeDocs([{ filePath: outputPath, content: spec }]);

  console.log(chalk.green('✓ Architecture spec generated'));
  console.log(chalk.dim(`  Output: ${outputPath}`));
}
