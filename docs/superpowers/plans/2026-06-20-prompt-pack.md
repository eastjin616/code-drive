# Prompt Pack Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add `cdd prompt`, a copy-pasteable AI prompt pack for users who rely on manual prompt engineering instead of AI runtimes that auto-read repo Markdown files.

**Architecture:** Add a pure prompt-pack generator in `src/core/prompt-pack.ts`, expose it through `src/commands/prompt.ts`, then wire CLI/TUI labels and README story. The generator reuses existing analyzer APIs and does not add dependencies.

**Tech Stack:** TypeScript, Commander, Vitest, existing CDD analyzer modules.

---

## File Structure

- Create `src/core/prompt-pack.ts`: pure prompt-pack formatter and option types.
- Create `src/commands/prompt.ts`: command adapter that validates target directory and prints output.
- Create `tests/prompt-pack.test.ts`: generator behavior tests.
- Modify `src/cli.ts`: register `prompt` subcommand and include it in subcommand detection.
- Modify `src/tui-labels.ts`: add prompt command labels, hints, execution order.
- Modify `src/tui-messages.ts`: add prompt start/done messages.
- Modify `src/tui-runner.ts`: add prompt runner and TUI menu entry.
- Modify `README.md` and `README.ko.md`: reposition story around prompt-only users and add `cdd prompt` quick path.

### Task 1: Prompt Generator

**Files:**
- Create: `src/core/prompt-pack.ts`
- Test: `tests/prompt-pack.test.ts`

- [ ] **Step 1: Write failing whole-project prompt test**

```ts
import * as fs from 'node:fs';
import * as os from 'node:os';
import * as path from 'node:path';
import { describe, expect, it } from 'vitest';
import { generateCddConfig } from '../src/core/cdd-config-generator.js';
import { generatePromptPack } from '../src/core/prompt-pack.js';

function makePromptProject(): string {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'cdd-prompt-'));
  const files: Record<string, string> = {
    'package.json': JSON.stringify({ name: 'prompt-demo', version: '1.0.0', dependencies: { chalk: '^5.0.0' } }, null, 2),
    'src/index.ts': 'export function greet(name: string): string {\\n  return `Hello ${name}`;\\n}\\n',
    '.cdd/config.json': JSON.stringify(generateCddConfig(dir), null, 2),
    'README.md': '# Prompt Demo\\n',
    'ARCHITECTURE.md': '# Architecture\\n',
    'CHANGELOG.md': '# Changelog\\n',
    'docs/README.md': '# Generated Docs\\n',
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
    expect(output).toContain('Goal: <describe what you want the AI to help with>');
    expect(output).toContain('ARCHITECTURE.md');
    expect(output).toContain('CHANGELOG.md');
    expect(output).toContain('Code is the source of truth');
    expect(output).toContain('Explain this project to me as a new maintainer.');
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run tests/prompt-pack.test.ts`

Expected: FAIL because `src/core/prompt-pack.ts` does not exist.

- [ ] **Step 3: Write minimal generator**

Create `src/core/prompt-pack.ts` with `generatePromptPack(projectDir, options = {})`. Use `analyzeProject`, `analyzeSourceFiles`, `fs.existsSync`, and Markdown string assembly. Include sections: title, role instruction, project, goal placeholder, important context files, constraints, relevant source summary, starter questions.

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run tests/prompt-pack.test.ts`

Expected: PASS.

### Task 2: File-Focused Prompt

**Files:**
- Modify: `src/core/prompt-pack.ts`
- Modify: `tests/prompt-pack.test.ts`

- [ ] **Step 1: Add failing file-focused test**

Add a test that calls `generatePromptPack(dir, { file: 'src/index.ts' })` and expects `Focus File: src/index.ts`, exported function `greet`, and project constraints.

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run tests/prompt-pack.test.ts`

Expected: FAIL because file-specific output is missing.

- [ ] **Step 3: Implement file option**

Resolve exact file paths with the same extension/index fallback pattern used by `contextCommand`. Include focused file line count, exported functions/classes/interfaces, imports, and a starter question asking the AI to review that file in project context.

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run tests/prompt-pack.test.ts`

Expected: PASS.

### Task 3: CLI and TUI Wiring

**Files:**
- Create: `src/commands/prompt.ts`
- Modify: `src/cli.ts`
- Modify: `src/tui-labels.ts`
- Modify: `src/tui-messages.ts`
- Modify: `src/tui-runner.ts`
- Test: `tests/prompt-command.test.ts`

- [ ] **Step 1: Write failing command test**

Create a test that imports `promptCommand`, spies on `console.log`, runs `promptCommand(dir, {})`, and expects the copy-paste prompt title. Add another test for missing `--file` path throwing `File not found`.

- [ ] **Step 2: Run command test to verify it fails**

Run: `npx vitest run tests/prompt-command.test.ts`

Expected: FAIL because `src/commands/prompt.ts` does not exist.

- [ ] **Step 3: Implement command adapter**

Create `src/commands/prompt.ts`:

```ts
import * as path from 'node:path';
import { generatePromptPack } from '../core/prompt-pack.js';

export interface PromptCommandOptions {
  readonly file?: string;
  readonly includeTests?: boolean;
}

export async function promptCommand(dir: string, options: PromptCommandOptions = {}): Promise<void> {
  const targetDir = path.resolve(dir);
  console.log(generatePromptPack(targetDir, options));
}
```

- [ ] **Step 4: Wire CLI and TUI**

Add `prompt` to `src/cli.ts` imports, subcommands, Commander registration, and TUI command maps. Put it under the AI group with `context` and `ai install`.

- [ ] **Step 5: Run targeted tests**

Run: `npx vitest run tests/prompt-pack.test.ts tests/prompt-command.test.ts tests/tui-status.test.ts`

Expected: PASS.

### Task 4: README Story

**Files:**
- Modify: `README.md`
- Modify: `README.ko.md`

- [ ] **Step 1: Update the top story**

Rewrite the opening sections so they explain why CDD exists before listing features: AI can generate code quickly, but prompt-only users cannot reliably pass repo context into AI chats.

- [ ] **Step 2: Add prompt-only quick start**

Add:

```bash
cdd sync
cdd prompt
```

Explain that the output can be pasted into ChatGPT, Claude, Gemini, or similar tools.

- [ ] **Step 3: Add `cdd prompt` to feature tables**

Add `Prompt Pack` / `프롬프트 팩` row near `context` and `ai install`.

- [ ] **Step 4: Verify docs-only changes**

Run: `grep -n "cdd prompt" README.md README.ko.md`

Expected: both files include the command.

### Task 5: Final Verification

**Files:**
- All touched files.

- [ ] **Step 1: Run full test suite**

Run: `npm test`

Expected: all tests pass.

- [ ] **Step 2: Run build**

Run: `npm run build`

Expected: TypeScript build passes.

- [ ] **Step 3: Run lint**

Run: `npm run lint`

Expected: ESLint passes.

- [ ] **Step 4: Run CLI smoke**

Run: `node dist/cli.js prompt . --file src/cli.ts | sed -n '1,80p'`

Expected: output starts with `# Copy-Paste AI Prompt Pack` and includes `Focus File: src/cli.ts`.

- [ ] **Step 5: Check whitespace**

Run: `git diff --check`

Expected: no output.

