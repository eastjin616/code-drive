import * as fs from 'node:fs';
import * as path from 'node:path';
import chalk from 'chalk';
import { docgenCommand } from './docgen.js';
import { specCommand } from './spec.js';
import { designCommand } from './design.js';
import { changelogCommand } from './changelog.js';
import { installAiContext } from '../core/ai-context.js';

export async function syncCommand(
  dir: string,
  options: { output?: string; includeTests?: boolean } = {},
): Promise<void> {
  const targetDir = path.resolve(dir);

  if (!fs.existsSync(targetDir)) {
    throw new Error(`Directory not found: ${targetDir}`);
  }

  const outputOpt = options.output
    ? { output: options.output, includeTests: options.includeTests }
    : { includeTests: options.includeTests };

  const steps = [
    { name: 'docgen', label: '문서 생성', fn: () => docgenCommand(targetDir, outputOpt) },
    { name: 'spec', label: '아키텍처 스펙', fn: () => specCommand(targetDir, outputOpt) },
    { name: 'design', label: '디자인 토큰', fn: () => designCommand(targetDir, outputOpt) },
    { name: 'changelog', label: '체인지로그', fn: () => changelogCommand(targetDir, outputOpt) },
  ];

  console.log(chalk.cyan.bold('\n📦 CDD Sync — 실행 중...\n'));

  for (const step of steps) {
    console.log(chalk.bold(`[${steps.indexOf(step) + 1}/${steps.length}] ${step.label}`));
    try {
      await step.fn();
      console.log('');
    } catch (e) {
      throw new Error(`${step.label} 실패: ${e}`);
    }
  }

  const aiContext = installAiContext(targetDir);
  console.log(chalk.dim(`AI context routing: ${aiContext.targetFiles.join(', ')}`));
  console.log(chalk.green.bold('✅ CDD Sync 완료 — 모든 아티팩트가 생성되었습니다.'));
}
