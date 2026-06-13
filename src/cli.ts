#!/usr/bin/env node

import { Command } from 'commander';
import chalk from 'chalk';
import { initCommand } from './commands/init.js';
import { docgenCommand } from './commands/docgen.js';
import { specCommand } from './commands/spec.js';
import { reviewCommand } from './commands/review.js';
import { uninstallCommand } from './commands/uninstall.js';
import { runTUI } from './tui.js';

const pkg = { version: '0.1.0', name: 'code-drive' };

export function runCLI(argv: string[] = process.argv): void {
  const cliFlags = ['--cli', '--help', '-h', '-V', '--version'];
  const subcommands = ['init', 'docgen', 'spec', 'review', 'uninstall', 'help'];
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
    .action(async (dir: string, opts: { force?: boolean }) => {
      await initCommand(dir, opts);
    });

  program
    .command('docgen')
    .description('Generate documentation from code annotations and structure')
    .argument('[directory]', 'Project directory', '.')
    .option('-o, --output <path>', 'Output directory for generated docs', './docs')
    .option('-w, --watch', 'Watch for changes and regenerate')
    .action(async (dir: string, opts: { output?: string; watch?: boolean }) => {
      await docgenCommand(dir, opts);
    });

  program
    .command('spec')
    .description('Extract and verify architecture specifications from code')
    .argument('[directory]', 'Project directory', '.')
    .option('-o, --output <path>', 'Output file for spec', './ARCHITECTURE.md')
    .action(async (dir: string, opts: { output?: string }) => {
      await specCommand(dir, opts);
    });

  program
    .command('review')
    .description('Review codebase against CDD principles')
    .argument('[directory]', 'Project directory', '.')
    .option('-o, --output <path>', 'Save report to file')
    .action(async (dir: string, opts: { output?: string }) => {
      await reviewCommand(dir, opts);
    });

  program
    .command('uninstall')
    .description('Remove all CDD artifacts (.cdd/, ARCHITECTURE.md, docs/) from project')
    .argument('[directory]', 'Project directory', '.')
    .action(async (dir: string) => {
      await uninstallCommand(dir);
    });

  program.parse(argv);
}

runCLI();
