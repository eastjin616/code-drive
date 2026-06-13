# cdd design 명령어 추가 — 디자인 토큰 추출

- 날짜: 2026-06-13
- 카테고리: Added

## 왜 변경했는가 (배경)

CDD의 핵심 철학은 "코드가 유일한 진실 공급원"이다. 기존에는 기능/아키텍처 문서(docgen, spec)만 자동 생성할 수 있었지만, 디자인 시스템 정보(색상, 폰트, 간격 등)는 별도로 관리되어 코드와 금방 달라졌다. CSS 변수와 TS 상수에 정의된 디자인 토큰을 코드에서 직접 추출하여 DESIGN.md로 자동 생성함으로써, 디자인 문서도 최신 상태로 유지할 수 있게 한다.

## 어떻게 구현했는가

### 구조

- `src/core/design-extractor.ts` — CSS, TS, Tailwind config에서 디자인 토큰을 추출하는 파싱 엔진
- `src/core/design-generator.ts` — 추출된 토큰을 DESIGN.md 마크다운으로 포맷
- `src/commands/design.ts` — CLI 명령어 인터페이스

### 핵심 결정

| 결정 | 선택 | 사유 |
|------|------|------|
| 추출 범위 | CSS 변수 + TS 상수 + Tailwind | 가장 일반적인 디자인 토큰 저장 방식 3가지를 모두 커버 |
| 색상 카테고리 분류 | primary/semantic/neutral 등 | 자동 분류로 사용자가 바로 DESIGN.md를 읽을 수 있도록 |
| dogfooding | code-drive 프로젝트 자체 분석 가능 | `cdd design`으로 이 변경사항도 검증 완료 |

### 추출 항목

- **색상**: CSS `--color-*` 변수, TS `const colors = {}` 객체, Tailwind `theme.colors`
- **타이포그래피**: `--font-*`, `--fs-*` 변수 (폰트 패밀리 + 사이즈)
- **간격**: `--spacing-*` 변수
- **테두리 둥글기**: `--radius-*` 변수
- **그림자**: `--shadow-*` 변수
- **Tailwind**: config 파일 존재 여부 자동 감지

## 영향 및 마이그레이션

- **하위 호환성**: 기존 명령어에 영향 없음
- **필요한 조치**: 별도 조치 불필요. `cdd design` 명령어를 원하는 프로젝트에서 실행하면 DESIGN.md 생성
- **사용 예**: `cdd design` (기본), `cdd design -o ./docs/DESIGN.md` (경로 지정)
