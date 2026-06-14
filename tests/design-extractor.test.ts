import { describe, expect, it } from 'vitest';
import * as fs from 'node:fs';
import * as os from 'node:os';
import * as path from 'node:path';
import { extractDesignTokens } from '../src/core/design-extractor.js';

function makeProject(files: Record<string, string>): string {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'cdd-design-'));
  for (const [relativePath, content] of Object.entries(files)) {
    const fullPath = path.join(dir, relativePath);
    fs.mkdirSync(path.dirname(fullPath), { recursive: true });
    fs.writeFileSync(fullPath, content, 'utf-8');
  }
  return dir;
}

describe('extractDesignTokens', () => {
  it('classifies font-size variables as typography sizes', () => {
    const dir = makeProject({
      'src/styles.css': [
        ':root {',
        '  --font-sans: Inter, system-ui, sans-serif;',
        '  --font-size-body: 16px;',
        '}',
      ].join('\n'),
    });

    const tokens = extractDesignTokens(dir, 'demo');

    expect(tokens.typography).toHaveLength(1);
    expect(tokens.typography[0]).toEqual({
      fontFamily: 'Inter, system-ui, sans-serif',
      source: path.join(dir, 'src/styles.css'),
      sizes: [{ name: 'body', value: '16px' }],
    });
  });
});
