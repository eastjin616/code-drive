import * as fs from 'node:fs';
import * as os from 'node:os';
import * as path from 'node:path';
import { describe, expect, it } from 'vitest';
import {
  CDD_AI_CONTEXT_END,
  CDD_AI_CONTEXT_START,
  generateAiContextBlock,
  installAiContext,
  removeAiContext,
} from '../src/core/ai-context.js';

function makeTempProject(): string {
  return fs.mkdtempSync(path.join(os.tmpdir(), 'cdd-ai-context-'));
}

function readFile(projectDir: string, fileName: string): string {
  return fs.readFileSync(path.join(projectDir, fileName), 'utf-8');
}

describe('installAiContext', () => {
  it('creates AGENTS.md with CDD routing when no AI instruction file exists', () => {
    const dir = makeTempProject();

    const result = installAiContext(dir);

    expect(result.createdFiles).toEqual(['AGENTS.md']);
    expect(result.updatedFiles).toEqual([]);
    const content = readFile(dir, 'AGENTS.md');
    expect(content).toContain(CDD_AI_CONTEXT_START);
    expect(content).toContain('read `DESIGN.md`');
    expect(content).toContain('read `ARCHITECTURE.md`');
    expect(content).toContain('read `CHANGELOG.md`');
    expect(content).toContain(CDD_AI_CONTEXT_END);
  });

  it('appends CDD routing to existing AI instruction files without changing surrounding text', () => {
    const dir = makeTempProject();
    fs.writeFileSync(path.join(dir, 'CLAUDE.md'), '# Project Rules\n\nKeep replies concise.\n', 'utf-8');

    const result = installAiContext(dir);

    expect(result.createdFiles).toEqual([]);
    expect(result.updatedFiles).toEqual(['CLAUDE.md']);
    const content = readFile(dir, 'CLAUDE.md');
    expect(content).toContain('# Project Rules');
    expect(content).toContain('Keep replies concise.');
    expect(content).toContain('For UI, UX, styling, layout, colors, spacing, typography, or design-token work');
  });

  it('replaces an existing CDD managed block instead of duplicating it', () => {
    const dir = makeTempProject();
    fs.writeFileSync(
      path.join(dir, 'CODEX.md'),
      `# Codex Rules\n\n${CDD_AI_CONTEXT_START}\nold instructions\n${CDD_AI_CONTEXT_END}\n`,
      'utf-8',
    );

    installAiContext(dir);
    const result = installAiContext(dir);

    expect(result.updatedFiles).toEqual(['CODEX.md']);
    const content = readFile(dir, 'CODEX.md');
    expect(content.match(new RegExp(CDD_AI_CONTEXT_START, 'g'))).toHaveLength(1);
    expect(content).not.toContain('old instructions');
  });
});

describe('removeAiContext', () => {
  it('removes CDD managed blocks from existing AI instruction files and preserves surrounding text', () => {
    const dir = makeTempProject();
    fs.writeFileSync(
      path.join(dir, 'CLAUDE.md'),
      `# Claude Rules\n\n${generateAiContextBlock()}\n\nKeep the domain language precise.\n`,
      'utf-8',
    );
    fs.writeFileSync(path.join(dir, 'AGENTS.md'), '# Agent Rules\n\nDo not rewrite history.\n', 'utf-8');

    const result = removeAiContext(dir);

    expect(result.updatedFiles).toEqual(['CLAUDE.md']);
    expect(result.unchangedFiles).toEqual(['AGENTS.md']);
    const claude = readFile(dir, 'CLAUDE.md');
    expect(claude).toContain('# Claude Rules');
    expect(claude).toContain('Keep the domain language precise.');
    expect(claude).not.toContain(CDD_AI_CONTEXT_START);
    expect(readFile(dir, 'AGENTS.md')).toBe('# Agent Rules\n\nDo not rewrite history.\n');
  });

  it('reports no files when no AI instruction files exist', () => {
    const dir = makeTempProject();

    const result = removeAiContext(dir);

    expect(result.targetFiles).toEqual([]);
    expect(result.updatedFiles).toEqual([]);
    expect(result.unchangedFiles).toEqual([]);
  });
});
