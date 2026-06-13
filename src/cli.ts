#!/usr/bin/env node

import { Command } from 'commander';
import chalk from 'chalk';
import { initCommand } from './commands/init.js';
import { docgenCommand } from './commands/docgen.js';
import { specCommand } from './commands/spec.js';
import { reviewCommand } from './commands/review.js';
import { uninstallCommand } from './commands/uninstall.js';
import { contextCommand } from './commands/context.js';
import { designCommand } from './commands/design.js';
import { changelogCommand } from './commands/changelog.js';
import { syncCommand } from './commands/sync.js';
import { updateCommand } from './commands/update.js';
import { runTUI } from './tui.js';

const pkg = { version: '0.2.0', name: 'code-drive' };

function exitOnError(fn: (...args: any[]) => Promise<void>) {
  return async (...args: any[]) => {
    try {
      await fn(...args);
    } catch (e) {
      console.error(chalk.red(e instanceof Error ? e.message : String(e)));
      process.exit(1);
    }
  };
}

export function runCLI(argv: string[] = process.argv): void {
  const cliFlags = ['--cli', '--help', '-h', '-V', '--version'];
  const subcommands = ['init', 'docgen', 'spec', 'review', 'uninstall', 'context', 'design', 'changelog', 'sync', 'update', 'help'];
  const isCliMode = cliFlags.some((f) => argv.includes(f));
  const hasSubcommand = argv.slice(2).some((a) => subcommands.includes(a));

  if (!isCliMode && !hasSubcommand) {
    runTUI().catch((err) => {
      console.error(chalk.red('TUI error:'), err);
      process.exit(1);
    });
    return;
  }

  const program = new Command();

  program
    .name(pkg.name)
    .description(chalk.cyan('Code-Driven Development (CDD) — Code is the single source of truth.'))
    .version(pkg.version)
    .option('--cli', 'Force legacy CLI mode (skip TUI)');

  program
    .command('init')
    .description('Initialize CDD configuration in a project')
    .argument('[directory]', 'Project directory', '.')
    .option('-f, --force', 'Overwrite existing configuration')
    .action(exitOnError(async (dir: string, opts: { force?: boolean }) => {
      await initCommand(dir, opts);
    }));

  program
    .command('docgen')
    .description('Generate documentation from code annotations and structure')
    .argument('[directory]', 'Project directory', '.')
    .option('-o, --output <path>', 'Output directory for generated docs', './docs')
    .option('-w, --watch', 'Watch for changes and regenerate')
    .action(exitOnError(async (dir: string, opts: { output?: string; watch?: boolean }) => {
      await docgenCommand(dir, opts);
    }));

  program
    .command('spec')
    .description('Extract and verify architecture specifications from code')
    .argument('[directory]', 'Project directory', '.')
    .option('-o, --output <path>', 'Output file for spec', './ARCHITECTURE.md')
    .action(exitOnError(async (dir: string, opts: { output?: string }) => {
      await specCommand(dir, opts);
    }));

  program
    .command('review')
    .description('Review codebase against CDD principles')
    .argument('[directory]', 'Project directory', '.')
    .option('-o, --output <path>', 'Save report to file')
    .action(exitOnError(async (dir: string, opts: { output?: string }) => {
      await reviewCommand(dir, opts);
    }));

  program
    .command('uninstall')
    .description('Remove all CDD artifacts (.cdd/, ARCHITECTURE.md, docs/) from project')
    .argument('[directory]', 'Project directory', '.')
    .action(exitOnError(async (dir: string) => {
      await uninstallCommand(dir);
    }));

  program
    .command('context')
    .description('Print project context for AI prompts — structure, functions, dependencies')
    .argument('[directory]', 'Project directory', '.')
    .option('-f, --file <path>', 'Show context for a specific file')
    .action(exitOnError(async (dir: string, opts: { file?: string }) => {
      await contextCommand(dir, opts);
    }));

  program
    .command('design')
    .description('Extract design tokens from code — colors, typography, spacing, and more')
    .argument('[directory]', 'Project directory', '.')
    .option('-o, --output <path>', 'Output file for design spec', './DESIGN.md')
    .action(exitOnError(async (dir: string, opts: { output?: string }) => {
      await designCommand(dir, opts);
    }));

  program
    .command('changelog')
    .description('Generate changelog from git history and code analysis')
    .argument('[directory]', 'Project directory', '.')
    .option('-f, --from <ref>', 'Starting commit ref (default: last tag or first commit)')
    .option('-t, --to <ref>', 'Ending commit ref (default: HEAD)')
    .option('-o, --output <path>', 'Output file for changelog', './CHANGELOG.md')
    .option('--dry-run', 'Preview changelog without writing to file')
    .action(exitOnError(async (dir: string, opts: { from?: string; to?: string; output?: string; dryRun?: boolean }) => {
      await changelogCommand(dir, opts);
    }));

  program
    .command('sync')
    .description('Run all generators: docgen + spec + design + changelog')
    .argument('[directory]', 'Project directory', '.')
    .option('-o, --output <path>', 'Output directory for generated artifacts')
    .action(exitOnError(async (dir: string, opts: { output?: string }) => {
      await syncCommand(dir, opts);
    }));

  program
    .command('update')
    .description('Update cdd CLI to the latest version from npm')
    .option('--check', 'Check for update without installing')
    .action(exitOnError(async (opts: { check?: boolean }) => {
      await updateCommand('.', opts);
    }));

  program.parse(argv);
}

runCLI();
