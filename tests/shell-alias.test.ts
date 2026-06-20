import * as path from 'node:path';
import { describe, expect, it } from 'vitest';
import { findCddShellAliasIssues } from '../src/core/shell-alias.js';

describe('findCddShellAliasIssues', () => {
  it('warns when cdd is aliased to a different checkout', () => {
    const projectDir = '/Users/seodongjin/Documents/GitHub/code-drive';
    const homeDir = '/Users/seodongjin';

    const issues = findCddShellAliasIssues({
      projectDir,
      homeDir,
      files: [
        {
          path: path.join(homeDir, '.zshrc'),
          content: "alias cdd='node ~/code-drive/dist/cli.js'\n",
        },
      ],
    });

    expect(issues).toEqual([
      {
        file: path.join(homeDir, '.zshrc'),
        line: 1,
        target: path.join(homeDir, 'code-drive/dist/cli.js'),
      },
    ]);
  });

  it('does not warn when cdd resolves inside the active project', () => {
    const projectDir = '/Users/seodongjin/Documents/GitHub/code-drive';
    const homeDir = '/Users/seodongjin';

    const issues = findCddShellAliasIssues({
      projectDir,
      homeDir,
      files: [
        {
          path: path.join(homeDir, '.zshrc'),
          content: "alias cdd='node ~/Documents/GitHub/code-drive/dist/cli.js'\n",
        },
      ],
    });

    expect(issues).toEqual([]);
  });
});
