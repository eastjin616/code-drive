import { describe, it, expect } from 'vitest';
import type {
  ProjectInfo,
  FunctionDecl,
  ClassDecl,
  InterfaceDecl,
  ImportEdge,
  CodeAnnotation,
} from '../src/core/analyzer.js';
import {
  generateReadmeDocs,
  generateApiDocs,
  generateArchitectureSpec,
} from '../src/core/generator.js';

const sampleProject: ProjectInfo = {
  name: 'test-project',
  version: '1.0.0',
  language: 'typescript',
  sourceFiles: ['src/index.ts', 'src/utils.ts'],
  entryPoints: ['src/index.ts'],
  dependencies: ['express'],
};

const sampleFunctions: FunctionDecl[] = [
  {
    name: 'add',
    file: 'src/math.ts',
    line: 10,
    exportKind: 'export',
    params: ['a: number', 'b: number'],
    returnType: 'number',
    doc: '@param a First number\n@param b Second number',
  },
  {
    name: 'helper',
    file: 'src/internal.ts',
    line: 5,
    exportKind: 'none',
    params: [],
    returnType: '',
    doc: '',
  },
];

const sampleClasses: ClassDecl[] = [
  {
    name: 'Calculator',
    file: 'src/calc.ts',
    line: 12,
    exportKind: 'export',
    methods: ['multiply', 'divide'],
    properties: ['factor'],
    extendsClause: '',
    doc: 'A calculator class',
  },
];

const sampleInterfaces: InterfaceDecl[] = [
  {
    name: 'User',
    file: 'src/types.ts',
    line: 1,
    exportKind: 'export',
    members: ['name', 'age'],
    doc: '',
  },
];

const sampleAnnotations: CodeAnnotation[] = [
  { file: 'src/index.ts', line: 15, tag: 'todo', content: 'add error handling' },
];

describe('generateReadmeDocs', () => {
  it('includes project metadata', () => {
    const doc = generateReadmeDocs(
      sampleProject,
      sampleFunctions,
      sampleClasses,
      sampleInterfaces,
      sampleAnnotations,
    );
    expect(doc).toContain('test-project');
    expect(doc).toContain('1.0.0');
    expect(doc).toContain('typescript');
    expect(doc).toContain('express');
  });

  it('lists exported functions only', () => {
    const doc = generateReadmeDocs(
      sampleProject,
      sampleFunctions,
      sampleClasses,
      sampleInterfaces,
      sampleAnnotations,
    );
    expect(doc).toContain('add');
    expect(doc).not.toContain('helper');
  });

  it('lists exported classes', () => {
    const doc = generateReadmeDocs(
      sampleProject,
      sampleFunctions,
      sampleClasses,
      sampleInterfaces,
      sampleAnnotations,
    );
    expect(doc).toContain('Calculator');
    expect(doc).toContain('multiply');
  });

  it('lists exported interfaces', () => {
    const doc = generateReadmeDocs(
      sampleProject,
      sampleFunctions,
      sampleClasses,
      sampleInterfaces,
      sampleAnnotations,
    );
    expect(doc).toContain('User');
    expect(doc).toContain('name');
  });

  it('includes annotations table', () => {
    const doc = generateReadmeDocs(
      sampleProject,
      sampleFunctions,
      sampleClasses,
      sampleInterfaces,
      sampleAnnotations,
    );
    expect(doc).toContain('todo');
    expect(doc).toContain('add error handling');
  });
});

describe('generateApiDocs', () => {
  it('generates function signatures', () => {
    const doc = generateApiDocs('src/math.ts', sampleFunctions, [], []);
    expect(doc).toContain('add');
    expect(doc).toContain('a: number');
    expect(doc).toContain('b: number');
    expect(doc).toContain('export function add');
  });

  it('generates class documentation', () => {
    const doc = generateApiDocs('src/calc.ts', [], sampleClasses, []);
    expect(doc).toContain('Calculator');
    expect(doc).toContain('multiply');
    expect(doc).toContain('factor');
  });

  it('generates interface documentation', () => {
    const doc = generateApiDocs('src/types.ts', [], [], sampleInterfaces);
    expect(doc).toContain('User');
    expect(doc).toContain('name');
  });
});

describe('generateArchitectureSpec', () => {
  it('includes project overview', () => {
    const doc = generateArchitectureSpec(
      sampleProject,
      sampleFunctions,
      sampleClasses,
      sampleInterfaces,
      [],
    );
    expect(doc).toContain('test-project');
    expect(doc).toContain('2');
    expect(doc).toContain('Source files');
  });

  it('includes dependency graph', () => {
    const imports: ImportEdge[] = [{ from: 'src/index.ts', to: 'src/math.ts', symbols: ['add'] }];
    const doc = generateArchitectureSpec(
      sampleProject,
      sampleFunctions,
      sampleClasses,
      sampleInterfaces,
      imports,
    );
    expect(doc).toContain('src/index.ts');
    expect(doc).toContain('src/math.ts');
    expect(doc).toContain('add');
  });
});
