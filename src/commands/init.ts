import * as fs from 'node:fs';
import * as path from 'node:path';
import chalk from 'chalk';
import { analyzeProject } from '../core/analyzer.js';
import { installAiContext } from '../core/ai-context.js';
import { generateCddConfig } from '../core/generator.js';

export async function initCommand(dir: string, options: { force?: boolean }): Promise<void> {
  const targetDir = path.resolve(dir);
  const configPath = path.join(targetDir, '.cdd', 'config.json');

  if (!fs.existsSync(targetDir)) {
    throw new Error(`Directory not found: ${targetDir}`);
  }

  if (fs.existsSync(configPath) && !options.force) {
    console.log(chalk.yellow('CDD already initialized in this project.'));
    console.log(chalk.yellow('Use --force to reinitialize.'));
    return;
  }

  // Create .cdd directory
  const cddDir = path.join(targetDir, '.cdd');
  fs.mkdirSync(cddDir, { recursive: true });

  // Analyze project
  const project = analyzeProject(targetDir);
  const config = generateCddConfig(targetDir);

  // Write config
  fs.writeFileSync(configPath, JSON.stringify(config, null, 2), 'utf-8');
  const aiContext = installAiContext(targetDir);

  console.log(chalk.green('✓ CDD initialized'));
  console.log(chalk.dim(`  Project: ${project.name}`));
  console.log(chalk.dim(`  Language: ${project.language}`));
  console.log(chalk.dim(`  Source files: ${project.sourceFiles.length}`));
  console.log(chalk.dim(`  Config: ${configPath}`));
  console.log(chalk.dim(`  AI context: ${aiContext.targetFiles.join(', ')}`));
  console.log('');
  console.log(chalk.cyan('Next steps:'));
  console.log(chalk.cyan('  $ cdd docgen    Generate documentation from code'));
  console.log(chalk.cyan('  $ cdd spec      Extract architecture spec'));
  console.log(chalk.cyan('  $ cdd sync      Generate docs/spec/design/changelog'));
}
