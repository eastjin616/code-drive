import { describe, expect, it } from 'vitest';
import * as fs from 'node:fs';
import * as os from 'node:os';
import * as path from 'node:path';
import { designCommand } from '../src/commands/design.js';

function makeWorkspaceRoot(): string {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'cdd-design-root-'));
  const cssPath = path.join(dir, 'nested-app', 'src', 'styles.css');
  fs.mkdirSync(path.dirname(cssPath), { recursive: true });
  fs.writeFileSync(cssPath, '.button { color: #2563eb; }\n', 'utf-8');
  return dir;
}

function makePackageProject(): string {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'cdd-design-project-'));
  const cssPath = path.join(dir, 'src', 'styles.css');
  fs.mkdirSync(path.dirname(cssPath), { recursive: true });
  fs.writeFileSync(path.join(dir, 'package.json'), '{"name":"design-project"}\n', 'utf-8');
  fs.writeFileSync(cssPath, '.button { color: #2563eb; }\n', 'utf-8');
  return dir;
}

describe('designCommand', () => {
  it('does not create DESIGN.md when run from a non-project workspace root', async () => {
    const dir = makeWorkspaceRoot();

    await designCommand(dir, {});

    expect(fs.existsSync(path.join(dir, 'DESIGN.md'))).toBe(false);
  });

  it('creates DESIGN.md when run from a project directory', async () => {
    const dir = makePackageProject();

    await designCommand(dir, {});

    const design = fs.readFileSync(path.join(dir, 'DESIGN.md'), 'utf-8');
    expect(design).toContain('Detected Style Usage');
    expect(design).toContain('`.button`');
  });
});
