import * as fs from 'node:fs';
import * as path from 'node:path';

export interface ShellAliasFile {
  readonly path: string;
  readonly content: string;
}

export interface ShellAliasIssue {
  readonly file: string;
  readonly line: number;
  readonly target: string;
}

export interface ShellAliasOptions {
  readonly projectDir: string;
  readonly homeDir?: string;
  readonly files?: readonly ShellAliasFile[];
}

const SHELL_CONFIGS = ['.zshrc', '.zprofile', '.zshenv', '.bashrc', '.bash_profile', '.profile'] as const;

function normalizePath(value: string, homeDir: string): string {
  const expanded = value.startsWith('~/') ? path.join(homeDir, value.slice(2)) : value;
  return path.resolve(expanded);
}

function extractAliasTarget(line: string): string | null {
  const match = line.match(/^\s*alias\s+cdd=(['"])(.+?)\1\s*(?:#.*)?$/);
  if (!match) return null;

  const command = match[2].trim();
  const nodeMatch = command.match(/^node\s+(.+)$/);
  return nodeMatch ? nodeMatch[1].trim() : command;
}

function readShellAliasFiles(homeDir: string): ShellAliasFile[] {
  const files: ShellAliasFile[] = [];
  for (const configName of SHELL_CONFIGS) {
    const filePath = path.join(homeDir, configName);
    if (!fs.existsSync(filePath)) continue;
    files.push({ path: filePath, content: fs.readFileSync(filePath, 'utf-8') });
  }
  return files;
}

export function findCddShellAliasIssues(options: ShellAliasOptions): ShellAliasIssue[] {
  const homeDir = options.homeDir ?? process.env.HOME ?? '';
  if (!homeDir) return [];

  const projectDir = path.resolve(options.projectDir);
  const files = options.files ?? readShellAliasFiles(homeDir);
  const issues: ShellAliasIssue[] = [];

  for (const file of files) {
    const lines = file.content.split(/\r?\n/);
    lines.forEach((line, index) => {
      const target = extractAliasTarget(line);
      if (!target) return;

      const resolved = normalizePath(target, homeDir);
      if (!resolved.startsWith(`${projectDir}${path.sep}`) && resolved !== projectDir) {
        issues.push({ file: file.path, line: index + 1, target: resolved });
      }
    });
  }

  return issues;
}
