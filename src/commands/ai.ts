import * as fs from 'node:fs';
import * as path from 'node:path';
import chalk from 'chalk';
import { installAiContext } from '../core/ai-context.js';

export async function aiInstallCommand(dir: string): Promise<void> {
  const targetDir = path.resolve(dir);

  if (!fs.existsSync(targetDir)) {
    throw new Error(`Directory not found: ${targetDir}`);
  }

  const result = installAiContext(targetDir);
  const files = result.targetFiles.join(', ');

  console.log(chalk.green('✓ CDD AI context routing installed'));
  console.log(chalk.dim(`  Files: ${files}`));
  if (result.createdFiles.length > 0) {
    console.log(chalk.dim(`  Created: ${result.createdFiles.join(', ')}`));
  }
  if (result.updatedFiles.length > 0) {
    console.log(chalk.dim(`  Updated: ${result.updatedFiles.join(', ')}`));
  }
}
