import { describe, expect, it, afterEach } from 'vitest';
import * as fs from 'node:fs';
import * as os from 'node:os';
import * as path from 'node:path';
import { execSync } from 'node:child_process';
import { generateAiContextBlock } from '../src/core/ai-context.js';
import { generateCddConfig } from '../src/core/cdd-config-generator.js';
import { verifyCommand } from '../src/commands/verify.js';

function makeProject(files: Record<string, string>): string {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'cdd-verify-command-'));
  for (const [relativePath, content] of Object.entries(files)) {
    const fullPath = path.join(dir, relativePath);
    fs.mkdirSync(path.dirname(fullPath), { recursive: true });
    fs.writeFileSync(fullPath, content, 'utf-8');
  }
  execSync('git init', { cwd: dir, stdio: 'pipe' });
  return dir;
}

function setTime(filePath: string, timestampMs: number): void {
  const date = new Date(timestampMs);
  fs.utimesSync(filePath, date, date);
}

function makeReadyProject(): string {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'cdd-verify-command-'));
  const files: Record<string, string> = {
    'package.json': JSON.stringify({ name: 'verify-command-demo', version: '1.0.0' }, null, 2),
    'src/index.ts': 'export function value(): number {\n  return 1;\n}\n',
    '.cdd/config.json': JSON.stringify(generateCddConfig(dir), null, 2),
    'docs/README.md': '# docs\n',
    'ARCHITECTURE.md': '# architecture\n',
    'DESIGN.md': '# design\n',
    'CHANGELOG.md': '# changelog\n',
    'AGENTS.md': generateAiContextBlock(),
  };
  for (const [relativePath, content] of Object.entries(files)) {
    const fullPath = path.join(dir, relativePath);
    fs.mkdirSync(path.dirname(fullPath), { recursive: true });
    fs.writeFileSync(fullPath, content, 'utf-8');
  }
  execSync('git init', { cwd: dir, stdio: 'pipe' });
  setTime(path.join(dir, 'src/index.ts'), 1_000);
  for (const artifact of ['docs/README.md', 'ARCHITECTURE.md', 'DESIGN.md', 'CHANGELOG.md']) {
    setTime(path.join(dir, artifact), 2_000);
  }
  return dir;
}

describe('verifyCommand exit code contract', () => {
  afterEach(() => {
    process.exitCode = undefined;
  });

  it('leaves exitCode unset when the project is ready', async () => {
    await verifyCommand(makeReadyProject(), { json: true });

    expect(process.exitCode).toBeUndefined();
  });

  it('clears a previous exitCode when the project is ready', async () => {
    process.exitCode = 1;

    await verifyCommand(makeReadyProject(), { json: true });

    expect(process.exitCode).toBeUndefined();
  });

  it('sets exitCode 1 when generated artifacts need sync', async () => {
    const dir = makeReadyProject();
    fs.rmSync(path.join(dir, 'DESIGN.md'));

    await verifyCommand(dir, { json: true });

    expect(process.exitCode).toBe(1);
  });

  it('sets exitCode 1 when the project needs attention', async () => {
    const dir = makeProject({
      'package.json': JSON.stringify({ name: 'verify-attention-demo', version: '1.0.0' }, null, 2),
      'src/index.ts': 'export const value = 1;\n',
      '.cdd/config.json': JSON.stringify(generateCddConfig('/tmp/not-used'), null, 2),
      'docs/README.md': '# docs\n',
      'ARCHITECTURE.md': '# architecture\n',
      'DESIGN.md': '# design\n',
      'CHANGELOG.md': '# changelog\n',
      'AGENTS.md': '# Project rules\n',
    });
    setTime(path.join(dir, 'src/index.ts'), 1_000);
    for (const artifact of ['docs/README.md', 'ARCHITECTURE.md', 'DESIGN.md', 'CHANGELOG.md']) {
      setTime(path.join(dir, artifact), 2_000);
    }

    await verifyCommand(dir, { json: true });

    expect(process.exitCode).toBe(1);
  });
});
