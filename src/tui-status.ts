import { verifyProject } from './core/verify.js';
import type { VerifyCheckStatus, VerifyResult, VerifyStatus } from './core/verify.js';
import type { RecommendedCommand } from './tui-labels.js';

export interface TuiStatusSummary {
  readonly pass: number;
  readonly warn: number;
  readonly fail: number;
  readonly info: number;
}

export interface TuiStatus {
  readonly projectName: string;
  readonly status: VerifyStatus;
  readonly summary: TuiStatusSummary;
  readonly artifactsNeedingSync: readonly string[];
  readonly nextActions: readonly string[];
  readonly recommendedCommand: RecommendedCommand;
}

const CHECK_STATUSES = ['pass', 'warn', 'fail', 'info'] as const satisfies readonly VerifyCheckStatus[];
const CHECK_STATUS_LABELS = {
  pass: '통과',
  warn: '주의',
  fail: '실패',
  info: '정보',
} as const satisfies Record<VerifyCheckStatus, string>;

function countChecks(result: VerifyResult): TuiStatusSummary {
  const counts: Record<VerifyCheckStatus, number> = {
    pass: 0,
    warn: 0,
    fail: 0,
    info: 0,
  };

  for (const check of result.checks) {
    counts[check.status] += 1;
  }

  return {
    pass: counts.pass,
    warn: counts.warn,
    fail: counts.fail,
    info: counts.info,
  };
}

function hasNextAction(result: VerifyResult, snippet: string): boolean {
  return result.nextActions.some((action) => action.includes(snippet));
}

function chooseRecommendedCommand(result: VerifyResult): RecommendedCommand {
  if (hasNextAction(result, 'cdd sync')) return 'sync';
  if (hasNextAction(result, 'cdd ai install')) return 'ai';
  if (result.status === 'ready') return 'verify';
  return 'doctor';
}

function collectArtifactsNeedingSync(result: VerifyResult): readonly string[] {
  return result.checks
    .filter((check) => check.code === 'artifact-missing' || check.code === 'artifact-stale')
    .map((check) => check.target ?? check.message);
}

function localizeNextAction(action: string): string {
  if (action.includes('cdd sync')) {
    return '`cdd sync .`를 실행해 CDD 산출물을 생성하거나 최신 상태로 갱신하세요.';
  }
  if (action.includes('cdd ai install')) {
    return '`cdd ai install .`을 실행해 AI 컨텍스트 라우팅을 설치하세요.';
  }
  if (action.includes('.cdd/config.json')) {
    return '`.cdd/config.json`의 sourceDir/include/exclude 설정을 확인하세요.';
  }
  if (action.includes('cdd review')) {
    return '`cdd review .`를 실행하고 review error를 수정하세요.';
  }
  return action;
}

export function buildTuiStatus(result: VerifyResult): TuiStatus {
  return {
    projectName: result.projectName,
    status: result.status,
    summary: countChecks(result),
    artifactsNeedingSync: collectArtifactsNeedingSync(result),
    nextActions: result.nextActions.map(localizeNextAction),
    recommendedCommand: chooseRecommendedCommand(result),
  };
}

export function readTuiStatus(projectDir: string): TuiStatus {
  return buildTuiStatus(verifyProject(projectDir));
}

export function statusSummaryParts(summary: TuiStatusSummary): readonly string[] {
  return CHECK_STATUSES
    .map((status) => `${summary[status]} ${CHECK_STATUS_LABELS[status]}`)
    .filter((part) => !part.startsWith('0 '));
}
