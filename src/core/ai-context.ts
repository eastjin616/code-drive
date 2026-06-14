import * as fs from 'node:fs';
import * as path from 'node:path';

export const CDD_AI_CONTEXT_START = '<!-- cdd:ai-context:start -->';
export const CDD_AI_CONTEXT_END = '<!-- cdd:ai-context:end -->';

const AI_INSTRUCTION_FILES = ['AGENTS.md', 'CLAUDE.md', 'CODEX.md', 'OPENCODE.md'] as const;
const DEFAULT_AI_INSTRUCTION_FILE = 'AGENTS.md';

export interface AiContextInstallResult {
  readonly targetFiles: readonly string[];
  readonly createdFiles: readonly string[];
  readonly updatedFiles: readonly string[];
}

export interface AiContextRemoveResult {
  readonly targetFiles: readonly string[];
  readonly updatedFiles: readonly string[];
  readonly unchangedFiles: readonly string[];
}

export function findAiContextFiles(projectDir: string): readonly string[] {
  if (!fs.existsSync(projectDir)) return [];

  return AI_INSTRUCTION_FILES.filter((fileName) => {
    const filePath = path.join(projectDir, fileName);
    if (!fs.existsSync(filePath) || !fs.statSync(filePath).isFile()) return false;
    const content = fs.readFileSync(filePath, 'utf-8');
    return content.includes(CDD_AI_CONTEXT_START) && content.includes(CDD_AI_CONTEXT_END);
  });
}

export function generateAiContextBlock(): string {
  return [
    CDD_AI_CONTEXT_START,
    '## CDD Context Routing',
    '',
    'This project uses CDD-generated context files. Use them as task-specific context, not as the final authority.',
    '',
    '- For project/API overview, read `docs/README.md` when it exists.',
    '- For architecture, module boundaries, entry points, imports, or dependency changes, read `ARCHITECTURE.md` when it exists.',
    '- For UI, UX, styling, layout, colors, spacing, typography, or design-token work, read `DESIGN.md` when it exists.',
    '- For release notes, versioning, migrations, or recent-change context, read `CHANGELOG.md` when it exists.',
    '- Read `.cdd/config.json` to understand CDD source scope and generated artifact settings.',
    '- If generated docs conflict with source code, trust source code and run `cdd sync`.',
    CDD_AI_CONTEXT_END,
  ].join('\n');
}

export function upsertAiContextBlock(content: string, block = generateAiContextBlock()): string {
  const startIndex = content.indexOf(CDD_AI_CONTEXT_START);
  const endIndex = content.indexOf(CDD_AI_CONTEXT_END);

  if (startIndex >= 0 && endIndex > startIndex) {
    const afterEnd = endIndex + CDD_AI_CONTEXT_END.length;
    const prefix = content.slice(0, startIndex).trimEnd();
    const suffix = content.slice(afterEnd).trimStart();
    return suffix ? `${prefix}\n\n${block}\n\n${suffix}` : `${prefix}\n\n${block}\n`;
  }

  const trimmed = content.trimEnd();
  return trimmed ? `${trimmed}\n\n${block}\n` : `${block}\n`;
}

export function removeAiContextBlock(content: string): string {
  const startIndex = content.indexOf(CDD_AI_CONTEXT_START);
  const endIndex = content.indexOf(CDD_AI_CONTEXT_END);

  if (startIndex < 0 || endIndex <= startIndex) return content;

  const afterEnd = endIndex + CDD_AI_CONTEXT_END.length;
  const prefix = content.slice(0, startIndex).trimEnd();
  const suffix = content.slice(afterEnd).trimStart();
  if (prefix && suffix) return `${prefix}\n\n${suffix}`;
  if (prefix) return `${prefix}\n`;
  if (suffix) return suffix;
  return '';
}

export function installAiContext(projectDir: string): AiContextInstallResult {
  if (!fs.existsSync(projectDir)) {
    throw new Error(`Directory not found: ${projectDir}`);
  }

  const existingFiles = AI_INSTRUCTION_FILES.filter((fileName) => {
    const filePath = path.join(projectDir, fileName);
    return fs.existsSync(filePath) && fs.statSync(filePath).isFile();
  });
  const targetFiles = existingFiles.length > 0 ? existingFiles : [DEFAULT_AI_INSTRUCTION_FILE];
  const createdFiles: string[] = [];
  const updatedFiles: string[] = [];

  for (const fileName of targetFiles) {
    const filePath = path.join(projectDir, fileName);
    const existed = fs.existsSync(filePath);
    const current = existed ? fs.readFileSync(filePath, 'utf-8') : '';
    const next = upsertAiContextBlock(current);
    fs.writeFileSync(filePath, next, 'utf-8');

    if (existed) {
      updatedFiles.push(fileName);
    } else {
      createdFiles.push(fileName);
    }
  }

  return {
    targetFiles,
    createdFiles,
    updatedFiles,
  };
}

export function removeAiContext(projectDir: string): AiContextRemoveResult {
  if (!fs.existsSync(projectDir)) {
    throw new Error(`Directory not found: ${projectDir}`);
  }

  const targetFiles = AI_INSTRUCTION_FILES.filter((fileName) => {
    const filePath = path.join(projectDir, fileName);
    return fs.existsSync(filePath) && fs.statSync(filePath).isFile();
  });
  const updatedFiles: string[] = [];
  const unchangedFiles: string[] = [];

  for (const fileName of targetFiles) {
    const filePath = path.join(projectDir, fileName);
    const current = fs.readFileSync(filePath, 'utf-8');
    const next = removeAiContextBlock(current);

    if (next === current) {
      unchangedFiles.push(fileName);
    } else {
      fs.writeFileSync(filePath, next, 'utf-8');
      updatedFiles.push(fileName);
    }
  }

  return {
    targetFiles,
    updatedFiles,
    unchangedFiles,
  };
}
