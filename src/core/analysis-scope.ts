import * as fs from 'node:fs';
import * as path from 'node:path';
import { globSync } from 'glob';

export interface AnalysisScopeOptions {
  readonly includeTests?: boolean;
  readonly include?: readonly string[];
  readonly exclude?: readonly string[];
}

export interface CddConfig {
  readonly version?: string;
  readonly sourceDir?: string;
  readonly docDir?: string;
  readonly projectRoot?: string;
  readonly include?: readonly string[];
  readonly exclude?: readonly string[];
}

const BASE_IGNORES = [
  'node_modules/**',
  'dist/**',
  'build/**',
  '.git/**',
  '.cdd/**',
  'target/**',
  'coverage/**',
  'docs/**',
] as const;

const TEST_IGNORES = [
  'tests/**',
  'test/**',
  'fixtures/**',
  '**/fixtures/**',
  '**/__tests__/**',
  '**/*.test.*',
  '**/*.spec.*',
] as const;
const TEST_IGNORE_SET = new Set<string>(TEST_IGNORES);

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function readString(record: Record<string, unknown>, key: string): string | undefined {
  const value = record[key];
  return typeof value === 'string' && value.trim() ? value : undefined;
}

function readStringArray(record: Record<string, unknown>, key: string): readonly string[] | undefined {
  const value = record[key];
  if (!Array.isArray(value)) return undefined;

  const strings = value.filter((item): item is string => typeof item === 'string' && item.trim().length > 0);
  return strings.length > 0 ? strings : undefined;
}

function normalizePathPattern(pattern: string): string {
  return pattern.replace(/\\/g, '/').replace(/^\.\/+/, '');
}

function sourceDirPattern(sourceDir: string, extensions: string): string {
  const normalized = normalizePathPattern(sourceDir).replace(/\/+$/, '');
  if (!normalized || normalized === '.') return `**/*.${extensions}`;
  return `${normalized}/**/*.${extensions}`;
}

function testSourcePatterns(extensions: string): string[] {
  return [
    `tests/**/*.${extensions}`,
    `test/**/*.${extensions}`,
    `fixtures/**/*.${extensions}`,
  ];
}

export function readCddConfig(projectDir: string): CddConfig {
  const configPath = path.join(projectDir, '.cdd', 'config.json');
  if (!fs.existsSync(configPath)) return {};

  try {
    const parsed: unknown = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
    if (!isRecord(parsed)) return {};

    return {
      version: readString(parsed, 'version'),
      sourceDir: readString(parsed, 'sourceDir'),
      docDir: readString(parsed, 'docDir'),
      projectRoot: readString(parsed, 'projectRoot'),
      include: readStringArray(parsed, 'include'),
      exclude: readStringArray(parsed, 'exclude'),
    };
  } catch {
    return {};
  }
}

export function getSourceFiles(
  projectDir: string,
  extensions: string,
  options: AnalysisScopeOptions = {},
): string[] {
  const config = readCddConfig(projectDir);
  const include = options.include ?? config.include;
  const patterns = include && include.length > 0
    ? include.map(normalizePathPattern)
    : [sourceDirPattern(config.sourceDir ?? '.', extensions)];
  if (options.includeTests && !options.include) {
    patterns.push(...testSourcePatterns(extensions));
  }

  const configExcludes = options.includeTests
    ? (config.exclude ?? []).filter((pattern) => !TEST_IGNORE_SET.has(normalizePathPattern(pattern)))
    : (config.exclude ?? []);
  const testIgnores = options.includeTests ? [] : [...TEST_IGNORES];
  const ignore = [
    ...BASE_IGNORES,
    ...testIgnores,
    ...configExcludes,
    ...(options.exclude ?? []),
  ].map(normalizePathPattern);

  return globSync([...patterns], {
    cwd: projectDir,
    ignore,
    nodir: true,
  }).sort();
}
