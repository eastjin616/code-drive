import * as fs from 'node:fs';
import * as path from 'node:path';
import { execFileSync } from 'node:child_process';
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
import { promptCommand } from './commands/prompt.js';
import { syncCommand } from './commands/sync.js';
import { aiInstallCommand } from './commands/ai.js';
import { COMMAND_HINTS, COMMAND_LABELS, EXEC_ORDER, commandTitle } from './tui-labels.js';
import type { RunnableCommand, RecommendedCommand } from './tui-labels.js';
import { DONE_MESSAGES, OUTPUT_FILES, START_MESSAGES } from './tui-messages.js';
import { readTuiStatus } from './tui-status.js';
import { showBanner, showDashboard, showDashboardError } from './tui-view.js';

type DirectSelection = Exclude<RunnableCommand, 'init'> | '__all__';

const DIRECT_SELECTIONS: ReadonlySet<string> = new Set([
  '__all__',
  'docgen',
  'spec',
  'design',
  'changelog',
  'review',
  'context',
  'prompt',
  'uninstall',
  'doctor',
  'verify',
  'sync',
  'ai',
]);

function isDirectSelection(value: unknown): value is DirectSelection {
  return typeof value === 'string' && DIRECT_SELECTIONS.has(value);
}

async function promptContinue(): Promise<boolean> {
  const again = await select({
    message: '계속하시겠습니까?',
    options: [
      { value: true, label: '예 — 다른 명령어 실행' },
      { value: false, label: '아니오 — 종료' },
    ],
  });
  return !isCancel(again) && Boolean(again);
}

function openFile(filePath: string): void {
  if (process.platform === 'darwin') {
    execFileSync('open', [filePath], { stdio: 'ignore' });
    return;
  }
  if (process.platform === 'win32') {
    execFileSync('cmd', ['/c', 'start', '', filePath], { stdio: 'ignore' });
    return;
  }
  execFileSync('xdg-open', [filePath], { stdio: 'ignore' });
}

async function maybeOpenOutput(command: RunnableCommand, targetDir: string): Promise<void> {
  const relPath = OUTPUT_FILES[command];
  if (!relPath) return;

  const absPath = path.join(targetDir, relPath);
  if (!fs.existsSync(absPath)) {
    log.info(`${COMMAND_LABELS[command]}: 생성된 파일 없음`);
    return;
  }

  const openOutput = await select({
    message: `${chalk.bold(COMMAND_LABELS[command])} 완료. 파일을 여시겠습니까?`,
    options: [
      { value: true, label: '예' },
      { value: false, label: '아니오' },
    ],
  });
  if (!isCancel(openOutput) && openOutput) {
    openFile(absPath);
  }
}

async function runInit(targetDir: string): Promise<void> {
  const force = await select({
    message: '기존 설정 덮어쓰기?',
    options: [
      { value: false, label: '아니오' },
      { value: true, label: '예 (--force)' },
    ],
  });
  if (isCancel(force) || typeof force !== 'boolean') return;
  const s = spinner();
  s.start(START_MESSAGES.init);
  try {
    await initCommand(targetDir, { force });
    s.stop(chalk.green(DONE_MESSAGES.init));
  } catch (error) {
    s.stop(chalk.red(`${DONE_MESSAGES.init} 실패`));
    log.error(String(error));
  }
}

async function runCommand(command: Exclude<RunnableCommand, 'init'>, targetDir: string): Promise<void> {
  const runners: Record<Exclude<RunnableCommand, 'init'>, () => Promise<void>> = {
    docgen: () => docgenCommand(targetDir, {}),
    spec: () => specCommand(targetDir, {}),
    review: () => reviewCommand(targetDir, {}),
    context: () => contextCommand(targetDir, {}),
    prompt: () => promptCommand(targetDir, {}),
    uninstall: () => uninstallCommand(targetDir),
    design: () => designCommand(targetDir, {}),
    changelog: () => changelogCommand(targetDir, {}),
    doctor: () => doctorCommand(targetDir),
    verify: () => verifyCommand(targetDir, {}),
    sync: () => syncCommand(targetDir, {}),
    ai: () => aiInstallCommand(targetDir),
  };
  await runners[command]();
}

async function runOne(command: RunnableCommand, targetDir: string): Promise<void> {
  if (command === 'init') {
    await runInit(targetDir);
    return;
  }

  const s = spinner();
  s.start(START_MESSAGES[command]);
  try {
    await runCommand(command, targetDir);
    s.stop(chalk.green(DONE_MESSAGES[command]));
  } catch (error) {
    s.stop(chalk.red(`${DONE_MESSAGES[command]} 실패`));
    log.error(String(error));
    return;
  }

  await maybeOpenOutput(command, targetDir);
}

function showCurrentDashboard(targetDir: string): RecommendedCommand {
  try {
    const status = readTuiStatus(targetDir);
    showDashboard(status);
    return status.recommendedCommand;
  } catch (error) {
    showDashboardError(error);
    return 'doctor';
  }
}

async function runDirectCommands(targetDir: string): Promise<void> {
  const raw = await groupMultiselect({
    message: '실행할 명령어를 선택하세요 (스페이스: 선택, 엔터: 실행)',
    options: {
      '권장 흐름': [
        { value: '__all__', label: '권장 전체 흐름', hint: 'doctor + sync + review + verify + context' },
      ],
      '진단': [
        { value: 'doctor', label: COMMAND_LABELS.doctor, hint: COMMAND_HINTS.doctor },
        { value: 'verify', label: COMMAND_LABELS.verify, hint: COMMAND_HINTS.verify },
      ],
      '생성': [
        { value: 'sync', label: COMMAND_LABELS.sync, hint: COMMAND_HINTS.sync },
        { value: 'docgen', label: COMMAND_LABELS.docgen, hint: COMMAND_HINTS.docgen },
        { value: 'spec', label: COMMAND_LABELS.spec, hint: COMMAND_HINTS.spec },
        { value: 'design', label: COMMAND_LABELS.design, hint: COMMAND_HINTS.design },
        { value: 'changelog', label: COMMAND_LABELS.changelog, hint: COMMAND_HINTS.changelog },
      ],
      'AI': [
        { value: 'ai', label: COMMAND_LABELS.ai, hint: COMMAND_HINTS.ai },
        { value: 'prompt', label: COMMAND_LABELS.prompt, hint: COMMAND_HINTS.prompt },
        { value: 'context', label: COMMAND_LABELS.context, hint: COMMAND_HINTS.context },
      ],
      '관리': [
        { value: 'review', label: COMMAND_LABELS.review, hint: COMMAND_HINTS.review },
        { value: 'uninstall', label: COMMAND_LABELS.uninstall, hint: COMMAND_HINTS.uninstall },
      ],
    },
    selectableGroups: false,
    required: true,
  });

  if (isCancel(raw)) {
    cancel('CDD를 종료합니다.');
    process.exit(0);
  }

  let selected = raw.filter(isDirectSelection);
  if (selected.includes('__all__')) {
    selected = ['doctor', 'sync', 'review', 'verify', 'context'];
  }
  const selectedSet = new Set(selected);
  const ordered = EXEC_ORDER.filter((command) => command !== 'init' && selectedSet.has(command));

  console.log('');
  for (const command of ordered) {
    log.step(commandTitle(command));
    await runOne(command, targetDir);
    console.log('');
  }
}

export async function runTUI(): Promise<void> {
  while (true) {
    const targetDir = process.cwd();
    console.clear();
    showBanner();
    const recommendedCommand = showCurrentDashboard(targetDir);
    const mode = await select({
      message: '실행할 내용을 선택하세요',
      options: [
        { value: 'recommended', label: '추천 액션 실행', hint: commandTitle(recommendedCommand) },
        { value: 'verify', label: COMMAND_LABELS.verify, hint: COMMAND_HINTS.verify },
        { value: 'cmds', label: '명령어 직접 실행', hint: 'sync, design, changelog, ai install 등 선택' },
        { value: 'init', label: COMMAND_LABELS.init, hint: COMMAND_HINTS.init },
        { value: 'prompt', label: COMMAND_LABELS.prompt, hint: COMMAND_HINTS.prompt },
        { value: 'ai', label: COMMAND_LABELS.ai, hint: COMMAND_HINTS.ai },
        { value: 'update', label: COMMAND_LABELS.update, hint: COMMAND_HINTS.update },
        { value: 'uninstall', label: COMMAND_LABELS.uninstall, hint: COMMAND_HINTS.uninstall },
      ],
    });

    if (isCancel(mode)) {
      cancel('CDD를 종료합니다.');
      process.exit(0);
    }

    console.log('');
    if (mode === 'cmds') {
      await runDirectCommands(targetDir);
    } else if (mode === 'update') {
      await updateCommand(targetDir, {});
    } else {
      const command = mode === 'recommended' ? recommendedCommand : mode;
      await runOne(command, targetDir);
    }

    console.log('');
    if (!await promptContinue()) {
      cancel('CDD를 종료합니다.');
      process.exit(0);
    }
  }
}
