#!/usr/bin/env node

import { Command } from 'commander';
import chalk from 'chalk';
import { initCommand } from './commands/init.js';
import { docgenCommand } from './commands/docgen.js';
import { specCommand } from './commands/spec.js';

const pkg = { version: '0.1.0', name: 'code-drive' };

export function runCLI(argv: string[] = process.argv): void {
  const program = new Command();

  program
    .name(pkg.name)
    .description(
      chalk.cyan('Code-Driven Development (CDD) — Code is the single source of truth.'),
    )
    .version(pkg.version);

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

  program.parse(argv);
}

runCLI();
