import * as fs from 'node:fs';
import * as path from 'node:path';
import { execSync } from 'node:child_process';
import chalk from 'chalk';
import { select, spinner, cancel, isCancel, groupMultiselect, log } from '@clack/prompts';
import { initCommand } from './commands/init.js';
import { docgenCommand } from './commands/docgen.js';
import { specCommand } from './commands/spec.js';
import { reviewCommand } from './commands/review.js';
import { uninstallCommand } from './commands/uninstall.js';
import { contextCommand } from './commands/context.js';
import { designCommand } from './commands/design.js';
import { changelogCommand } from './commands/changelog.js';
import { updateCommand } from './commands/update.js';
import { doctorCommand } from './commands/doctor.js';
import { verifyCommand } from './commands/verify.js';

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

// ─── Labels ───────────────────────────────────────────────────────────

const labels = {
  init: 'init',
  docgen: 'docgen',
  spec: 'spec',
  design: 'design',
  changelog: 'changelog',
  review: 'review',
  context: 'context',
  uninstall: 'uninstall',
  update: 'update',
  doctor: 'doctor',
  verify: 'verify',
} as const;

const labelKor = {
  init: 'CDD 설정 초기화',
  docgen: 'docs/README.md, docs/api/',
  spec: 'ARCHITECTURE.md',
  design: 'DESIGN.md',
  changelog: 'CHANGELOG.md',
  review: 'CDD 원칙 코드 감사',
  context: 'AI 프롬프트용 컨텍스트 출력',
  uninstall: 'CDD 아티팩트 제거',
  update: 'cdd 자체 업데이트',
  doctor: '프로젝트 상태 진단',
  verify: '릴리즈 준비 상태 확인',
} as const;

type Cmd = keyof typeof labels;
type RunnableCmd = Exclude<Cmd, 'update'>;

const EXEC_ORDER: RunnableCmd[] = ['doctor', 'init', 'docgen', 'spec', 'design', 'changelog', 'review', 'verify', 'context', 'uninstall'];

// ─── Helpers ──────────────────────────────────────────────────────────

async function runOne(cmd: RunnableCmd, targetDir: string): Promise<void> {
  const s = spinner();
  const startMsg: Record<string, string> = {
    init: '초기화 중...',
    docgen: '코드베이스 스캔 중...',
    spec: '아키텍처 분석 중...',
    review: '코드 감사 중...',
    context: '컨텍스트 수집 중...',
    uninstall: 'CDD 제거 중...',
    design: '디자인 토큰 추출 중...',
    changelog: 'Git 히스토리 분석 중...',
    doctor: '프로젝트 상태 확인 중...',
    verify: '릴리즈 준비 상태 확인 중...',
  };
  const doneMsg: Record<string, string> = {
    init: '초기화 완료',
    docgen: '문서 생성 완료',
    spec: '스펙 생성 완료',
    review: '리뷰 완료',
    context: '컨텍스트 출력 완료',
    uninstall: '제거 완료',
    design: '디자인 스펙 생성 완료',
    changelog: '체인지로그 생성 완료',
    doctor: '진단 완료',
    verify: '검증 완료',
  };

  const outputFiles: Record<string, string | undefined> = {
    docgen: 'docs/README.md',
    spec: 'ARCHITECTURE.md',
    design: 'DESIGN.md',
    changelog: 'CHANGELOG.md',
  };

  if (cmd === 'init') {
    const force = await select({
      message: '기존 설정 덮어쓰기?',
      options: [
        { value: false, label: '아니오' },
        { value: true, label: '예 (--force)' },
      ],
    });
    if (isCancel(force)) return;
    if (typeof force !== 'boolean') return;
    s.start(startMsg[cmd]);
    try {
      await initCommand(targetDir, { force });
      s.stop(chalk.green(doneMsg[cmd]));
    } catch (e) {
      s.stop(chalk.red(doneMsg[cmd] + ' 실패'));
      log.error(String(e));
    }
    return;
  }

  s.start(startMsg[cmd]);
  try {
    const runners: Record<Exclude<RunnableCmd, 'init'>, () => Promise<void>> = {
      docgen: () => docgenCommand(targetDir, {}),
      spec: () => specCommand(targetDir, {}),
      review: () => reviewCommand(targetDir, {}),
      context: () => contextCommand(targetDir, {}),
      uninstall: () => uninstallCommand(targetDir),
      design: () => designCommand(targetDir, {}),
      changelog: () => changelogCommand(targetDir, {}),
      doctor: () => doctorCommand(targetDir),
      verify: () => verifyCommand(targetDir, {}),
    };
    await runners[cmd]();
    s.stop(chalk.green(doneMsg[cmd]));
  } catch (e) {
    s.stop(chalk.red(doneMsg[cmd] + ' 실패'));
    log.error(String(e));
    return;
  }

  const relPath = outputFiles[cmd];
  if (relPath) {
    const absPath = path.join(targetDir, relPath);
    if (fs.existsSync(absPath)) {
      const openFile = await select({
        message: `${chalk.bold(labels[cmd])} 생성 완료. 파일을 여시겠습니까?`,
        options: [
          { value: true, label: '예' },
          { value: false, label: '아니오' },
        ],
      });
      if (!isCancel(openFile) && openFile) {
        const opener = process.platform === 'darwin' ? 'open' : process.platform === 'win32' ? 'start' : 'xdg-open';
        execSync(`${opener} "${absPath}"`);
      }
    }
  }
}

// ─── TUI ──────────────────────────────────────────────────────────────

export async function runTUI(): Promise<void> {
  console.clear();
  showBanner();

  while (true) {
    const mode = await select({
      message: '실행할 내용을 선택하세요',
      options: [
        { value: 'doctor', label: '추천 워크플로 시작', hint: 'doctor로 상태 진단 후 다음 액션 확인' },
        { value: 'verify', label: '릴리즈 준비 확인', hint: 'config, 생성 문서, AI 라우팅, 리뷰 에러 확인' },
        { value: 'cmds', label: '명령어 직접 실행', hint: 'docgen, spec, design, changelog, review, verify, context' },
        { value: 'init', label: 'init', hint: 'CDD 설정 초기화' },
        { value: 'update', label: 'update', hint: 'cdd 자체 업데이트' },
        { value: 'uninstall', label: 'uninstall', hint: 'CDD 아티팩트 제거' },
      ],
    });

    if (isCancel(mode)) {
      cancel('CDD를 종료합니다.');
      process.exit(0);
    }

    if (mode === 'init' || mode === 'doctor' || mode === 'verify' || mode === 'uninstall' || mode === 'update') {
      console.log('');
      await (mode === 'update'
        ? updateCommand('.', {})
        : runOne(mode, process.cwd()));
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
      continue;
    }

    const raw = await groupMultiselect({
      message: '실행할 명령어를 선택하세요 (스페이스: 선택, 엔터: 실행)',
      options: {
        '⚡ 전체 선택': [
          { value: '__all__', label: '권장 전체 흐름', hint: 'doctor + 생성 + 리뷰 + verify + context' },
        ],
        '🩺 진단': [
          { value: 'doctor', hint: '프로젝트 상태와 다음 액션' },
          { value: 'verify', hint: '릴리즈 준비 상태와 필요한 조치' },
        ],
        '📄 생성': [
          { value: 'docgen', hint: 'docs/README.md, docs/api/' },
          { value: 'spec', hint: 'ARCHITECTURE.md' },
          { value: 'design', hint: 'DESIGN.md' },
          { value: 'changelog', hint: 'CHANGELOG.md' },
        ],
        '🔍 분석': [
          { value: 'review', hint: 'CDD 원칙 코드 감사' },
          { value: 'context', hint: 'AI 프롬프트용 컨텍스트 출력' },
        ],
      },
      selectableGroups: false,
      required: true,
    });

    if (isCancel(raw)) {
      cancel('CDD를 종료합니다.');
      process.exit(0);
    }

    let selected = raw.filter((value) => typeof value === 'string');
    if (selected.includes('__all__')) {
      selected = ['doctor', 'docgen', 'spec', 'design', 'changelog', 'review', 'verify', 'context'];
    }
    const targetDir = process.cwd();
    console.log('');
    const selectedSet = new Set(selected);
    const ordered = EXEC_ORDER.filter((c) => c !== 'init' && c !== 'uninstall' && selectedSet.has(c));
    for (const cmd of ordered) {
      log.step(`${chalk.bold(labels[cmd])} — ${labelKor[cmd]}`);
      await runOne(cmd, targetDir);
      console.log('');
    }

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
