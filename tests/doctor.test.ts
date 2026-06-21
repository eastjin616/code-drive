import * as fs from 'node:fs';
import * as os from 'node:os';
import * as path from 'node:path';
import { execSync } from 'node:child_process';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { generateAiContextBlock } from '../src/core/ai-context.js';
import { generateCddConfig } from '../src/core/cdd-config-generator.js';
import { doctorCommand, isSupportedNodeVersion } from '../src/commands/doctor.js';

const originalHome = process.env.HOME;

afterEach(() => {
  process.env.HOME = originalHome;
  vi.restoreAllMocks();
});

function makeDoctorProject(): string {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'cdd-doctor-'));
  const files: Record<string, string> = {
    'package.json': JSON.stringify({ name: 'doctor-demo', version: '1.0.0' }, null, 2),
    'src/index.ts': 'export function answer(): number {\n  return 42;\n}\n',
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
  return dir;
}

describe('doctorCommand', () => {
  it('uses Node.js 20.19 as the support floor', () => {
    expect(isSupportedNodeVersion('18.20.8')).toBe(false);
    expect(isSupportedNodeVersion('20.18.1')).toBe(false);
    expect(isSupportedNodeVersion('20.19.0')).toBe(true);
    expect(isSupportedNodeVersion('22.0.0')).toBe(true);
  });

  it('warns when the active shell config aliases cdd to another checkout', async () => {
    const projectDir = makeDoctorProject();
    const homeDir = fs.mkdtempSync(path.join(os.tmpdir(), 'cdd-home-'));
    fs.writeFileSync(path.join(homeDir, '.zshrc'), "alias cdd='node ~/old-code-drive/dist/cli.js'\n");
    process.env.HOME = homeDir;

    const output: string[] = [];
    vi.spyOn(console, 'log').mockImplementation((message = '') => {
      output.push(String(message));
    });

    await doctorCommand(projectDir);

    expect(output.join('\n')).toContain('Shell alias for cdd points outside this project');
    expect(output.join('\n')).toContain('Remove or refresh the stale `cdd` shell alias');
  });
});
