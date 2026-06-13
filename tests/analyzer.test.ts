import { describe, it, expect } from 'vitest';
import * as fs from 'node:fs';
import * as path from 'node:path';
import { analyzeAll } from '../src/core/analyzer.js';

const FIXTURE_DIR = path.join(import.meta.dirname, 'fixtures', 'sample-project');

describe('analyzeProject', () => {
  it('returns project info from package.json', () => {
    const result = analyzeAll(FIXTURE_DIR);
    expect(result.project.name).toBe('sample-project');
    expect(result.project.version).toBe('0.0.0');
    expect(result.project.language).toBe('typescript');
    expect(result.project.sourceFiles.length).toBeGreaterThan(0);
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
