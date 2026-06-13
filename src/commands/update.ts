import * as fs from 'node:fs';
import { execSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import * as path from 'node:path';
import chalk from 'chalk';

const PKG = '@eastjin616/code-drive';

export async function updateCommand(
  _dir: string,
  options: { check?: boolean } = {},
): Promise<void> {
  const currentVersion = getCurrentVersion();
  console.log(chalk.cyan(`현재 버전: v${currentVersion}`));

  console.log(chalk.dim('npm 레지스트리에서 최신 버전 확인 중...'));
  let latestVersion: string;
  try {
    latestVersion = execSync(`npm view ${PKG} version`, {
      encoding: 'utf-8',
      timeout: 10_000,
    }).trim();
  } catch {
    throw new Error('npm 레지스트리에 연결할 수 없습니다.');
  }

  console.log(chalk.cyan(`최신 버전: v${latestVersion}`));

  if (currentVersion === latestVersion) {
    console.log(chalk.green('✓ 이미 최신 버전입니다.'));
    return;
  }

  if (options.check) {
    console.log(chalk.yellow(`ℹ v${latestVersion} 사용 가능 — cdd update 를 실행하세요.`));
    return;
  }

  console.log(chalk.yellow(`⬆ v${currentVersion} → v${latestVersion} 업데이트 중...`));
  try {
    execSync(`npm install -g ${PKG}@latest`, {
      stdio: 'inherit',
      timeout: 120_000,
    });
    console.log(chalk.green(`✅ v${latestVersion} 업데이트 완료!`));
  } catch {
    throw new Error(`업데이트에 실패했습니다.\n직접 실행: npm install -g ${PKG}@latest`);
  }
}

function getCurrentVersion(): string {
  try {
    const __dirname = path.dirname(fileURLToPath(import.meta.url));
    const pkgPath = path.resolve(__dirname, '../../package.json');
    const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf-8'));
    return pkg.version || '0.0.0';
  } catch {
    return '0.2.0';
  }
}
