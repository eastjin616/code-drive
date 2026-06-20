import chalk from 'chalk';
import type { TuiStatus } from './tui-status.js';
import { commandTitle } from './tui-labels.js';
import { statusSummaryParts } from './tui-status.js';

function statusLabel(status: TuiStatus['status']): string {
  if (status === 'ready') return chalk.green('ready');
  if (status === 'needs-sync') return chalk.yellow('needs-sync');
  return chalk.red('needs-attention');
}

export function showBanner(): void {
  console.log('');
  console.log(chalk.cyan.bold('    ██████╗██████╗ ██████╗ '));
  console.log(chalk.cyan.bold('   ██╔════╝██╔══██╗██╔══██╗'));
  console.log(chalk.cyan.bold('   ██║     ██║  ██║██║  ██║'));
  console.log(chalk.cyan.bold('   ██║     ██║  ██║██║  ██║'));
  console.log(chalk.cyan.bold('   ╚██████╗██████╔╝██████╔╝'));
  console.log(chalk.cyan.bold('    ╚═════╝╚═════╝ ╚═════╝ '));
  console.log(chalk.dim('   Code-Driven Development'));
  console.log('');
}

export function showDashboard(status: TuiStatus): void {
  console.log(chalk.bold('Project dashboard'));
  console.log(`  ${chalk.dim('Project')}      ${status.projectName}`);
  console.log(`  ${chalk.dim('Status')}       ${statusLabel(status.status)}`);
  console.log(`  ${chalk.dim('Checks')}       ${statusSummaryParts(status.summary).join(' · ') || '0 checks'}`);
  console.log(`  ${chalk.dim('Recommended')}  ${commandTitle(status.recommendedCommand)}`);

  if (status.artifactsNeedingSync.length > 0) {
    console.log(`  ${chalk.dim('Artifacts')}    ${status.artifactsNeedingSync.join(', ')}`);
  }

  if (status.nextActions.length > 0) {
    console.log(chalk.dim('  Next actions'));
    for (const action of status.nextActions.slice(0, 3)) {
      console.log(`    - ${action}`);
    }
  }

  console.log('');
}

export function showDashboardError(error: unknown): void {
  console.log(chalk.yellow('Project dashboard unavailable'));
  console.log(chalk.dim(`  ${String(error)}`));
  console.log('');
}
