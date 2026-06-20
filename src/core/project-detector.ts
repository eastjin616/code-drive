import * as fs from 'node:fs';
import * as path from 'node:path';

const PROJECT_MARKERS = [
  '.cdd/config.json',
  'package.json',
  'pyproject.toml',
  'Cargo.toml',
  'go.mod',
  'pom.xml',
  'build.gradle',
  'settings.gradle',
  'Package.swift',
  'deno.json',
  'bun.lockb',
] as const;

const PROJECT_SOURCE_ROOTS = new Set([
  'app',
  'cmd',
  'components',
  'internal',
  'lib',
  'pages',
  'pkg',
  'routes',
  'src',
]);

function hasProjectMarker(projectDir: string): boolean {
  return PROJECT_MARKERS.some((marker) => fs.existsSync(path.join(projectDir, marker)));
}

function isProjectLevelSourcePath(filePath: string): boolean {
  const normalized = filePath.replace(/\\/g, '/').replace(/^\.\/+/, '');
  const parts = normalized.split('/').filter(Boolean);
  if (parts.length === 0) return false;
  if (parts.length === 1) return true;
  return PROJECT_SOURCE_ROOTS.has(parts[0]);
}

export function isProjectDirectory(
  projectDir: string,
  sourceFiles: readonly string[],
): boolean {
  return hasProjectMarker(projectDir) || sourceFiles.some(isProjectLevelSourcePath);
}
