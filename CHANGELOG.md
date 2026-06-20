## [HEAD] — 2026-06-18

### Added

- cdd doctor 명령어 추가 — 프로젝트 건강 상태 진단 (Node/Git/CDD/Artifacts)
  → src/commands/doctor.ts, src/cli.ts, src/tui.ts
- cdd verify 명령어 추가 — config, 생성 문서 최신성, AI 라우팅, review 에러를 하나의 release-readiness 상태로 점검
  → src/core/verify.ts, src/commands/verify.ts, tests/verify.test.ts
- cdd ai install 명령어 추가 — AGENTS.md/CLAUDE.md/CODEX.md/OPENCODE.md에 CDD 문서 라우팅 블록 설치/복구
  → src/core/ai-context.ts, src/commands/ai.ts, tests/ai-context.test.ts

### Fixed

- design-extractor: 주석 속 export const RED = '#ff0000' 를 실제 토큰으로 착각하는 false positive 수정
  → stripComments() 추가로 주석 제거 후 regex 실행
- 모든 명령어: process.exit(1) 대신 throw Error 로 변경 — TUI에서 실행 시 메뉴 복귀 가능
  → src/commands/*.ts, src/cli.ts (exitOnError wrapper)
- color swatch: placehold.co 외부 이미지 → inline HTML span (GitHub/terminal 전부 작동)
  → src/core/design-generator.ts
- sync --output: --output ./custom 이 subcommand에 전달 안 되던 버그 수정
  → src/commands/sync.ts
- context: chalk ANSI 코드 제거 — AI 프롬프트 출력용 순수 텍스트
  → src/commands/context.ts (모든 chalk.dim/chalk.cyan 제거)
- verify: 빈 interface 타입을 alias로 바꿔 lint rule과 타입 의미를 동시에 만족
  → src/core/verify.ts
- design: 토큰이 없는 프로젝트에서 빈 목차만 있는 DESIGN.md 대신 AI 사용 지침과 토큰 추가 가이드를 생성
  → src/core/design-generator.ts, tests/design-generator.test.ts
- design: CSS custom property가 아니어도 일반 CSS rule의 색상, spacing, radius, shadow, typography 사용을 DESIGN.md에 기록
  → src/core/design-style-usage.ts, src/core/design-extractor.ts, src/core/design-generator.ts, tests/design-extractor.test.ts
- design: 디렉터리 인자를 받았을 때 기본 DESIGN.md 출력 위치를 현재 작업 디렉터리가 아닌 대상 프로젝트로 수정
  → src/cli.ts, src/commands/design.ts
- design/changelog: 프로젝트가 아닌 workspace/root에서 실행될 때 루트 DESIGN.md/CHANGELOG.md 생성을 건너뛰도록 수정
  → src/core/project-detector.ts, src/commands/design.ts, src/commands/changelog.ts, tests/design-command.test.ts, tests/changelog.test.ts
- changelog: 디렉터리 인자를 받았을 때 기본 CHANGELOG.md 출력 위치를 현재 작업 디렉터리가 아닌 대상 프로젝트로 수정
  → src/cli.ts, src/commands/changelog.ts

### Changed

- cdd update 명령어 추가 — npm 업데이트 및 버전 확인
  → src/commands/update.ts, src/cli.ts, src/tui.ts
- init/sync: AI 시작 문서에 CDD context-routing block 자동 설치/갱신
  → src/commands/init.ts, src/commands/sync.ts, src/core/ai-context.ts
- uninstall: CDD managed AI block 제거 여부를 yes/no로 묻고, `--remove-ai-context` / `--keep-ai-context` 자동화 옵션 추가
  → src/commands/uninstall.ts
- review: CLI 출력 로직과 rule 수집 로직 분리 — verify가 review error 상태를 재사용 가능
  → src/core/review-rules.ts, src/commands/review.ts
- TUI 메뉴 개편: uninstall을 맨 아래로 이동, multiselect required: true, 디렉토리 프롬프트 제거
  → src/tui.ts
- TUI 메뉴에 verify 추가 — 첫 화면 실행과 권장 전체 흐름에 release-readiness 확인 포함
  → src/tui.ts
- TUI 명령 타입을 상수 기반 union으로 좁혀 assertion 없이 실행 순서를 계산
  → src/tui.ts
- TUI를 프로젝트 대시보드 중심 흐름으로 개편 — verify 기반 상태 요약, 추천 액션, sync/ai install 직접 실행 추가
  → src/tui.ts, src/tui-runner.ts, src/tui-status.ts, src/tui-view.ts, src/tui-labels.ts, src/tui-messages.ts, tests/tui-status.test.ts

### Docs

- README/README.ko: doctor, verify, ai install, uninstall AI block 옵션, TUI 흐름, 최신 CLI 옵션 반영
  → README.md, README.ko.md

### Cleanup

- context.ts: 미사용 annotations destructure + fmt() 함수 제거
- design-extractor.ts: 미사용 CSS_VAR_PATTERNS 상수 (23줄) 제거

## [31fdb7b] — 2026-06-13

### Added

- cdd sync 명령어 추가 — docgen + spec + design + changelog 순차 실행
  → src/commands/sync.ts, src/cli.ts
- cdd changelog 명령어 추가 — git 히스토리 기반 CHANGELOG.md 생성
  → src/commands/changelog.ts, src/core/changelog-parser.ts, src/core/changelog-generator.ts, tests/changelog.test.ts, src/cli.ts
- DESIGN.md mergeWithExisting — 기존 내용 보존 + 신규 내용 상단 추가
  → src/core/design-generator.ts, src/commands/design.ts

### Changed

- TUI 전면 개편: select(3모드) → groupMultiselect(📄생성/🔍분석/⚡모두선택), init/uninstall 분리
  → src/tui.ts
- README 한국어판 업데이트 — TUI 구조, 신규 명령어 반영
  → README.ko.md
- npm publish 완료 — scoped package @eastjin616/code-drive@0.2.0
  → package.json
- README: TUI 구조, sync 명령어, scoped package 반영
  → README.md

## [2cee783e8c6ca8aee7933c2c2e8703e127ce37f2] — 2026-06-13

### Added

- cdd design 명령어 추가 — CSS/TS에서 디자인 토큰 추출
  → src/cli.ts, src/commands/design.ts, src/core/design-extractor.ts, src/core/design-generator.ts, src/tui.ts
- cdd context 명령어 추가
  → src/cli.ts, src/commands/context.ts, src/tui.ts
- cdd uninstall 명령어 추가
  → src/cli.ts, src/commands/uninstall.ts, src/tui.ts
- TUI 모드 추가
  → src/cli.ts, src/tui.ts
- watch 모드 + 명령어 개선
  → src/cli.ts, src/commands/docgen.ts, src/commands/init.ts, src/commands/spec.ts
- review 명령어 추가 — CDD 원칙 코드 감사
  → src/commands/review.ts
- generator 강화 — Public API 표, API 문서, Arch Spec 생성
  → src/core/generator.ts

### Changed

- cdd 기본 실행을 TUI 모드로 변경
  → src/cli.ts
- .cdd 설정 파일 타임스탬프 갱신
  → .cdd/config.json
- @clack/prompts, ora 패키지 추가
  → package-lock.json, package.json
- GitHub Actions 워크플로우 추가 (Node 18/20/22, build+test)
  → .github/workflows/ci.yml
- ESLint/npmignore/vitest 설정 추가
  → .npmignore, eslint.config.js, package-lock.json, package.json, vitest.config.ts
- vitest 테스트 스위트 추가
  → tests/analyzer.test.ts, tests/fixtures/sample-project/package.json, tests/fixtures/sample-project/src/index.ts, tests/fixtures/sample-project/src/utils.ts, tests/generator.test.ts
- analyzer AST 기반 전면 개편
  → src/core/analyzer.ts

### Docs

- cdd changelog 디자인 스펙 초안
  → docs/superpowers/specs/2026-06-13-cdd-changelog-design.md
- cdd context/uninstall 명령어 문서 및 설정 갱신
  → .cdd/config.json, ARCHITECTURE.md, CHANGELOG.md, docs/README.md, docs/api/src--commands--uninstall.md
- cdd docgen/spec 문서 갱신 (tui.ts 반영)
  → ARCHITECTURE.md, docs/README.md, docs/api/src--tui.md
- cdd docgen/spec 문서 갱신
  → ARCHITECTURE.md, docs/README.md, docs/api/src--cli.md, docs/api/src--commands--docgen.md, docs/api/src--commands--init.md, docs/api/src--commands--review.md, docs/api/src--commands--spec.md, docs/api/src--core--analyzer.md, docs/api/src--core--generator.md, docs/api/tests--fixtures--sample-project--src--index.md, docs/api/tests--fixtures--sample-project--src--utils.md
- 한국어 번역 및 언어 전환 버튼 추가
  → README.ko.md, README.md
- README 고도화 — Codex OSS 신청 대응 구조
  → README.md

### Other

- release: v0.2.0 — cdd design 명령어 추가
  → CHANGELOG.md, docs/changelog/2026-06-13_cdd-design-command.md, package.json

# Changelog

## [0.2.0] — 2026-06-13

### Added

- `cdd design` — 디자인 토큰 추출 (CSS 변수, TS 상수, Tailwind config → DESIGN.md)
  → [상세](docs/changelog/2026-06-13_cdd-design-command.md)

### Changed

- (no changes)

## [0.1.0] — 2026-06-13

### Added

- Initial release of code-drive CLI
- `cdd init` — Initialize CDD configuration in a project
- `cdd docgen` — Generate documentation from code annotations and structure
- `cdd spec` — Extract architecture specifications from code structure
- `cdd review` — Audit codebase against CDD principles (naming, docs, circular deps, module size)
- `cdd uninstall` — Remove all CDD artifacts (.cdd/, ARCHITECTURE.md, docs/)
- `cdd context` — Print project context (structure, functions, dependencies) for AI prompts
- `cdd --tui` — Interactive TUI menu for all commands
- Core analysis engine (TypeScript AST-based: functions, classes, interfaces, imports, annotations)
- Documentation generator (README + per-file API docs)
- Architecture spec generator with full dependency graph
- Watch mode (`cdd docgen -w`) for auto-regeneration on file changes
- GitHub Actions CI/CD (Node 18/20/22, build+test)
- ESLint + Prettier + Vitest (19 tests)
- 한국어 README (`README.ko.md`) with language toggle

### Changed

- `cdd` without arguments now launches TUI mode by default
- README structure enhanced for Codex OSS application
