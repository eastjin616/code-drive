import * as fs from 'node:fs';
import * as os from 'node:os';
import * as path from 'node:path';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { generateCddConfig } from '../src/core/cdd-config-generator.js';
import { promptCommand } from '../src/commands/prompt.js';

afterEach(() => {
  vi.restoreAllMocks();
});

function makePromptProject(): string {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'cdd-prompt-command-'));
  const files: Record<string, string> = {
    'package.json': JSON.stringify({ name: 'prompt-command-demo', version: '1.0.0' }, null, 2),
    'src/index.ts': 'export function run(): void {}\n',
    '.cdd/config.json': JSON.stringify(generateCddConfig(dir), null, 2),
    'README.md': '# Prompt Command Demo\n',
  };
  for (const [relativePath, content] of Object.entries(files)) {
    const fullPath = path.join(dir, relativePath);
    fs.mkdirSync(path.dirname(fullPath), { recursive: true });
    fs.writeFileSync(fullPath, content, 'utf-8');
  }
  return dir;
}

describe('promptCommand', () => {
  it('prints a copy-paste prompt pack', async () => {
    const output: string[] = [];
    vi.spyOn(console, 'log').mockImplementation((message = '') => {
      output.push(String(message));
    });

    await promptCommand(makePromptProject(), {});

    expect(output.join('\n')).toContain('# Copy-Paste AI Prompt Pack');
    expect(output.join('\n')).toContain('Project: prompt-command-demo v1.0.0');
  });

  it('prints a file-focused prompt when file is provided', async () => {
    const output: string[] = [];
    vi.spyOn(console, 'log').mockImplementation((message = '') => {
      output.push(String(message));
    });

    await promptCommand(makePromptProject(), { file: 'src/index' });

    expect(output.join('\n')).toContain('Focus File: src/index.ts');
  });

  it('throws when the target directory does not exist', async () => {
    await expect(promptCommand(path.join(os.tmpdir(), 'missing-cdd-project'), {}))
      .rejects.toThrow('Directory not found:');
  });

  it('throws when the focused file does not exist', async () => {
    await expect(promptCommand(makePromptProject(), { file: 'src/missing.ts' }))
      .rejects.toThrow('File not found: src/missing.ts');
  });
});
