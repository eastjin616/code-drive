import * as path from 'node:path';
import { generatePromptPack } from '../core/prompt-pack.js';

export interface PromptCommandOptions {
  readonly file?: string;
  readonly includeTests?: boolean;
}

export async function promptCommand(dir: string, options: PromptCommandOptions = {}): Promise<void> {
  const targetDir = path.resolve(dir);
  console.log(generatePromptPack(targetDir, options));
}
