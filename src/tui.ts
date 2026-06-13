import * as fs from 'node:fs';
import * as path from 'node:path';
import chalk from 'chalk';
import { intro, outro, select, spinner, text, cancel, isCancel } from '@clack/prompts';
import { initCommand } from './commands/init.js';
import { docgenCommand } from './commands/docgen.js';
import { specCommand } from './commands/spec.js';
import { reviewCommand } from './commands/review.js';
import { uninstallCommand } from './commands/uninstall.js';

// ─── Banner ───────────────────────────────────────────────────────────

function showBanner(): void {
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

// ─── Helpers ──────────────────────────────────────────────────────────

function resolveDir(input: string | symbol): string {
  if (typeof input !== 'string') return '.';
  return input.trim() || '.';
}

// ─── TUI ──────────────────────────────────────────────────────────────

export async function runTUI(): Promise<void> {
  console.clear();
  showBanner();

  while (true) {
    const command = await select({
      message: '실행할 명령어를 선택하세요',
      options: [
        { value: 'init', label: 'init', hint: 'CDD 설정 초기화' },
        { value: 'docgen', label: 'docgen', hint: '코드에서 문서 자동 생성' },
        { value: 'spec', label: 'spec', hint: '아키텍처 스펙 추출' },
        { value: 'review', label: 'review', hint: 'CDD 원칙 코드 감사' },
        { value: 'uninstall', label: 'uninstall', hint: 'CDD 아티팩트 제거' },
        { value: 'exit', label: 'exit', hint: '종료' },
      ],
    });

    if (isCancel(command) || command === 'exit') {
      cancel('CDD를 종료합니다.');
      process.exit(0);
    }

    const dir = await text({
      message: '대상 디렉토리',
      placeholder: '.',
      defaultValue: '.',
    });

    if (isCancel(dir)) continue;

    const targetDir = path.resolve(resolveDir(dir));
    if (!fs.existsSync(targetDir)) {
      console.log(chalk.red(`  ✖ 디렉토리를 찾을 수 없음: ${targetDir}`));
      continue;
    }

    console.log('');

    switch (command) {
      case 'init': {
        const force = await select({
          message: '기존 설정 덮어쓰기?',
          options: [
            { value: false, label: '아니오' },
            { value: true, label: '예 (--force)' },
          ],
        });
        if (isCancel(force)) continue;

        const s = spinner();
        s.start('초기화 중...');
        try {
          await initCommand(targetDir, { force: force as boolean });
          s.stop('초기화 완료');
        } catch (e) {
          s.stop('초기화 실패');
          console.log(chalk.red(`  ✖ ${e}`));
        }
        break;
      }

      case 'docgen': {
        const s = spinner();
        s.start('코드베이스 스캔 중...');
        try {
          await docgenCommand(targetDir, {});
          s.stop('문서 생성 완료');
        } catch (e) {
          s.stop('문서 생성 실패');
          console.log(chalk.red(`  ✖ ${e}`));
        }
        break;
      }

      case 'spec': {
        const s = spinner();
        s.start('아키텍처 분석 중...');
        try {
          await specCommand(targetDir, {});
          s.stop('스펙 생성 완료');
        } catch (e) {
          s.stop('스펙 생성 실패');
          console.log(chalk.red(`  ✖ ${e}`));
        }
        break;
      }

      case 'review': {
        const s = spinner();
        s.start('코드 감사 중...');
        try {
          await reviewCommand(targetDir, {});
          s.stop('리뷰 완료');
        } catch (e) {
          s.stop('리뷰 실패');
          console.log(chalk.red(`  ✖ ${e}`));
        }
        break;
      }

      case 'uninstall': {
        const s = spinner();
        s.start('CDD 제거 중...');
        try {
          await uninstallCommand(targetDir);
          s.stop('제거 완료');
        } catch (e) {
          s.stop('제거 실패');
          console.log(chalk.red(`  ✖ ${e}`));
        }
        break;
      }
    }

    console.log('');
    const again = await select({
      message: '계속하시겠습니까?',
      options: [
        { value: true, label: '예 — 다른 명령어 실행' },
        { value: false, label: '아니오 — 종료' },
      ],
    });

    if (isCancel(again) || !again) {
      cancel('CDD를 종료합니다.');
      process.exit(0);
    }

    console.clear();
    showBanner();
  }
}
