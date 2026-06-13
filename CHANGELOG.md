# Changelog

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
