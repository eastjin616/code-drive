import * as fs from 'node:fs';
import * as os from 'node:os';
import * as path from 'node:path';
import { execSync } from 'node:child_process';
import { describe, expect, it } from 'vitest';
import { generateAiContextBlock } from '../src/core/ai-context.js';
import { generateCddConfig } from '../src/core/cdd-config-generator.js';
import { verifyProject } from '../src/core/verify.js';

function makeProject(files: Record<string, string>): string {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'cdd-verify-'));
  for (const [relativePath, content] of Object.entries(files)) {
    const fullPath = path.join(dir, relativePath);
    fs.mkdirSync(path.dirname(fullPath), { recursive: true });
    fs.writeFileSync(fullPath, content, 'utf-8');
  }
  execSync('git init', { cwd: dir, stdio: 'pipe' });
  return dir;
}

function baseFiles(projectDir: string): Record<string, string> {
  return {
    'package.json': JSON.stringify({ name: 'verify-demo', version: '1.0.0' }, null, 2),
    'src/index.ts': 'export function price(): number {\n  return 42;\n}\n',
    '.cdd/config.json': JSON.stringify(generateCddConfig(projectDir), null, 2),
    'docs/README.md': '# docs\n',
    'ARCHITECTURE.md': '# architecture\n',
    'DESIGN.md': '# design\n',
    'CHANGELOG.md': '# changelog\n',
    'AGENTS.md': generateAiContextBlock(),
  };
}

function makeBaseProject(): string {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'cdd-verify-'));
  for (const [relativePath, content] of Object.entries(baseFiles(dir))) {
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

function makeArtifactsFresh(dir: string): void {
  setTime(path.join(dir, 'src/index.ts'), 1_000);
  for (const artifact of ['docs/README.md', 'ARCHITECTURE.md', 'DESIGN.md', 'CHANGELOG.md']) {
    setTime(path.join(dir, artifact), 2_000);
  }
}

describe('verifyProject', () => {
  it('returns ready when CDD config, artifacts, source, git, and AI routing are healthy', () => {
    const dir = makeBaseProject();
    makeArtifactsFresh(dir);

    const result = verifyProject(dir);

    expect(result.status).toBe('ready');
    expect(result.projectName).toBe('verify-demo');
    expect(result.nextActions).toEqual([]);
  });

  it('returns needs-sync when generated artifacts are missing', () => {
    const dir = makeBaseProject();
    fs.rmSync(path.join(dir, 'DESIGN.md'));

    const result = verifyProject(dir);

    expect(result.status).toBe('needs-sync');
    expect(result.checks.some((check) => check.code === 'artifact-missing')).toBe(true);
    expect(result.nextActions).toContain('Run `cdd sync .` to generate or refresh CDD artifacts.');
  });

  it('returns needs-sync when generated artifacts are older than source files', () => {
    const dir = makeBaseProject();
    setTime(path.join(dir, 'src/index.ts'), 2_000);
    setTime(path.join(dir, 'docs/README.md'), 3_000);
    setTime(path.join(dir, 'ARCHITECTURE.md'), 3_000);
    setTime(path.join(dir, 'DESIGN.md'), 1_000);
    setTime(path.join(dir, 'CHANGELOG.md'), 3_000);

    const result = verifyProject(dir);

    expect(result.status).toBe('needs-sync');
    expect(result.checks).toContainEqual(
      expect.objectContaining({ code: 'artifact-stale', target: 'DESIGN.md' }),
    );
  });

  it('returns needs-attention when AI context routing is missing', () => {
    const dir = makeProject({
      ...baseFiles('/tmp/not-used'),
      'AGENTS.md': '# Project rules\n',
    });
    makeArtifactsFresh(dir);

    const result = verifyProject(dir);

    expect(result.status).toBe('needs-attention');
    expect(result.checks).toContainEqual(
      expect.objectContaining({ code: 'ai-context-missing', status: 'fail' }),
    );
    expect(result.nextActions).toContain('Run `cdd ai install .` to install AI context routing.');
  });
});
