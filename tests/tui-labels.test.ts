import { describe, expect, it } from 'vitest';
import { COMMAND_HINTS, COMMAND_LABELS, EXEC_ORDER } from '../src/tui-labels.js';
import { DONE_MESSAGES, OUTPUT_FILES, START_MESSAGES } from '../src/tui-messages.js';

describe('prompt TUI metadata', () => {
  it('registers prompt as a stdout command', () => {
    expect(COMMAND_LABELS.prompt).toContain('프롬프트');
    expect(COMMAND_HINTS.prompt).toContain('프롬프트 팩');
    expect(START_MESSAGES.prompt).toContain('프롬프트');
    expect(DONE_MESSAGES.prompt).toContain('프롬프트');
    expect(EXEC_ORDER.filter((command) => command === 'prompt')).toHaveLength(1);
    expect(OUTPUT_FILES.prompt).toBeUndefined();
  });

  it('uses self-explanatory labels for top-level commands', () => {
    expect(COMMAND_LABELS.verify).toContain('준비 상태');
    expect(COMMAND_LABELS.doctor).toContain('진단');
    expect(COMMAND_LABELS.ai).toContain('AI 라우팅');
    expect(COMMAND_LABELS.sync).toContain('동기화');
  });
});
