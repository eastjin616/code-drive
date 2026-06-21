import * as fs from 'node:fs';
import * as path from 'node:path';
import chalk from 'chalk';
import { verifyProject } from '../core/verify.js';
import type { VerifyCheckStatus } from '../core/verify.js';

export interface VerifyCommandOptions {
  readonly includeTests?: boolean;
  readonly json?: boolean;
}

function statusColor(status: VerifyCheckStatus): (message: string) => string {
  if (status === 'pass') return chalk.green;
  if (status === 'warn') return chalk.yellow;
  if (status === 'fail') return chalk.red;
  return chalk.cyan;
}

function statusIcon(status: VerifyCheckStatus): string {
  if (status === 'pass') return 'PASS';
  if (status === 'warn') return 'WARN';
  if (status === 'fail') return 'FAIL';
  return 'INFO';
}

export async function verifyCommand(
  dir: string,
  options: VerifyCommandOptions = {},
): Promise<void> {
  const targetDir = path.resolve(dir);
  if (!fs.existsSync(targetDir)) {
    throw new Error(`Directory not found: ${targetDir}`);
  }

  const result = verifyProject(targetDir, { includeTests: options.includeTests });
  process.exitCode = result.status === 'ready' ? undefined : 1;

  if (options.json) {
    console.log(JSON.stringify(result, null, 2));
    return;
  }

  const status =
    result.status === 'ready'
      ? chalk.green(result.status)
      : result.status === 'needs-sync'
        ? chalk.yellow(result.status)
        : chalk.red(result.status);

  console.log('');
  console.log(chalk.cyan.bold(`CDD Verify — ${result.projectName}`));
  console.log('');
  console.log(`Status: ${status}`);
  console.log('');
  console.log(chalk.bold('Checks'));
  for (const check of result.checks) {
    const color = statusColor(check.status);
    const target = check.target ? chalk.dim(` [${check.target}]`) : '';
    console.log(`  ${color(statusIcon(check.status))} ${check.message}${target}`);
  }

  if (result.nextActions.length > 0) {
    console.log('');
    console.log(chalk.bold('Next actions'));
    result.nextActions.forEach((action, index) => {
      console.log(`  ${index + 1}. ${action}`);
    });
  }
  console.log('');
}
