## [HEAD] — 2026-06-20

### Added

- make CDD projects self-verifiable for AI handoff
  → .gitignore, AGENTS.md, ARCHITECTURE.md, CHANGELOG.md, DESIGN.md, README.ko.md, README.md, docs/README.md, docs/api/src--cli.md, docs/api/src--commands--ai.md, docs/api/src--commands--changelog.md, docs/api/src--commands--context.md, docs/api/src--commands--design.md, docs/api/src--commands--docgen.md, docs/api/src--commands--doctor.md, docs/api/src--commands--review.md, docs/api/src--commands--spec.md, docs/api/src--commands--sync.md, docs/api/src--commands--uninstall.md, docs/api/src--commands--update.md, docs/api/src--commands--verify.md, docs/api/src--core--ai-context.md, docs/api/src--core--analysis-scope.md, docs/api/src--core--analyzer-types.md, docs/api/src--core--analyzer.md, docs/api/src--core--artifact-freshness.md, docs/api/src--core--cdd-config-generator.md, docs/api/src--core--changelog-generator.md, docs/api/src--core--changelog-parser.md, docs/api/src--core--design-css-extractor.md, docs/api/src--core--design-extractor.md, docs/api/src--core--design-generator.md, docs/api/src--core--design-token-utils.md, docs/api/src--core--design-types.md, docs/api/src--core--generator.md, docs/api/src--core--module-map.md, docs/api/src--core--review-rules.md, docs/api/src--core--verify.md, docs/api/src--tui.md, docs/superpowers/plans/2026-06-14-cdd-verify.md, docs/superpowers/specs/2026-06-14-cdd-verify-design.md, src/cli.ts, src/commands/ai.ts, src/commands/changelog.ts, src/commands/context.ts, src/commands/docgen.ts, src/commands/doctor.ts, src/commands/init.ts, src/commands/review.ts, src/commands/spec.ts, src/commands/sync.ts, src/commands/uninstall.ts, src/commands/verify.ts, src/core/ai-context.ts, src/core/analysis-scope.ts, src/core/analyzer-types.ts, src/core/analyzer.ts, src/core/artifact-freshness.ts, src/core/cdd-config-generator.ts, src/core/changelog-generator.ts, src/core/changelog-parser.ts, src/core/design-css-extractor.ts, src/core/design-extractor.ts, src/core/design-generator.ts, src/core/design-token-utils.ts, src/core/design-types.ts, src/core/generator.ts, src/core/module-map.ts, src/core/review-rules.ts, src/core/verify.ts, src/index.ts, src/tui.ts, tests/ai-context.test.ts, tests/analyzer.test.ts, tests/artifact-freshness.test.ts, tests/changelog.test.ts, tests/design-extractor.test.ts, tests/design-generator.test.ts, tests/generator.test.ts, tests/verify.test.ts
- add cdd update command + reorder TUI menu
  → src/cli.ts, src/commands/update.ts, src/tui.ts
- cdd sync 명령어 + CLI 등록 + design merge 호출
  → src/cli.ts, src/commands/design.ts, src/commands/sync.ts
- cdd changelog 명령어 추가
  → src/commands/changelog.ts, tests/changelog.test.ts
- changelog 파서 및 생성기 + design mergeWithExisting
  → src/core/changelog-generator.ts, src/core/changelog-parser.ts, src/core/design-generator.ts
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

- cli.ts 버전 0.1.0 → 0.2.0 동기화
  → src/cli.ts
- scoped package(@eastjin616)로 전환
  → package.json
- groupMultiselect + init/uninstall 분리 + 파일 열기
  → src/tui.ts
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

### Fixed

- sync --output flag now forwarded to subcommands
  → src/commands/sync.ts
- replace placehold.co color swatches with inline HTML spans
  → src/core/design-generator.ts
- design-extractor false positive + commands throw instead of process.exit
  → src/cli.ts, src/commands/changelog.ts, src/commands/context.ts, src/commands/design.ts, src/commands/docgen.ts, src/commands/init.ts, src/commands/review.ts, src/commands/spec.ts, src/commands/sync.ts, src/commands/uninstall.ts, src/commands/update.ts, src/core/design-extractor.ts
- remove directory prompt from multiselect flow too
  → src/tui.ts
- prevent exit on empty multiselect — make required: true
  → src/tui.ts
- remove redundant directory prompt for init/uninstall/update
  → src/tui.ts

### Docs

- changelog 업데이트 — cdd sync, changelog, TUI 개편, npm publish
  → CHANGELOG.md
- README 한국어판 업데이트 — TUI 구조, sync/changelog/context/design 명령어 추가, scoped package 반영
  → README.ko.md
- README + CHANGELOG + spec 문서 업데이트
  → CHANGELOG.md, README.md, docs/superpowers/specs/2026-06-13-cdd-changelog-design.md
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

- Keep local agent runtime state out of git
  → .gitignore
- Document the visible agent harness workflow
  → docs/agent-harness.md
- Expose stale cdd shell aliases during diagnosis
  → .cdd/config.json, src/commands/doctor.ts, src/core/shell-alias.ts, tests/doctor.test.ts, tests/shell-alias.test.ts
- Make CDD usable from prompt-only AI workflows
  → README.ko.md, README.md, docs/api/src--tui-labels.md, docs/api/src--tui-runner.md, docs/api/src--tui-status.md, docs/api/src--tui-view.md, docs/superpowers/plans/2026-06-20-prompt-pack.md, docs/superpowers/specs/2026-06-20-prompt-pack-design.md, src/cli.ts, src/commands/prompt.ts, src/core/analyzer.ts, src/core/prompt-pack.ts, src/tui-labels.ts, src/tui-messages.ts, src/tui-runner.ts, src/tui-status.ts, src/tui-view.ts, src/tui.ts, tests/cli-prompt.test.ts, tests/prompt-command.test.ts, tests/prompt-pack.test.ts, tests/tui-labels.test.ts, tests/tui-status.test.ts
- Keep generated design docs useful for sparse projects
  → ARCHITECTURE.md, CHANGELOG.md, DESIGN.md, docs/README.md, docs/api/src--core--design-extractor.md, docs/api/src--core--design-generator.md, docs/api/src--core--design-style-usage.md, docs/api/src--core--design-types.md, docs/api/src--core--project-detector.md, src/cli.ts, src/commands/changelog.ts, src/commands/design.ts, src/core/design-css-extractor.ts, src/core/design-extractor.ts, src/core/design-generator.ts, src/core/design-style-usage.ts, src/core/design-types.ts, src/core/project-detector.ts, tests/changelog.test.ts, tests/design-command.test.ts, tests/design-extractor.test.ts, tests/design-generator.test.ts
- release: v0.2.0 — cdd design 명령어 추가
  → CHANGELOG.md, docs/changelog/2026-06-13_cdd-design-command.md, package.json
- Initial release: code-drive v0.1.0
  → .cdd/config.json, .gitignore, .prettierrc, ARCHITECTURE.md, CHANGELOG.md, CODE_OF_CONDUCT.md, CONTRIBUTING.md, LICENSE, README.md, SECURITY.md, docs/README.md, package-lock.json, package.json, src/cli.ts, src/commands/docgen.ts, src/commands/init.ts, src/commands/spec.ts, src/core/analyzer.ts, src/core/generator.ts, src/index.ts, tsconfig.json

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