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
