import * as fs from 'node:fs';
import * as os from 'node:os';
import * as path from 'node:path';
import { execFileSync, execSync, spawnSync } from 'node:child_process';
import { describe, expect, it } from 'vitest';

function runCdd(args: readonly string[], cwd: string): string {
  return execFileSync(path.join(process.cwd(), 'node_modules/.bin/tsx'), [path.join(process.cwd(), 'src/cli.ts'), ...args], {
    cwd,
    encoding: 'utf-8',
  });
}

function runCddProcess(args: readonly string[], cwd: string): ReturnType<typeof spawnSync> {
  return spawnSync(
    path.join(process.cwd(), 'node_modules/.bin/tsx'),
    [path.join(process.cwd(), 'src/cli.ts'), ...args],
    { cwd, encoding: 'utf-8' },
  );
}

describe('stable CLI smoke path', () => {
  it('initializes, syncs, prompts, and verifies a clean TypeScript project', () => {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'cdd-stable-smoke-'));
    fs.writeFileSync(
      path.join(dir, 'package.json'),
      JSON.stringify({ name: 'stable-smoke-demo', version: '1.0.0' }, null, 2),
      'utf-8',
    );
    fs.mkdirSync(path.join(dir, 'src'));
    fs.writeFileSync(path.join(dir, 'src/index.ts'), 'export function answer(): number {\n  return 42;\n}\n', 'utf-8');
    execSync('git init', { cwd: dir, stdio: 'pipe' });
    execSync('git config user.email test@example.com', { cwd: dir, stdio: 'pipe' });
    execSync('git config user.name Test', { cwd: dir, stdio: 'pipe' });
    execSync('git add . && git commit -m init', { cwd: dir, stdio: 'pipe' });

    runCdd(['init', '.'], dir);
    runCdd(['sync', '.'], dir);
    const prompt = runCdd(['prompt', '.', '--file', 'src/index.ts'], dir);
    const verify = runCdd(['verify', '.'], dir);

    expect(fs.existsSync(path.join(dir, '.cdd/config.json'))).toBe(true);
    expect(fs.existsSync(path.join(dir, 'AGENTS.md'))).toBe(true);
    expect(fs.existsSync(path.join(dir, 'docs/README.md'))).toBe(true);
    expect(fs.existsSync(path.join(dir, 'ARCHITECTURE.md'))).toBe(true);
    expect(fs.existsSync(path.join(dir, 'DESIGN.md'))).toBe(true);
    expect(fs.existsSync(path.join(dir, 'CHANGELOG.md'))).toBe(true);
    expect(prompt).toContain('Focus File: src/index.ts');
    expect(verify).toContain('Status: ready');
  }, 15_000);

  it('returns exit code 1 for a non-ready json verify result', () => {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'cdd-stable-smoke-fail-'));
    fs.writeFileSync(
      path.join(dir, 'package.json'),
      JSON.stringify({ name: 'stable-smoke-fail-demo', version: '1.0.0' }, null, 2),
      'utf-8',
    );
    fs.mkdirSync(path.join(dir, 'src'));
    fs.writeFileSync(path.join(dir, 'src/index.ts'), 'export const value = 1;\n', 'utf-8');
    execSync('git init', { cwd: dir, stdio: 'pipe' });
    runCdd(['init', '.'], dir);
    runCdd(['sync', '.'], dir);
    fs.rmSync(path.join(dir, 'DESIGN.md'));

    const result = runCddProcess(['verify', '.', '--json'], dir);

    expect(result.status).toBe(1);
    expect(result.stdout).toContain('"status": "needs-sync"');
  }, 15_000);
});
