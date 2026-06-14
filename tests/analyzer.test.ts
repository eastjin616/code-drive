import { describe, it, expect } from 'vitest';
import * as fs from 'node:fs';
import * as os from 'node:os';
import * as path from 'node:path';
import { analyzeAll } from '../src/core/analyzer.js';

const FIXTURE_DIR = path.join(import.meta.dirname, 'fixtures', 'sample-project');

function makeProject(files: Record<string, string>): string {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'cdd-analysis-'));
  for (const [relativePath, content] of Object.entries(files)) {
    const fullPath = path.join(dir, relativePath);
    fs.mkdirSync(path.dirname(fullPath), { recursive: true });
    fs.writeFileSync(fullPath, content, 'utf-8');
  }
  return dir;
}

describe('analyzeProject', () => {
  it('returns project info from package.json', () => {
    const result = analyzeAll(FIXTURE_DIR);
    expect(result.project.name).toBe('sample-project');
    expect(result.project.version).toBe('0.0.0');
    expect(result.project.language).toBe('typescript');
    expect(result.project.sourceFiles.length).toBeGreaterThan(0);
  });

  it('prefers src/index.ts as the entry point when package main is absent', () => {
    const dir = makeProject({
      'package.json': JSON.stringify({ name: 'entrypoint-project', version: '1.0.0' }),
      'src/domain.ts': 'export interface Product { readonly id: string; }\n',
      'src/index.ts': 'export type { Product } from "./domain.js";\n',
    });

    const result = analyzeAll(dir);

    expect(result.project.entryPoints).toEqual(['src/index.ts']);
  });
});

describe('analysis scope', () => {
  it('uses .cdd sourceDir as the default public surface', () => {
    const dir = makeProject({
      'package.json': JSON.stringify({ name: 'scoped-project', version: '1.0.0' }),
      '.cdd/config.json': JSON.stringify({ sourceDir: 'src' }),
      'src/public.ts': 'export function publicApi(): string { return "ok"; }\n',
      'tests/fixture.ts': 'export function testHelper(): string { return "test"; }\n',
    });

    const result = analyzeAll(dir);

    expect(result.project.sourceFiles).toEqual(['src/public.ts']);
    expect(result.functions.map((fn) => fn.name)).toEqual(['publicApi']);
  });

  it('excludes tests and fixtures by default when no config exists', () => {
    const dir = makeProject({
      'package.json': JSON.stringify({ name: 'default-scope', version: '1.0.0' }),
      'src/index.ts': 'export function publicApi(): string { return "ok"; }\n',
      'tests/index.test.ts': 'export function testHelper(): string { return "test"; }\n',
      'fixtures/example.ts': 'export function fixtureHelper(): string { return "fixture"; }\n',
    });

    const result = analyzeAll(dir);

    expect(result.project.sourceFiles).toEqual(['src/index.ts']);
    expect(result.functions.map((fn) => fn.name)).toEqual(['publicApi']);
  });

  it('can include tests when explicitly requested', () => {
    const dir = makeProject({
      'package.json': JSON.stringify({ name: 'full-scope', version: '1.0.0' }),
      'src/index.ts': 'export function publicApi(): string { return "ok"; }\n',
      'tests/index.test.ts': 'export function testHelper(): string { return "test"; }\n',
    });

    const result = analyzeAll(dir, { includeTests: true });

    expect(result.project.sourceFiles.sort()).toEqual(['src/index.ts', 'tests/index.test.ts']);
    expect(result.functions.map((fn) => fn.name).sort()).toEqual(['publicApi', 'testHelper']);
  });

  it('includes tests on request even when sourceDir is configured', () => {
    const dir = makeProject({
      'package.json': JSON.stringify({ name: 'configured-full-scope', version: '1.0.0' }),
      '.cdd/config.json': JSON.stringify({ sourceDir: 'src' }),
      'src/index.ts': 'export function publicApi(): string { return "ok"; }\n',
      'tests/index.test.ts': 'export function testHelper(): string { return "test"; }\n',
    });

    const result = analyzeAll(dir, { includeTests: true });

    expect(result.project.sourceFiles.sort()).toEqual(['src/index.ts', 'tests/index.test.ts']);
    expect(result.functions.map((fn) => fn.name).sort()).toEqual(['publicApi', 'testHelper']);
  });

  it('includes tests on request even when config include narrows to src', () => {
    const dir = makeProject({
      'package.json': JSON.stringify({ name: 'configured-include-scope', version: '1.0.0' }),
      '.cdd/config.json': JSON.stringify({
        sourceDir: 'src',
        include: ['src/**/*.{ts,tsx,js,jsx,mjs,py,go,rs,java,kt,swift}'],
        exclude: ['tests/**', '**/*.test.*'],
      }),
      'src/index.ts': 'export function publicApi(): string { return "ok"; }\n',
      'tests/index.test.ts': 'export function testHelper(): string { return "test"; }\n',
    });

    const result = analyzeAll(dir, { includeTests: true });

    expect(result.project.sourceFiles.sort()).toEqual(['src/index.ts', 'tests/index.test.ts']);
    expect(result.functions.map((fn) => fn.name).sort()).toEqual(['publicApi', 'testHelper']);
  });
});

describe('analyzeSourceFiles', () => {
  it('parses exported functions', () => {
    const result = analyzeAll(FIXTURE_DIR);
    const fnNames = result.functions.map((f) => f.name);

    expect(fnNames).toContain('add');
    expect(fnNames).toContain('subtract');
    expect(fnNames).toContain('greet');
    expect(fnNames).toContain('fetchData');
  });

  it('distinguishes export kinds', () => {
    const result = analyzeAll(FIXTURE_DIR);
    const add = result.functions.find((f) => f.name === 'add');
    const greet = result.functions.find((f) => f.name === 'greet');

    expect(add?.exportKind).toBe('export');
    expect(greet?.exportKind).toBe('default');
  });

  it('captures function parameters', () => {
    const result = analyzeAll(FIXTURE_DIR);
    const add = result.functions.find((f) => f.name === 'add');
    expect(add?.params).toEqual(['a: number', 'b: number']);
  });

  it('captures return types', () => {
    const result = analyzeAll(FIXTURE_DIR);
    const add = result.functions.find((f) => f.name === 'add');
    expect(add?.returnType).toBe('number');
  });

  it('parses classes with methods and properties', () => {
    const result = analyzeAll(FIXTURE_DIR);
    const calculator = result.classes.find((c) => c.name === 'Calculator');
    expect(calculator).toBeDefined();
    expect(calculator?.methods).toContain('multiply');
    expect(calculator?.properties).toContain('factor');
    expect(calculator?.exportKind).toBe('export');
  });

  it('parses interfaces with members', () => {
    const result = analyzeAll(FIXTURE_DIR);
    const user = result.interfaces.find((i) => i.name === 'User');
    expect(user).toBeDefined();
    expect(user?.members).toContain('name');
    expect(user?.members).toContain('age');
    expect(user?.exportKind).toBe('export');
  });

  it('captures import relationships', () => {
    const result = analyzeAll(FIXTURE_DIR);
    expect(result.imports.length).toBeGreaterThan(0);
    const oneImport = result.imports.find((i) => i.to !== 'fs');
    expect(oneImport).toBeDefined();
  });
});

describe('extractAnnotations', () => {
  it('detects TODOs and FIXMEs', () => {
    const result = analyzeAll(FIXTURE_DIR);
    const todos = result.annotations.filter((a) => a.tag === 'todo');
    const fixmes = result.annotations.filter((a) => a.tag === 'fixme');
    expect(todos.length).toBeGreaterThanOrEqual(1);
    expect(fixmes.length).toBeGreaterThanOrEqual(1);
  });
});
