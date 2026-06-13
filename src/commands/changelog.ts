import * as fs from 'node:fs';
import * as path from 'node:path';
import chalk from 'chalk';
import {
  isGitRepo,
  parseGitLog,
  getChangedFiles,
  getCurrentTag,
  getFirstCommitHash,
} from '../core/changelog-parser.js';
import type { Commit } from '../core/changelog-parser.js';
import {
  generateChangelogMarkdown,
} from '../core/changelog-generator.js';
import type { CommitWithFiles } from '../core/changelog-generator.js';

export async function changelogCommand(
  dir: string,
  options: { from?: string; to?: string; output?: string; dryRun?: boolean },
): Promise<void> {
  const targetDir = path.resolve(dir);

  if (!fs.existsSync(targetDir)) {
    console.error(chalk.red(`Directory not found: ${targetDir}`));
    process.exit(1);
  }

  // Check git repo
  if (!isGitRepo(targetDir)) {
    console.error(chalk.red('Not a git repository'));
    process.exit(1);
  }

  const outputPath = options.output
    ? path.resolve(options.output)
    : path.join(targetDir, 'CHANGELOG.md');

  // Determine version/range
  let from: string | undefined = options.from;
  const to = options.to ?? 'HEAD';

  if (!from) {
    from = getCurrentTag(targetDir) ?? getFirstCommitHash(targetDir) ?? undefined;
  }
  if (!from) {
    console.error(chalk.red('No commits found in repository'));
    process.exit(1);
  }

  // Determine version label for the release section
  const version = options.from ?? from;

  // Parse git log
  console.log(chalk.cyan('Parsing git history...'));
  const commits: Commit[] = parseGitLog(from, to, targetDir);

  if (commits.length === 0) {
    console.log(chalk.yellow('No changes found'));
    process.exit(0);
  }

  console.log(chalk.dim(`  ${commits.length} commits`));

  // Get changed files for each commit
  console.log(chalk.cyan('Analyzing changed files...'));
  const commitsWithFiles: CommitWithFiles[] = commits.map((commit) => ({
    ...commit,
    files: getChangedFiles(commit.hash, targetDir),
  }));

  const totalFiles = commitsWithFiles.reduce((sum, c) => sum + c.files.length, 0);
  console.log(chalk.dim(`  ${totalFiles} files changed`));

  // Generate markdown
  console.log(chalk.cyan('Generating changelog...'));
  const result = generateChangelogMarkdown(commitsWithFiles, version, outputPath);

  if (options.dryRun) {
    console.log('\n' + chalk.dim('─'.repeat(40)));
    console.log(result);
    console.log(chalk.dim('─'.repeat(40)));
    console.log(chalk.yellow('(dry-run — no file written)'));
    return;
  }

  fs.writeFileSync(outputPath, result, 'utf-8');
  console.log(chalk.green('✓ Changelog generated'));
  console.log(chalk.dim(`  Output: ${outputPath}`));
}
