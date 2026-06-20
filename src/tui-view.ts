import chalk from 'chalk';
import type { TuiStatus } from './tui-status.js';
import { commandTitle } from './tui-labels.js';
import { statusSummaryParts } from './tui-status.js';

function statusLabel(status: TuiStatus['status']): string {
  if (status === 'ready') return chalk.green('준비 완료');
  if (status === 'needs-sync') return chalk.yellow('문서 동기화 필요');
  return chalk.red('확인 필요');
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
  console.log(`  ${chalk.dim('상태')}         ${statusLabel(status.status)}`);
  console.log(`  ${chalk.dim('검사')}         ${statusSummaryParts(status.summary).join(' · ') || '검사 없음'}`);
  console.log(`  ${chalk.dim('추천')}         ${commandTitle(status.recommendedCommand)}`);

  if (status.artifactsNeedingSync.length > 0) {
    console.log(`  ${chalk.dim('산출물')}       ${status.artifactsNeedingSync.join(', ')}`);
  }

  if (status.nextActions.length > 0) {
    console.log(chalk.dim('  다음 작업'));
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
