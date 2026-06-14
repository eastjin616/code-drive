import * as fs from 'node:fs';
import type { Commit, CommitType } from './changelog-parser.js';

// ─── Types ────────────────────────────────────────────────────────────

export interface ChangelogEntry {
  type: ChangelogSectionType;
  description: string;
  files: string[];
}

export type ChangelogSectionType =
  | 'added'
  | 'fixed'
  | 'changed'
  | 'removed'
  | 'deprecated'
  | 'security'
  | 'docs'
  | 'other';

export interface ReleaseSection {
  version: string;
  date: string;
  entries: ChangelogEntry[];
}

// ─── Type Mapping ─────────────────────────────────────────────────────

const COMMIT_TYPE_TO_SECTION: Record<CommitType, ChangelogSectionType> = {
  feat: 'added',
  fix: 'fixed',
  docs: 'docs',
  chore: 'changed',
  refactor: 'changed',
  test: 'changed',
  style: 'changed',
  perf: 'changed',
  ci: 'changed',
  other: 'other',
};

function commitTypeToSection(type: CommitType, breaking: boolean): ChangelogSectionType {
  if (breaking) return 'changed';
  return COMMIT_TYPE_TO_SECTION[type] ?? 'other';
}

// ─── Markdown Generation ──────────────────────────────────────────────

export function formatEntryLine(entry: ChangelogEntry): string {
  const files =
    entry.files.length > 0
      ? `\n  → ${entry.files.join(', ')}`
      : '';
  return `- ${entry.description}${files}`;
}

export function formatReleaseSection(section: ReleaseSection): string {
  const lines: string[] = [];
  lines.push(`## [${section.version}] — ${section.date}`);
  lines.push('');

  // Group entries by type
  const grouped = new Map<ChangelogSectionType, ChangelogEntry[]>();
  const sectionOrder: ChangelogSectionType[] = [
    'added',
    'changed',
    'fixed',
    'removed',
    'deprecated',
    'security',
    'docs',
    'other',
  ];

  for (const entry of section.entries) {
    const list = grouped.get(entry.type) ?? [];
    list.push(entry);
    grouped.set(entry.type, list);
  }

  for (const type of sectionOrder) {
    const entries = grouped.get(type);
    if (!entries || entries.length === 0) continue;

    const heading = type.charAt(0).toUpperCase() + type.slice(1);
    lines.push(`### ${heading}`);
    lines.push('');
    for (const entry of entries) {
      lines.push(formatEntryLine(entry));
    }
    lines.push('');
  }

  // Remove trailing blank line
  if (lines[lines.length - 1] === '') {
    lines.pop();
  }

  return lines.join('\n');
}

// ─── Changelog Generation ─────────────────────────────────────────────

export interface CommitWithFiles extends Commit {
  files: string[];
}

export function buildChangelog(
  commits: CommitWithFiles[],
  version: string,
): ReleaseSection {
  const entries: ChangelogEntry[] = [];

  for (const commit of commits) {
    const sectionType = commitTypeToSection(commit.type, commit.breaking);
    const existing = entries.find(
      (e) => e.type === sectionType && e.description === commit.description,
    );

    if (existing) {
      // Deduplicate files
      for (const file of commit.files) {
        if (!existing.files.includes(file)) {
          existing.files.push(file);
        }
      }
    } else {
      entries.push({
        type: sectionType,
        description: commit.description,
        files: commit.files,
      });
    }
  }

  const now = new Date();
  const dateStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;

  return { version, date: dateStr, entries };
}

// ─── Merge with Existing ──────────────────────────────────────────────

export function mergeWithExisting(
  newContent: string,
  existingPath: string,
): string {
  let existing = '';
  try {
    existing = fs.readFileSync(existingPath, 'utf-8');
  } catch {
    // File doesn't exist → just return new content
    return newContent;
  }

  const newVersion = newContent.match(/^## \[([^\]]+)\]/m)?.[1];
  const existingWithoutDuplicate = newVersion
    ? removeVersionSection(existing, newVersion)
    : existing;

  const versionHeaderIndex = existingWithoutDuplicate.search(/^## \[/m);
  if (versionHeaderIndex === -1) {
    const trimmedExisting = existingWithoutDuplicate.trim();
    return trimmedExisting ? `${newContent}\n\n${trimmedExisting}` : newContent;
  }

  const preamble = existingWithoutDuplicate.slice(0, versionHeaderIndex).trimEnd();
  const remainingSections = existingWithoutDuplicate.slice(versionHeaderIndex).trimStart();
  return [preamble, newContent, remainingSections].filter(Boolean).join('\n\n');
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function removeVersionSection(content: string, version: string): string {
  const headerPattern = new RegExp(`^## \\[${escapeRegExp(version)}\\][^\\n]*(?:\\n|$)`, 'm');
  let result = content;

  while (true) {
    const match = headerPattern.exec(result);
    if (!match || match.index === undefined) return result;

    const start = match.index;
    const afterHeader = start + match[0].length;
    const nextHeaderOffset = result.slice(afterHeader).search(/^## \[/m);
    const end = nextHeaderOffset === -1 ? result.length : afterHeader + nextHeaderOffset;
    result = `${result.slice(0, start).trimEnd()}\n\n${result.slice(end).trimStart()}`.trim();
  }
}

// ─── Full Pipeline ────────────────────────────────────────────────────

export function generateChangelogMarkdown(
  commits: CommitWithFiles[],
  version: string,
  outputPath: string,
): string {
  const section = buildChangelog(commits, version);
  const markdown = formatReleaseSection(section);
  return mergeWithExisting(markdown, outputPath);
}
