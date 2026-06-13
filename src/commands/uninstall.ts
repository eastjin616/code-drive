import * as fs from 'node:fs';
import * as path from 'node:path';
import chalk from 'chalk';

export async function uninstallCommand(dir: string): Promise<void> {
  const targetDir = path.resolve(dir);

  if (!fs.existsSync(targetDir)) {
    console.error(chalk.red(`Directory not found: ${targetDir}`));
    process.exit(1);
  }

  const targets: { path: string; label: string }[] = [
    { path: path.join(targetDir, '.cdd'), label: '.cdd/' },
    { path: path.join(targetDir, 'ARCHITECTURE.md'), label: 'ARCHITECTURE.md' },
    { path: path.join(targetDir, 'docs'), label: 'docs/' },
  ];

  const existing = targets.filter((t) => fs.existsSync(t.path));

  if (existing.length === 0) {
    console.log(chalk.yellow('No CDD artifacts found in this project.'));
    return;
  }

  console.log(chalk.cyan('The following will be removed:'));
  for (const t of existing) {
    const stat = fs.statSync(t.path);
    const size = stat.isDirectory()
      ? `${countFiles(t.path)} files`
      : `${(stat.size / 1024).toFixed(1)} KB`;
    console.log(chalk.dim(`  • ${t.label} (${size})`));
  }

  // Delete
  for (const t of existing) {
    const s = fs.statSync(t.path);
    if (s.isDirectory()) {
      fs.rmSync(t.path, { recursive: true, force: true });
    } else {
      fs.unlinkSync(t.path);
    }
    console.log(chalk.green(`  ✖ ${t.label} removed`));
  }

  console.log('');
  console.log(chalk.green('✓ CDD uninstalled from project'));
}

function countFiles(dir: string): number {
  let count = 0;
  try {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        count += countFiles(fullPath);
      } else {
        count++;
      }
    }
  } catch {}
  return count;
}
