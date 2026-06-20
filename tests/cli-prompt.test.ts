import * as fs from 'node:fs';
import * as os from 'node:os';
import * as path from 'node:path';
import { execFileSync } from 'node:child_process';
import { describe, expect, it } from 'vitest';
import { generateCddConfig } from '../src/core/cdd-config-generator.js';

function makeCliProject(): string {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'cdd-cli-prompt-'));
  const files: Record<string, string> = {
    'package.json': JSON.stringify({ name: 'cli-prompt-demo', version: '1.0.0' }, null, 2),
    'src/index.ts': 'export function main(): void {}\n',
    '.cdd/config.json': JSON.stringify(generateCddConfig(dir), null, 2),
    'README.md': '# CLI Prompt Demo\n',
  };
  for (const [relativePath, content] of Object.entries(files)) {
    const fullPath = path.join(dir, relativePath);
    fs.mkdirSync(path.dirname(fullPath), { recursive: true });
    fs.writeFileSync(fullPath, content, 'utf-8');
  }
  return dir;
}

describe('cdd prompt CLI', () => {
  it('prints a file-focused prompt through Commander wiring', () => {
    const projectDir = makeCliProject();

    const output = execFileSync('npx', ['tsx', 'src/cli.ts', 'prompt', projectDir, '--file', 'src/index.ts'], {
      cwd: process.cwd(),
      encoding: 'utf-8',
    });

    expect(output).toContain('# Copy-Paste AI Prompt Pack');
    expect(output).toContain('Focus File: src/index.ts');
  });
});
