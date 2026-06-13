import * as fs from 'node:fs';
import * as path from 'node:path';
import { globSync } from 'glob';

export interface ProjectInfo {
  name: string;
  version: string;
  language: string;
  sourceFiles: string[];
  entryPoints: string[];
  dependencies: string[];
}

export interface ModuleStructure {
  name: string;
  path: string;
  exports: string[];
  imports: string[];
  subModules: ModuleStructure[];
}

export interface CodeAnnotation {
  file: string;
  line: number;
  tag: string;
  content: string;
}

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

function detectLanguage(sourceFiles: string[]): string {
  const extCounts: Record<string, number> = {};
  for (const f of sourceFiles) {
    const ext = path.extname(f);
    extCounts[ext] = (extCounts[ext] || 0) + 1;
  }
  for (const [lang, exts] of Object.entries(LANG_EXTENSIONS)) {
    for (const ext of exts) {
      if (extCounts[ext] && extCounts[ext] > 0) return lang;
    }
  }
  return 'unknown';
}

export function analyzeProject(dir: string): ProjectInfo {
  const pkgPath = path.join(dir, 'package.json');
  const pkg = fs.existsSync(pkgPath)
    ? JSON.parse(fs.readFileSync(pkgPath, 'utf-8'))
    : {};

  const sourceFiles = globSync('**/*.{ts,tsx,js,jsx,mjs,py,go,rs,java,kt,swift}', {
    cwd: dir,
    ignore: ['node_modules/**', 'dist/**', 'build/**', '.git/**', 'target/**'],
  });

  return {
    name: pkg.name || path.basename(dir),
    version: pkg.version || '0.0.0',
    language: detectLanguage(sourceFiles),
    sourceFiles,
    entryPoints: pkg.main ? [pkg.main] : sourceFiles.slice(0, 1),
    dependencies: Object.keys(pkg.dependencies || {}),
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
        // Match common annotation patterns: @tag, /// tag, # tag, --tag
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

export function buildModuleTree(dir: string, sourceDir: string): ModuleStructure[] {
  const modules: ModuleStructure[] = [];
  const srcPath = path.join(dir, sourceDir);

  if (!fs.existsSync(srcPath)) return modules;

  const entries = fs.readdirSync(srcPath, { withFileTypes: true });
  for (const entry of entries) {
    if (entry.isDirectory() && !entry.name.startsWith('.')) {
      const modulePath = path.join(srcPath, entry.name);
      const files = globSync('**/*.{ts,tsx,js,jsx}', {
        cwd: modulePath,
        ignore: ['node_modules/**', 'dist/**'],
      });
      modules.push({
        name: entry.name,
        path: path.join(sourceDir, entry.name),
        exports: files,
        imports: [],
        subModules: [],
      });
    }
  }

  return modules;
}
