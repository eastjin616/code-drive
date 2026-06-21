import * as fs from 'node:fs';
import * as os from 'node:os';
import * as path from 'node:path';
import { describe, expect, it } from 'vitest';
import { generateAiContextBlock } from '../src/core/ai-context.js';
import { generateCddConfig } from '../src/core/cdd-config-generator.js';
import { uninstallCommand } from '../src/commands/uninstall.js';

function makeInstalledProject(): string {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'cdd-uninstall-'));
  const files: Record<string, string> = {
    'package.json': JSON.stringify({ name: 'uninstall-demo', version: '1.0.0' }, null, 2),
    'src/index.ts': 'export const value = 1;\n',
    '.cdd/config.json': JSON.stringify(generateCddConfig(dir), null, 2),
    'docs/README.md': '# docs\n',
    'docs/api/src--index.md': '# src/index.ts\n',
    'ARCHITECTURE.md': '# architecture\n',
    'DESIGN.md': '# design\n',
    'CHANGELOG.md': '# changelog\n',
    'AGENTS.md': `# Project rules\n\n${generateAiContextBlock()}`,
  };

  for (const [relativePath, content] of Object.entries(files)) {
    const fullPath = path.join(dir, relativePath);
    fs.mkdirSync(path.dirname(fullPath), { recursive: true });
    fs.writeFileSync(fullPath, content, 'utf-8');
  }

  return dir;
}

describe('uninstallCommand', () => {
  it('removes every stable generated artifact and can keep AI routing', async () => {
    const dir = makeInstalledProject();

    await uninstallCommand(dir, { removeAiContext: false });

    expect(fs.existsSync(path.join(dir, '.cdd'))).toBe(false);
    expect(fs.existsSync(path.join(dir, 'docs'))).toBe(false);
    expect(fs.existsSync(path.join(dir, 'ARCHITECTURE.md'))).toBe(false);
    expect(fs.existsSync(path.join(dir, 'DESIGN.md'))).toBe(false);
    expect(fs.existsSync(path.join(dir, 'CHANGELOG.md'))).toBe(false);
    expect(fs.readFileSync(path.join(dir, 'AGENTS.md'), 'utf-8')).toContain('cdd:ai-context:start');
  });
});
