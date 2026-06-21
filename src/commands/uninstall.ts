import * as fs from 'node:fs';
import * as path from 'node:path';
import chalk from 'chalk';
import { cancel, isCancel, select } from '@clack/prompts';
import { findAiContextFiles, removeAiContext } from '../core/ai-context.js';

interface UninstallOptions {
  readonly removeAiContext?: boolean;
  readonly removeRootDocs?: boolean;
}

export async function uninstallCommand(dir: string, options: UninstallOptions = {}): Promise<void> {
  const targetDir = path.resolve(dir);

  if (!fs.existsSync(targetDir)) {
    throw new Error(`Directory not found: ${targetDir}`);
  }

  const alwaysRemoveTargets: { path: string; label: string }[] = [
    { path: path.join(targetDir, '.cdd'), label: '.cdd/' },
    { path: path.join(targetDir, 'ARCHITECTURE.md'), label: 'ARCHITECTURE.md' },
    { path: path.join(targetDir, 'docs'), label: 'docs/' },
  ];
  const rootDocTargets: { path: string; label: string }[] = [
    { path: path.join(targetDir, 'DESIGN.md'), label: 'DESIGN.md' },
    { path: path.join(targetDir, 'CHANGELOG.md'), label: 'CHANGELOG.md' },
  ];

  const existingAlwaysRemove = alwaysRemoveTargets.filter((t) => fs.existsSync(t.path));
  const existingRootDocs = rootDocTargets.filter((t) => fs.existsSync(t.path));
  const aiContextFiles = findAiContextFiles(targetDir);

  if (existingAlwaysRemove.length === 0 && existingRootDocs.length === 0 && aiContextFiles.length === 0) {
    console.log(chalk.yellow('No CDD artifacts found in this project.'));
    return;
  }

  console.log(chalk.cyan.bold('\nCDD uninstall'));

  const shouldRemoveRootDocs =
    existingRootDocs.length > 0
      ? options.removeRootDocs ?? await askRemoveRootDocs(existingRootDocs.map((target) => target.label))
      : false;
  const existing = shouldRemoveRootDocs
    ? [...existingAlwaysRemove, ...existingRootDocs]
    : existingAlwaysRemove;

  if (!shouldRemoveRootDocs && existingRootDocs.length > 0) {
    console.log(chalk.dim(`  • Root generated docs kept: ${existingRootDocs.map((target) => target.label).join(', ')}`));
  }

  console.log(chalk.cyan('The following generated artifacts will be removed:'));
  for (const t of existing) {
    const stat = fs.statSync(t.path);
    const size = stat.isDirectory()
      ? `${countFiles(t.path)} files`
      : `${(stat.size / 1024).toFixed(1)} KB`;
    console.log(chalk.dim(`  • ${t.label} (${size})`));
  }
  if (existing.length === 0) {
    console.log(chalk.dim('  • No generated file artifacts found'));
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

  if (aiContextFiles.length > 0) {
    const shouldRemoveAiContext =
      options.removeAiContext ?? await askRemoveAiContext(aiContextFiles);

    if (shouldRemoveAiContext) {
      const result = removeAiContext(targetDir);
      if (result.updatedFiles.length > 0) {
        console.log(chalk.green(`  ✖ CDD AI context block removed from ${result.updatedFiles.join(', ')}`));
      } else {
        console.log(chalk.dim('  • No CDD AI context blocks removed'));
      }
    } else {
      console.log(chalk.dim(`  • CDD AI context block kept in ${aiContextFiles.join(', ')}`));
    }
  }

  console.log('');
  console.log(chalk.green('✓ CDD uninstalled from project'));
}

async function askRemoveAiContext(aiContextFiles: readonly string[]): Promise<boolean> {
  const answer = await select({
    message: `Remove the CDD block from AI instruction files too? (${aiContextFiles.join(', ')})`,
    options: [
      { value: false, label: 'No', hint: 'Keep AI assistant routing instructions' },
      { value: true, label: 'Yes', hint: 'Remove only the managed CDD block' },
    ],
  });

  if (isCancel(answer)) {
    cancel('CDD uninstall cancelled.');
    return false;
  }

  return answer;
}

async function askRemoveRootDocs(rootDocs: readonly string[]): Promise<boolean> {
  const answer = await select({
    message: `Remove root generated docs too? (${rootDocs.join(', ')})`,
    options: [
      { value: false, label: 'No', hint: 'Keep files that may contain human edits' },
      { value: true, label: 'Yes', hint: 'Remove these generated docs too' },
    ],
  });

  if (isCancel(answer)) {
    cancel('CDD uninstall cancelled.');
    return false;
  }

  return answer;
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
  } catch {
    return count;
  }
  return count;
}
