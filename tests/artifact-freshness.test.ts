import { describe, it, expect } from 'vitest';
import * as fs from 'node:fs';
import * as os from 'node:os';
import * as path from 'node:path';
import { assessArtifactFreshness } from '../src/core/artifact-freshness.js';

function makeProject(files: Record<string, string>): string {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'cdd-artifacts-'));
  for (const [relativePath, content] of Object.entries(files)) {
    const fullPath = path.join(dir, relativePath);
    fs.mkdirSync(path.dirname(fullPath), { recursive: true });
    fs.writeFileSync(fullPath, content, 'utf-8');
  }
  return dir;
}

function setTime(filePath: string, timestampMs: number): void {
  const date = new Date(timestampMs);
  fs.utimesSync(filePath, date, date);
}

describe('assessArtifactFreshness', () => {
  it('marks missing artifacts as missing', () => {
    const dir = makeProject({
      'src/index.ts': 'export const value = 1;\n',
    });

    const result = assessArtifactFreshness(
      dir,
      [{ label: 'ARCHITECTURE.md', path: path.join(dir, 'ARCHITECTURE.md') }],
      ['src/index.ts'],
    );

    expect(result).toEqual([
      {
        label: 'ARCHITECTURE.md',
        path: path.join(dir, 'ARCHITECTURE.md'),
        status: 'missing',
        sourceCount: 1,
      },
    ]);
  });

  it('marks artifacts newer than sources as fresh', () => {
    const dir = makeProject({
      'src/index.ts': 'export const value = 1;\n',
      'docs/README.md': '# docs\n',
    });
    setTime(path.join(dir, 'src/index.ts'), 1_000);
    setTime(path.join(dir, 'docs/README.md'), 2_000);

    const result = assessArtifactFreshness(
      dir,
      [{ label: 'docs/README.md', path: path.join(dir, 'docs/README.md') }],
      ['src/index.ts'],
    );

    expect(result[0]?.status).toBe('fresh');
    expect(result[0]?.sourceCount).toBe(1);
  });

  it('marks artifacts older than sources as stale', () => {
    const dir = makeProject({
      'src/index.ts': 'export const value = 1;\n',
      'ARCHITECTURE.md': '# architecture\n',
    });
    setTime(path.join(dir, 'ARCHITECTURE.md'), 1_000);
    setTime(path.join(dir, 'src/index.ts'), 2_000);

    const result = assessArtifactFreshness(
      dir,
      [{ label: 'ARCHITECTURE.md', path: path.join(dir, 'ARCHITECTURE.md') }],
      ['src/index.ts'],
    );

    expect(result[0]?.status).toBe('stale');
    expect(result[0]?.sourceCount).toBe(1);
  });
});
