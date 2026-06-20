import * as fs from 'node:fs';
import * as path from 'node:path';
import chalk from 'chalk';
import {
  isGitRepo,
  parseGitLog,
  getChangedFiles,
  getCurrentTag,
} from '../core/changelog-parser.js';
import type { Commit } from '../core/changelog-parser.js';
import {
  generateChangelogMarkdown,
} from '../core/changelog-generator.js';
import type { CommitWithFiles } from '../core/changelog-generator.js';
import { analyzeProject } from '../core/analyzer.js';
import { isProjectDirectory } from '../core/project-detector.js';

export async function changelogCommand(
  dir: string,
  options: { from?: string; to?: string; output?: string; dryRun?: boolean },
): Promise<void> {
  const targetDir = path.resolve(dir);

  if (!fs.existsSync(targetDir)) {
    throw new Error(`Directory not found: ${targetDir}`);
  }

  const project = analyzeProject(targetDir);
  if (!isProjectDirectory(targetDir, project.sourceFiles)) {
    console.log(chalk.yellow('No project-level sources found; skipping CHANGELOG.md generation.'));
    return;
  }

  // Check git repo
  if (!isGitRepo(targetDir)) {
    throw new Error('Not a git repository');
  }

  const outputPath = options.output
    ? path.resolve(options.output)
    : path.join(targetDir, 'CHANGELOG.md');

  // Determine version/range
  const currentTag = getCurrentTag(targetDir);
  const from: string | undefined = options.from ?? currentTag ?? undefined;
  const to = options.to ?? 'HEAD';

  // Determine version label for the release section
  const version = options.from ?? currentTag ?? to;

  // Parse git log
  console.log(chalk.cyan('Parsing git history...'));
  const commits: Commit[] = parseGitLog(from, to, targetDir);

  if (commits.length === 0) {
    console.log(chalk.yellow('No changes found'));
    return;
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
