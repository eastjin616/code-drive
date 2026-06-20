import { describe, expect, it } from 'vitest';
import { buildTuiStatus } from '../src/tui-status.js';
import type { VerifyResult } from '../src/core/verify.js';

function verifyResult(overrides: Partial<VerifyResult>): VerifyResult {
  return {
    status: 'ready',
    projectName: 'demo',
    checks: [
      { status: 'pass', code: 'node-version', message: 'Node.js v22' },
      { status: 'pass', code: 'artifact-fresh', message: 'DESIGN.md is fresh', target: 'DESIGN.md' },
    ],
    nextActions: [],
    ...overrides,
  };
}

describe('buildTuiStatus', () => {
  it('recommends verify when the project is ready', () => {
    const status = buildTuiStatus(verifyResult({ status: 'ready' }));

    expect(status.recommendedCommand).toBe('verify');
    expect(status.summary).toEqual({
      pass: 2,
      warn: 0,
      fail: 0,
      info: 0,
    });
  });

  it('recommends sync when generated artifacts need refresh', () => {
    const status = buildTuiStatus(verifyResult({
      status: 'needs-sync',
      checks: [
        { status: 'pass', code: 'node-version', message: 'Node.js v22' },
        { status: 'warn', code: 'artifact-missing', message: 'DESIGN.md is missing', target: 'DESIGN.md' },
      ],
      nextActions: ['Run `cdd sync .` to generate or refresh CDD artifacts.'],
    }));

    expect(status.recommendedCommand).toBe('sync');
    expect(status.artifactsNeedingSync).toEqual(['DESIGN.md']);
    expect(status.nextActions).toEqual(['`cdd sync .`를 실행해 CDD 산출물을 생성하거나 최신 상태로 갱신하세요.']);
  });

  it('recommends ai install when only AI routing is missing', () => {
    const status = buildTuiStatus(verifyResult({
      status: 'needs-attention',
      checks: [
        { status: 'pass', code: 'node-version', message: 'Node.js v22' },
        { status: 'fail', code: 'ai-context-missing', message: 'CDD AI context routing is not installed' },
      ],
      nextActions: ['Run `cdd ai install .` to install AI context routing.'],
    }));

    expect(status.recommendedCommand).toBe('ai');
    expect(status.summary.fail).toBe(1);
    expect(status.nextActions).toEqual(['`cdd ai install .`을 실행해 AI 컨텍스트 라우팅을 설치하세요.']);
  });
});
