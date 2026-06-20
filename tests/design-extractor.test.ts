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

  it('extracts design usage from ordinary CSS rules when tokens are absent', () => {
    const dir = makeProject({
      'src/button.css': [
        '.primary-button {',
        '  color: #ffffff;',
        '  background-color: #2563eb;',
        '  padding: 12px 16px;',
        '  border-radius: 8px;',
        '  box-shadow: 0 8px 24px rgb(0 0 0 / 12%);',
        '}',
      ].join('\n'),
    });

    const tokens = extractDesignTokens(dir, 'demo');

    expect(tokens.styleUsage).toEqual([
      {
        selector: '.primary-button',
        source: path.join(dir, 'src/button.css'),
        properties: [
          { name: 'color', value: '#ffffff', category: 'color' },
          { name: 'background-color', value: '#2563eb', category: 'color' },
          { name: 'padding', value: '12px 16px', category: 'spacing' },
          { name: 'border-radius', value: '8px', category: 'radius' },
          { name: 'box-shadow', value: '0 8px 24px rgb(0 0 0 / 12%)', category: 'shadow' },
        ],
      },
    ]);
  });
});
