import * as fs from 'node:fs';
import * as os from 'node:os';
import * as path from 'node:path';
import { describe, expect, it } from 'vitest';
import { generateCddConfig } from '../src/core/cdd-config-generator.js';
import { generatePromptPack } from '../src/core/prompt-pack.js';

function makePromptProject(extraFiles: Record<string, string> = {}): string {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'cdd-prompt-'));
  const files: Record<string, string> = {
    'package.json': JSON.stringify({
      name: 'prompt-demo',
      version: '1.0.0',
      bin: { promptDemo: 'dist/cli.js' },
      dependencies: { chalk: '^5.0.0' },
    }, null, 2),
    'src/cli.ts': 'export function runCLI(): void {}\n',
    'src/index.ts': 'export function greet(name: string): string {\n  return `Hello ${name}`;\n}\n',
    '.cdd/config.json': JSON.stringify(generateCddConfig(dir), null, 2),
    'README.md': '# Prompt Demo\n',
    'ARCHITECTURE.md': '# Architecture\n',
    'CHANGELOG.md': '# Changelog\n',
    'docs/README.md': '# Generated Docs\n',
    ...extraFiles,
  };
  for (const [relativePath, content] of Object.entries(files)) {
    const fullPath = path.join(dir, relativePath);
    fs.mkdirSync(path.dirname(fullPath), { recursive: true });
    fs.writeFileSync(fullPath, content, 'utf-8');
  }
  return dir;
}

describe('generatePromptPack', () => {
  it('generates a copy-paste prompt for prompt-only AI users', () => {
    const output = generatePromptPack(makePromptProject());

    expect(output).toContain('# Copy-Paste AI Prompt Pack');
    expect(output).toContain('Project: prompt-demo v1.0.0');
    expect(output).toContain('Entry points: src/cli.ts');
    expect(output).toContain('Goal: <describe what you want the AI to help with>');
    expect(output).toContain('ARCHITECTURE.md');
    expect(output).toContain('CHANGELOG.md');
    expect(output).toContain('## Generated CDD Artifacts');
    expect(output).toContain('ARCHITECTURE.md: generated');
    expect(output).toContain('Code is the source of truth');
    expect(output).toContain('Explain this project to me as a new maintainer.');
  });

  it('focuses the prompt on a specific source file', () => {
    const output = generatePromptPack(makePromptProject(), { file: 'src/index.ts' });

    expect(output).toContain('Focus File: src/index.ts');
    expect(output).toContain('greet(name: string): string');
    expect(output).toContain('Review this file in the context of the project.');
    expect(output).toContain('Code is the source of truth');
  });

  it('omits optional artifacts that do not exist', () => {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'cdd-prompt-minimal-'));
    const files: Record<string, string> = {
      'package.json': JSON.stringify({ name: 'minimal-demo', version: '1.0.0' }, null, 2),
      'src/index.ts': 'export const value = 1;\n',
      '.cdd/config.json': JSON.stringify(generateCddConfig(dir), null, 2),
      'README.md': '# Minimal Demo\n',
    };
    for (const [relativePath, content] of Object.entries(files)) {
      const fullPath = path.join(dir, relativePath);
      fs.mkdirSync(path.dirname(fullPath), { recursive: true });
      fs.writeFileSync(fullPath, content, 'utf-8');
    }

    const output = generatePromptPack(dir);

    expect(output).toContain('README.md');
    expect(output).not.toContain('- ARCHITECTURE.md\n');
    expect(output).not.toContain('- CHANGELOG.md\n');
    expect(output).toContain('ARCHITECTURE.md: missing');
  });

  it('excludes test files by default and includes them when requested', () => {
    const dir = makePromptProject({
      'tests/index.test.ts': 'import { greet } from "../src/index";\n',
    });

    expect(generatePromptPack(dir)).toContain('Source files: 2');
    expect(generatePromptPack(dir, { includeTests: true })).toContain('Source files: 3');
  });

  it('does not focus test files unless includeTests is enabled', () => {
    const dir = makePromptProject({
      'tests/index.test.ts': 'export function testHelper(): string {\n  return "test";\n}\n',
    });

    expect(() => generatePromptPack(dir, { file: 'tests/index.test.ts' }))
      .toThrow('File not found: tests/index.test.ts');
    expect(generatePromptPack(dir, { file: 'tests/index.test.ts', includeTests: true }))
      .toContain('Focus File: tests/index.test.ts');
  });
});
