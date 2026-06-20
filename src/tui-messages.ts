import type { RunnableCommand } from './tui-labels.js';

export const START_MESSAGES: Record<RunnableCommand, string> = {
  init: '초기화 중...',
  docgen: '코드베이스 스캔 중...',
  spec: '아키텍처 분석 중...',
  review: '코드 감사 중...',
  context: '컨텍스트 수집 중...',
  prompt: '프롬프트 팩 생성 중...',
  uninstall: 'CDD 제거 중...',
  design: '디자인 토큰 추출 중...',
  changelog: 'Git 히스토리 분석 중...',
  doctor: '프로젝트 상태 확인 중...',
  verify: '릴리즈 준비 상태 확인 중...',
  sync: 'CDD 문서와 AI 라우팅 동기화 중...',
  ai: 'AI context routing 설치 중...',
};

export const DONE_MESSAGES: Record<RunnableCommand, string> = {
  init: '초기화 완료',
  docgen: '문서 생성 완료',
  spec: '스펙 생성 완료',
  review: '리뷰 완료',
  context: '컨텍스트 출력 완료',
  prompt: '프롬프트 팩 출력 완료',
  uninstall: '제거 완료',
  design: '디자인 스펙 생성 완료',
  changelog: '체인지로그 생성 완료',
  doctor: '진단 완료',
  verify: '검증 완료',
  sync: '동기화 완료',
  ai: 'AI 라우팅 설치 완료',
};

export const OUTPUT_FILES: Partial<Record<RunnableCommand, string>> = {
  docgen: 'docs/README.md',
  spec: 'ARCHITECTURE.md',
  design: 'DESIGN.md',
  changelog: 'CHANGELOG.md',
};
