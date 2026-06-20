export const COMMAND_LABELS = {
  init: '초기화',
  docgen: '문서 생성',
  spec: '아키텍처 스펙',
  design: '디자인 문서',
  changelog: '체인지로그',
  review: '코드 리뷰',
  context: 'AI 컨텍스트',
  prompt: '프롬프트 팩',
  uninstall: 'CDD 제거',
  update: '업데이트',
  doctor: '상태 진단',
  verify: '준비 상태 확인',
  sync: '문서 동기화',
  ai: 'AI 라우팅 설치',
} as const;

export const COMMAND_HINTS = {
  init: 'CDD 설정 초기화',
  docgen: 'docs/README.md, docs/api/',
  spec: 'ARCHITECTURE.md',
  design: 'DESIGN.md',
  changelog: 'CHANGELOG.md',
  review: 'CDD 원칙 코드 감사',
  context: 'AI 프롬프트용 컨텍스트 출력',
  prompt: 'ChatGPT/Claude/Gemini 복붙용 프롬프트 팩',
  uninstall: 'CDD 아티팩트 제거',
  update: 'cdd 자체 업데이트',
  doctor: '프로젝트 상태 진단',
  verify: '릴리즈 준비 상태 확인',
  sync: 'docs/spec/design/changelog + AI 라우팅 갱신',
  ai: 'AGENTS/CLAUDE/CODEX/OPENCODE 라우팅 설치',
} as const;

export const COMMAND_NAMES = {
  init: 'init',
  docgen: 'docgen',
  spec: 'spec',
  design: 'design',
  changelog: 'changelog',
  review: 'review',
  context: 'context',
  prompt: 'prompt',
  uninstall: 'uninstall',
  update: 'update',
  doctor: 'doctor',
  verify: 'verify',
  sync: 'sync',
  ai: 'ai install',
} as const;

export type CommandId = keyof typeof COMMAND_LABELS;
export type RunnableCommand = Exclude<CommandId, 'update'>;
export type RecommendedCommand = 'sync' | 'ai' | 'verify' | 'doctor';

export const EXEC_ORDER: readonly RunnableCommand[] = [
  'doctor',
  'init',
  'sync',
  'docgen',
  'spec',
  'design',
  'changelog',
  'ai',
  'review',
  'verify',
  'prompt',
  'context',
  'uninstall',
];

export function commandTitle(command: CommandId): string {
  return `${COMMAND_LABELS[command]} (${COMMAND_NAMES[command]}) — ${COMMAND_HINTS[command]}`;
}
