import * as fs from 'node:fs';
import * as path from 'node:path';
import { describe, expect, it } from 'vitest';

describe('stability contract documentation', () => {
  it('documents the 1.x stable command and artifact contracts', () => {
    const content = fs.readFileSync(path.join(process.cwd(), 'STABILITY.md'), 'utf-8');

    for (const command of [
      'cdd init',
      'cdd sync',
      'cdd prompt',
      'cdd verify',
      'cdd doctor',
      'cdd ai install',
      'cdd uninstall',
    ]) {
      expect(content).toContain(command);
    }
    expect(content).toContain('Node.js 20.19+');
    for (const artifact of [
      '.cdd/config.json',
      'docs/README.md',
      'docs/api/*.md',
      'ARCHITECTURE.md',
      'DESIGN.md',
      'CHANGELOG.md',
    ]) {
      expect(content).toContain(artifact);
    }
    expect(content).toContain('<!-- cdd:ai-context:start -->');
    expect(content).toContain('<!-- cdd:ai-context:end -->');
    expect(content).toContain('Exit Code Contract');
    expect(content).toContain('| `ready` | `0` |');
    expect(content).toContain('| `needs-sync` | `1` |');
    expect(content).toContain('| `needs-attention` | `1` |');
    expect(content).toContain('Upgrade Guide');
    expect(content).toContain('generated markdown sentence-level wording is not a strict compatibility contract');
  });

  it('includes the stability contract in the npm package allowlist', () => {
    const packageJson = JSON.parse(fs.readFileSync(path.join(process.cwd(), 'package.json'), 'utf-8')) as {
      files?: string[];
    };

    expect(packageJson.files).toContain('STABILITY.md');
  });
});
