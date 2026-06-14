import { execSync } from 'node:child_process';

// ─── Types ────────────────────────────────────────────────────────────

export interface Commit {
  hash: string;
  date: string;
  raw: string;
  type: CommitType;
  scope?: string;
  description: string;
  breaking: boolean;
}

export type CommitType =
  | 'feat'
  | 'fix'
  | 'docs'
  | 'chore'
  | 'refactor'
  | 'test'
  | 'style'
  | 'perf'
  | 'ci'
  | 'other';

// ─── Conventional Commit Parsing ──────────────────────────────────────

const CONVENTIONAL_PATTERN =
  /^(feat|fix|docs|chore|refactor|test|style|perf|ci)(\(([^)]+)\))?(!)?:\s(.+)$/;

export function classifyCommitType(
  message: string,
): { type: CommitType; scope?: string; description: string; breaking: boolean } {
  const match = message.match(CONVENTIONAL_PATTERN);
  if (match) {
    return {
      type: match[1] as CommitType,
      scope: match[3] || undefined,
      description: match[5],
      breaking: match[4] === '!',
    };
  }
  return { type: 'other', description: message, breaking: false };
}

// ─── Git Helpers ──────────────────────────────────────────────────────

const COMMIT_SEPARATOR = '---commit---';

export function isGitRepo(dir: string): boolean {
  try {
    execSync('git rev-parse --git-dir', { cwd: dir, stdio: 'pipe' });
    return true;
  } catch {
    return false;
  }
}

export function parseGitLog(
  from?: string,
  to?: string,
  dir = '.',
): Commit[] {
  const range = from && to ? `${from}..${to}` : from ? `${from}..HEAD` : '';
  const cmd = `git log --format="${COMMIT_SEPARATOR}%n%H%n%ai%n%s%n%b" ${range}`;

  let output: string;
  try {
    output = execSync(cmd, { cwd: dir, encoding: 'utf-8', stdio: 'pipe' });
  } catch {
    return [];
  }

  if (!output.trim()) return [];

  const blocks = output.split(`${COMMIT_SEPARATOR}\n`).filter(Boolean);
  return blocks.map(parseCommitBlock).filter((c): c is Commit => c !== null);
}

function parseCommitBlock(block: string): Commit | null {
  const lines = block.split('\n').filter(Boolean);
  if (lines.length < 3) return null;

  const hash = lines[0]?.trim() ?? '';
  const date = lines[1]?.trim() ?? '';
  const subject = lines[2]?.trim() ?? '';
  const body = lines.slice(3).join('\n').trim();

  const { type, scope, description, breaking: typeBreaking } =
    classifyCommitType(subject);
  const bodyBreaking = body.includes('BREAKING CHANGE');

  return {
    hash,
    date,
    raw: subject + (body ? `\n${body}` : ''),
    type,
    scope,
    description,
    breaking: typeBreaking || bodyBreaking,
  };
}

export function getChangedFiles(hash: string, dir = '.'): string[] {
  try {
    const output = execSync(
      `git diff-tree --root --no-commit-id -r --name-only ${hash}`,
      { cwd: dir, encoding: 'utf-8', stdio: 'pipe' },
    );
    return output.trim().split('\n').filter(Boolean);
  } catch {
    // Root commit: use diff-tree with --root or ls-tree
    try {
      const output = execSync(
        `git ls-tree --name-only -r ${hash}`,
        { cwd: dir, encoding: 'utf-8', stdio: 'pipe' },
      );
      return output.trim().split('\n').filter(Boolean);
    } catch {
      return [];
    }
  }
}

export function getCurrentTag(dir = '.'): string | null {
  try {
    return execSync('git describe --tags --abbrev=0', {
      cwd: dir,
      encoding: 'utf-8',
      stdio: 'pipe',
    }).trim();
  } catch {
    return null;
  }
}

export function getFirstCommitHash(dir = '.'): string | null {
  try {
    return execSync('git log --reverse --format=%H', {
      cwd: dir,
      encoding: 'utf-8',
      stdio: 'pipe',
    })
      .trim()
      .split('\n')[0];
  } catch {
    return null;
  }
}
