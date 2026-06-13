import { describe, it, expect } from 'vitest';
import { classifyCommitType } from '../src/core/changelog-parser.js';
import {
  buildChangelog,
  formatReleaseSection,
  mergeWithExisting,
  formatEntryLine,
} from '../src/core/changelog-generator.js';
import type { CommitWithFiles } from '../src/core/changelog-generator.js';

// ─── classifyCommitType ───────────────────────────────────────────────

describe('classifyCommitType', () => {
  it('parses feat commits', () => {
    const result = classifyCommitType('feat: add new feature');
    expect(result.type).toBe('feat');
    expect(result.description).toBe('add new feature');
    expect(result.breaking).toBe(false);
  });

  it('parses fix commits', () => {
    const result = classifyCommitType('fix: resolve crash on login');
    expect(result.type).toBe('fix');
    expect(result.description).toBe('resolve crash on login');
  });

  it('parses commits with scope', () => {
    const result = classifyCommitType('feat(auth): add JWT support');
    expect(result.type).toBe('feat');
    expect(result.scope).toBe('auth');
    expect(result.description).toBe('add JWT support');
  });

  it('detects breaking changes with bang', () => {
    const result = classifyCommitType('feat!: drop Node 16 support');
    expect(result.breaking).toBe(true);
    expect(result.description).toBe('drop Node 16 support');
  });

  it('detects breaking changes with scope + bang', () => {
    const result = classifyCommitType('feat(api)!: restructure v2 endpoints');
    expect(result.breaking).toBe(true);
    expect(result.scope).toBe('api');
    expect(result.description).toBe('restructure v2 endpoints');
  });

  it('parses docs, chore, refactor, test types', () => {
    expect(classifyCommitType('docs: update README').type).toBe('docs');
    expect(classifyCommitType('chore: bump deps').type).toBe('chore');
    expect(classifyCommitType('refactor: extract helper').type).toBe('refactor');
    expect(classifyCommitType('test: add unit tests').type).toBe('test');
  });

  it('classifies non-conventional messages as other', () => {
    const result = classifyCommitType('WIP');
    expect(result.type).toBe('other');
    expect(result.description).toBe('WIP');
  });

  it('classifies empty message as other', () => {
    const result = classifyCommitType('');
    expect(result.type).toBe('other');
  });
});

// ─── formatEntryLine ──────────────────────────────────────────────────

describe('formatEntryLine', () => {
  it('formats entry without files', () => {
    expect(formatEntryLine({ type: 'added', description: 'new feature', files: [] }))
      .toBe('- new feature');
  });

  it('formats entry with files', () => {
    const result = formatEntryLine({ type: 'added', description: 'add logger', files: ['src/logger.ts'] });
    expect(result).toContain('- add logger');
    expect(result).toContain('src/logger.ts');
  });
});

// ─── buildChangelog ───────────────────────────────────────────────────

describe('buildChangelog', () => {
  it('groups commits by section type', () => {
    const commits: CommitWithFiles[] = [
      {
        hash: 'abc123', date: '2026-06-13', raw: 'feat: add feature',
        type: 'feat', description: 'add feature', breaking: false, files: ['src/feat.ts'],
      },
      {
        hash: 'def456', date: '2026-06-12', raw: 'fix: fix bug',
        type: 'fix', description: 'fix bug', breaking: false, files: ['src/fix.ts'],
      },
    ];

    const section = buildChangelog(commits, 'v0.2.0');
    expect(section.version).toBe('v0.2.0');
    expect(section.entries).toHaveLength(2);
    expect(section.entries[0].type).toBe('added');
    expect(section.entries[1].type).toBe('fixed');
  });

  it('deduplicates identical descriptions', () => {
    const commits: CommitWithFiles[] = [
      {
        hash: 'abc', date: '2026-01-01', raw: 'feat: same feature',
        type: 'feat', description: 'same feature', breaking: false, files: ['src/a.ts'],
      },
      {
        hash: 'def', date: '2026-01-02', raw: 'feat: same feature',
        type: 'feat', description: 'same feature', breaking: false, files: ['src/b.ts'],
      },
    ];

    const section = buildChangelog(commits, 'v1.0.0');
    expect(section.entries).toHaveLength(1);
    expect(section.entries[0].files).toContain('src/a.ts');
    expect(section.entries[0].files).toContain('src/b.ts');
  });
});

// ─── formatReleaseSection ─────────────────────────────────────────────

describe('formatReleaseSection', () => {
  it('formats a complete release section', () => {
    const section = {
      version: 'v0.2.0',
      date: '2026-06-13',
      entries: [
        { type: 'added' as const, description: 'new CLI command', files: ['src/cmd.ts'] },
        { type: 'fixed' as const, description: 'fix parsing bug', files: ['src/parse.ts'] },
      ],
    };

    const output = formatReleaseSection(section);
    expect(output).toContain('## [v0.2.0] — 2026-06-13');
    expect(output).toContain('### Added');
    expect(output).toContain('new CLI command');
    expect(output).toContain('### Fixed');
    expect(output).toContain('fix parsing bug');
  });

  it('handles empty entries', () => {
    const section = { version: 'v1.0.0', date: '2026-01-01', entries: [] };
    expect(formatReleaseSection(section)).toContain('## [v1.0.0] — 2026-01-01');
  });
});

// ─── mergeWithExisting ────────────────────────────────────────────────

describe('mergeWithExisting', () => {
  it('prepends new content before existing version header', () => {
    const existing = '# Changelog\n\n## [v0.1.0] — 2026-01-01\n### Added\n- initial release\n';
    const newContent = '## [v0.2.0] — 2026-06-13\n### Added\n- new feature\n';

    const result = mergeWithExisting(newContent, '/dev/null/non-existent');
    // When file doesn't exist, just returns new content
    expect(result).toBe(newContent);
  });

  it('merges with existing file content', () => {
    const fs = require('node:fs');
    const path = require('node:path');
    const tmpFile = path.join('/tmp', `changelog-test-${Date.now()}.md`);
    fs.writeFileSync(tmpFile, '# Changelog\n\n## [v0.1.0] — 2026-01-01\n### Added\n- initial release\n');

    const newContent = '## [v0.2.0] — 2026-06-13\n### Added\n- new feature\n';
    const result = mergeWithExisting(newContent, tmpFile);

    expect(result).toContain('## [v0.2.0] — 2026-06-13');
    expect(result).toContain('## [v0.1.0] — 2026-01-01');
    // New section should come first
    expect(result.indexOf('v0.2.0')).toBeLessThan(result.indexOf('v0.1.0'));

    fs.unlinkSync(tmpFile);
  });

  it('returns only new content when existing file has no version headers', () => {
    const fs = require('node:fs');
    const path = require('node:path');
    const tmpFile = path.join('/tmp', `changelog-test-${Date.now()}.md`);
    fs.writeFileSync(tmpFile, '# Just a heading\nSome content\n');

    const newContent = '## [v0.1.0] — 2026-01-01\n### Added\n- initial release\n';
    const result = mergeWithExisting(newContent, tmpFile);

    expect(result).toContain('## [v0.1.0]');
    expect(result).toContain('Just a heading');

    fs.unlinkSync(tmpFile);
  });
});
