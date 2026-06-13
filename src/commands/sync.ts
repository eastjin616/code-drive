import * as fs from 'node:fs';
import * as path from 'node:path';
import chalk from 'chalk';
import { docgenCommand } from './docgen.js';
import { specCommand } from './spec.js';
import { designCommand } from './design.js';
import { changelogCommand } from './changelog.js';

export async function syncCommand(
  dir: string,
  _options: { output?: string } = {},
): Promise<void> {
  const targetDir = path.resolve(dir);

  if (!fs.existsSync(targetDir)) {
    throw new Error(`Directory not found: ${targetDir}`);
  }

  const steps = [
    { name: 'docgen', label: '문서 생성', fn: () => docgenCommand(targetDir, {}) },
    { name: 'spec', label: '아키텍처 스펙', fn: () => specCommand(targetDir, {}) },
    { name: 'design', label: '디자인 토큰', fn: () => designCommand(targetDir, {}) },
    { name: 'changelog', label: '체인지로그', fn: () => changelogCommand(targetDir, {}) },
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

  console.log(chalk.green.bold('✅ CDD Sync 완료 — 모든 아티팩트가 생성되었습니다.'));
}
