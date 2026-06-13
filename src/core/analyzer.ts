import * as fs from 'node:fs';
import * as path from 'node:path';
import ts from 'typescript';
import { globSync } from 'glob';

// ─── Types ────────────────────────────────────────────────────────────

export interface ProjectInfo {
  name: string;
  version: string;
  language: string;
  sourceFiles: string[];
  entryPoints: string[];
  dependencies: string[];
}

export interface FunctionDecl {
  name: string;
  file: string;
  line: number;
  exportKind: 'export' | 'default' | 'none';
  params: string[];
  returnType: string;
  doc: string;
}

export interface ClassDecl {
  name: string;
  file: string;
  line: number;
  exportKind: 'export' | 'default' | 'none';
  methods: string[];
  properties: string[];
  extendsClause: string;
  doc: string;
}

export interface InterfaceDecl {
  name: string;
  file: string;
  line: number;
  exportKind: 'export' | 'none';
  members: string[];
  doc: string;
}

export interface ImportEdge {
  from: string;
  to: string;
  symbols: string[];
}

export interface CodeAnnotation {
  file: string;
  line: number;
  tag: string;
  content: string;
}

export interface AnalysisResult {
  project: ProjectInfo;
  functions: FunctionDecl[];
  classes: ClassDecl[];
  interfaces: InterfaceDecl[];
  imports: ImportEdge[];
  annotations: CodeAnnotation[];
}

// ─── Helpers ──────────────────────────────────────────────────────────

const LANG_EXTENSIONS: Record<string, string[]> = {
  typescript: ['.ts', '.tsx'],
  javascript: ['.js', '.jsx', '.mjs'],
  python: ['.py'],
  go: ['.go'],
  rust: ['.rs'],
  java: ['.java'],
  kotlin: ['.kt'],
  swift: ['.swift'],
};

function detectLanguage(ext: string): string {
  for (const [lang, exts] of Object.entries(LANG_EXTENSIONS)) {
    if (exts.includes(ext)) return lang;
  }
  return 'unknown';
}

function getJSDoc(node: ts.Node, _sourceFile: ts.SourceFile): string {
  const tags = ts.getJSDocTags(node);
  if (tags.length > 0) {
    return tags
      .map((tag) => {
        const comment = tag.comment;
        const tagName = tag.tagName.getText();
        return comment ? `@${tagName} ${comment}` : `@${tagName}`;
      })
      .join('\n');
  }
  return '';
}

function getNodeText(node: ts.Node | undefined): string {
  if (!node) return '';
  return node.getText().replace(/\n/g, ' ').replace(/\s+/g, ' ').trim();
}

// ─── Source File Parser ───────────────────────────────────────────────

function parseSourceFile(
  filePath: string,
  relativePath: string,
): {
  functions: FunctionDecl[];
  classes: ClassDecl[];
  interfaces: InterfaceDecl[];
  imports: ImportEdge[];
} {
  const functions: FunctionDecl[] = [];
  const classes: ClassDecl[] = [];
  const interfaces: InterfaceDecl[] = [];
  const imports: ImportEdge[] = [];

  const sourceText = fs.readFileSync(filePath, 'utf-8');
  const sourceFile = ts.createSourceFile(relativePath, sourceText, ts.ScriptTarget.Latest, true);

  function visit(node: ts.Node) {
    // Import declarations
    if (ts.isImportDeclaration(node)) {
      const moduleSpecifier = node.moduleSpecifier.getText().replace(/['"]/g, '');
      const symbols = node.importClause ? node.importClause.getText() : '';
      imports.push({
        from: relativePath,
        to: moduleSpecifier,
        symbols: symbols ? [symbols] : [],
      });
    }

    // Function declarations
    if (ts.isFunctionDeclaration(node) && node.name) {
      const modifiers = node.modifiers?.map((m) => m.getText()) ?? [];
      functions.push({
        name: node.name.getText(),
        file: relativePath,
        line: sourceFile.getLineAndCharacterOfPosition(node.getStart()).line + 1,
        exportKind: modifiers.includes('export')
          ? modifiers.includes('default')
            ? 'default'
            : 'export'
          : 'none',
        params: node.parameters.map((p) => p.getText()),
        returnType: getNodeText(node.type),
        doc: getJSDoc(node, sourceFile),
      });
    }

    // Exported const arrow/function expressions
    if (ts.isVariableStatement(node) && node.modifiers?.some((m) => m.getText() === 'export')) {
      for (const decl of node.declarationList.declarations) {
        if (
          decl.name &&
          ts.isIdentifier(decl.name) &&
          decl.initializer &&
          (ts.isArrowFunction(decl.initializer) || ts.isFunctionExpression(decl.initializer))
        ) {
          const fnExpr = decl.initializer;
          functions.push({
            name: decl.name.getText(),
            file: relativePath,
            line: sourceFile.getLineAndCharacterOfPosition(decl.getStart()).line + 1,
            exportKind: 'export',
            params: fnExpr.parameters.map((p) => p.getText()),
            returnType: getNodeText(decl.type),
            doc: getJSDoc(node, sourceFile),
          });
        }
      }
    }

    // Class declarations
    if (ts.isClassDeclaration(node) && node.name) {
      const modifiers = node.modifiers?.map((m) => m.getText()) ?? [];
      classes.push({
        name: node.name.getText(),
        file: relativePath,
        line: sourceFile.getLineAndCharacterOfPosition(node.getStart()).line + 1,
        exportKind: modifiers.includes('export')
          ? modifiers.includes('default')
            ? 'default'
            : 'export'
          : 'none',
        methods: node.members
          .filter(ts.isMethodDeclaration)
          .map((m) => m.name?.getText() ?? '(unnamed)'),
        properties: node.members
          .filter((m) => ts.isPropertyDeclaration(m))
          .map((m) => m.name?.getText() ?? '(unnamed)'),
        extendsClause:
          node.heritageClauses
            ?.filter((c) => c.token === ts.SyntaxKind.ExtendsKeyword)
            .flatMap((c) => c.types.map((t) => t.getText()))
            .join(', ') ?? '',
        doc: getJSDoc(node, sourceFile),
      });
    }

    // Interface declarations
    if (ts.isInterfaceDeclaration(node) && node.name) {
      const modifiers = node.modifiers?.map((m) => m.getText()) ?? [];
      interfaces.push({
        name: node.name.getText(),
        file: relativePath,
        line: sourceFile.getLineAndCharacterOfPosition(node.getStart()).line + 1,
        exportKind: modifiers.includes('export') ? 'export' : 'none',
        members: node.members.map((m) => m.name?.getText() ?? '(unnamed)'),
        doc: getJSDoc(node, sourceFile),
      });
    }

    ts.forEachChild(node, visit);
  }

  visit(sourceFile);
  return { functions, classes, interfaces, imports };
}

// ─── Public API ───────────────────────────────────────────────────────

export function analyzeProject(dir: string): ProjectInfo {
  const pkgPath = path.join(dir, 'package.json');
  const pkg = fs.existsSync(pkgPath) ? JSON.parse(fs.readFileSync(pkgPath, 'utf-8')) : {};

  const sourceFiles = globSync('**/*.{ts,tsx,js,jsx,mjs,py,go,rs,java,kt,swift}', {
    cwd: dir,
    ignore: ['node_modules/**', 'dist/**', 'build/**', '.git/**', 'target/**'],
  });

  const detectedLang =
    sourceFiles.length > 0 ? detectLanguage(path.extname(sourceFiles[0])) : 'unknown';

  return {
    name: pkg.name || path.basename(dir),
    version: pkg.version || '0.0.0',
    language: detectedLang,
    sourceFiles,
    entryPoints: pkg.main ? [pkg.main] : sourceFiles.slice(0, 1),
    dependencies: Object.keys(pkg.dependencies || {}),
  };
}

export function analyzeSourceFiles(dir: string): {
  functions: FunctionDecl[];
  classes: ClassDecl[];
  interfaces: InterfaceDecl[];
  imports: ImportEdge[];
} {
  const allFunctions: FunctionDecl[] = [];
  const allClasses: ClassDecl[] = [];
  const allInterfaces: InterfaceDecl[] = [];
  const allImports: ImportEdge[] = [];

  const sourceFiles = globSync('**/*.{ts,tsx}', {
    cwd: dir,
    ignore: ['node_modules/**', 'dist/**', 'build/**', '.git/**', 'target/**'],
  });

  for (const file of sourceFiles) {
    const fullPath = path.join(dir, file);
    try {
      const result = parseSourceFile(fullPath, file);
      allFunctions.push(...result.functions);
      allClasses.push(...result.classes);
      allInterfaces.push(...result.interfaces);
      allImports.push(...result.imports);
    } catch {
      // Skip files that can't be parsed
    }
  }

  return {
    functions: allFunctions,
    classes: allClasses,
    interfaces: allInterfaces,
    imports: allImports,
  };
}

export function extractAnnotations(dir: string): CodeAnnotation[] {
  const annotations: CodeAnnotation[] = [];
  const sourceFiles = globSync('**/*.{ts,tsx,js,jsx,py,go,rs,java,kt,swift}', {
    cwd: dir,
    ignore: ['node_modules/**', 'dist/**', 'build/**', '.git/**', 'target/**'],
  });

  for (const file of sourceFiles.slice(0, 50)) {
    const fullPath = path.join(dir, file);
    try {
      const content = fs.readFileSync(fullPath, 'utf-8');
      const lines = content.split('\n');
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        const match = line.match(
          /(?:\/\/\/?\s*@?(todo|fixme|hack|note|review|warning|deprecated|module|function|description|param|returns?))\s*:\s*(.+)/i,
        );
        if (match) {
          annotations.push({
            file,
            line: i + 1,
            tag: match[1].toLowerCase(),
            content: match[2].trim(),
          });
        }
      }
    } catch {
      // Skip unreadable files
    }
  }

  return annotations;
}

export function analyzeAll(dir: string): AnalysisResult {
  const project = analyzeProject(dir);
  const { functions, classes, interfaces, imports } = analyzeSourceFiles(dir);
  const annotations = extractAnnotations(dir);

  return { project, functions, classes, interfaces, imports, annotations };
}
