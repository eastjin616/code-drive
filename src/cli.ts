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
import { doctorCommand } from './commands/doctor.js';
import { aiInstallCommand } from './commands/ai.js';
import { verifyCommand } from './commands/verify.js';
import { runTUI } from './tui.js';

const pkg = { version: '0.2.0', name: 'code-drive' };

function exitOnError<TArgs extends unknown[]>(fn: (...args: TArgs) => Promise<void>) {
  return async (...args: TArgs) => {
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
  const subcommands = ['init', 'docgen', 'spec', 'review', 'uninstall', 'context', 'design', 'changelog', 'sync', 'update', 'doctor', 'verify', 'ai', 'help'];
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
    .option('--include-tests', 'Include test and fixture files in generated docs')
    .action(exitOnError(async (dir: string, opts: { output?: string; watch?: boolean; includeTests?: boolean }) => {
      await docgenCommand(dir, opts);
    }));

  program
    .command('spec')
    .description('Extract and verify architecture specifications from code')
    .argument('[directory]', 'Project directory', '.')
    .option('-o, --output <path>', 'Output file for spec', './ARCHITECTURE.md')
    .option('--include-tests', 'Include test and fixture files in architecture analysis')
    .action(exitOnError(async (dir: string, opts: { output?: string; includeTests?: boolean }) => {
      await specCommand(dir, opts);
    }));

  program
    .command('review')
    .description('Review codebase against CDD principles')
    .argument('[directory]', 'Project directory', '.')
    .option('-o, --output <path>', 'Save report to file')
    .option('--include-tests', 'Include test and fixture files in review')
    .option('--max-findings <count>', 'Maximum findings shown per severity group', '20')
    .action(exitOnError(async (dir: string, opts: { output?: string; includeTests?: boolean; maxFindings?: string }) => {
      await reviewCommand(dir, opts);
    }));

  program
    .command('uninstall')
    .description('Remove all CDD artifacts (.cdd/, ARCHITECTURE.md, docs/) from project')
    .argument('[directory]', 'Project directory', '.')
    .option('--remove-ai-context', 'Remove CDD managed blocks from AI instruction files without prompting')
    .option('--keep-ai-context', 'Keep CDD managed blocks in AI instruction files without prompting')
    .action(exitOnError(async (dir: string, opts: { removeAiContext?: boolean; keepAiContext?: boolean }) => {
      await uninstallCommand(dir, {
        removeAiContext: opts.removeAiContext ? true : opts.keepAiContext ? false : undefined,
      });
    }));

  program
    .command('context')
    .description('Print project context for AI prompts — structure, functions, dependencies')
    .argument('[directory]', 'Project directory', '.')
    .option('-f, --file <path>', 'Show context for a specific file')
    .option('--include-tests', 'Include test and fixture files in project context')
    .action(exitOnError(async (dir: string, opts: { file?: string; includeTests?: boolean }) => {
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
    .option('--include-tests', 'Include test and fixture files in generated analysis artifacts')
    .action(exitOnError(async (dir: string, opts: { output?: string; includeTests?: boolean }) => {
      await syncCommand(dir, opts);
    }));

  program
    .command('update')
    .description('Update cdd CLI to the latest version from npm')
    .option('--check', 'Check for update without installing')
    .action(exitOnError(async (opts: { check?: boolean }) => {
      await updateCommand('.', opts);
    }));

  program
    .command('doctor')
    .description('Run health checks on the project — Node, Git, CDD setup, artifacts')
    .argument('[directory]', 'Project directory', '.')
    .option('--include-tests', 'Include test and fixture files in project analysis')
    .action(exitOnError(async (dir: string, opts: { includeTests?: boolean }) => {
      await doctorCommand(dir, opts);
    }));

  program
    .command('verify')
    .description('Check CDD release readiness — config, artifacts, AI routing, review errors')
    .argument('[directory]', 'Project directory', '.')
    .option('--include-tests', 'Include test and fixture files in project analysis')
    .option('--json', 'Print machine-readable JSON')
    .action(exitOnError(async (dir: string, opts: { includeTests?: boolean; json?: boolean }) => {
      await verifyCommand(dir, opts);
    }));

  const ai = program
    .command('ai')
    .description('Manage AI assistant context routing for CDD-generated docs');

  ai
    .command('install')
    .description('Install or refresh CDD context routing in AI instruction files')
    .argument('[directory]', 'Project directory', '.')
    .action(exitOnError(async (dir: string) => {
      await aiInstallCommand(dir);
    }));

  program.parse(argv);
}

runCLI();
