<p align="center">
  <a href="README.md"><img src="https://img.shields.io/badge/🇺🇸-English-blue?style=for-the-badge" alt="English"></a>
  <a href="README.ko.md"><img src="https://img.shields.io/badge/🇰🇷-한국어-blue?style=for-the-badge" alt="한국어"></a>
</p>

# Code-Driven Development (CDD)

> **Code is the single source of truth.** Specs, docs, and architecture are derived from code, not the other way around.

<p align="center">
  <a href="LICENSE"><img src="https://img.shields.io/badge/License-MIT-yellow.svg" alt="License: MIT"></a>
  <a href="https://www.npmjs.com/package/@eastjin616/code-drive"><img src="https://img.shields.io/npm/v/@eastjin616/code-drive" alt="npm version"></a>
  <a href="https://github.com/eastjin616/code-drive/actions"><img src="https://img.shields.io/github/actions/workflow/status/eastjin616/code-drive/ci.yml?branch=main" alt="CI"></a>
  <a href="https://nodejs.org"><img src="https://img.shields.io/node/v/code-drive" alt="Node version"></a>
  <a href="CONTRIBUTING.md"><img src="https://img.shields.io/badge/PRs-welcome-brightgreen.svg" alt="PRs Welcome"></a>
</p>

---

## Why This Project Matters

In the age of AI-assisted software development, code is being generated faster than ever. Yet most existing methodologies still treat code as a *byproduct* — generated from specs, documents, or configuration files. This creates a fundamental problem: **specs drift from implementation.**

**Code-Driven Development (CDD)** solves this by inverting the relationship:

| Traditional (Spec-Driven) | Code-Driven (CDD) |
|--------------------------|-------------------|
| Specs → Code | **Code → Specs** |
| Documentation is written separately, then rots | Documentation is *extracted* from code |
| Architecture lives in ADRs | Architecture is encoded in code structure |
| Multiple sources of truth | **Single source of truth: code** |

CDD is a **developer tool** and **methodology** that:
1. **Eliminates documentation drift** — Docs are generated from AST analysis of actual source code
2. **Enables AI-native workflows** — Clean code structure is the interface for AI agents (Codex, Claude Code, Copilot)
3. **Reduces maintenance burden** — One change in code = docs and specs update automatically
4. **Catches issues early** — Built-in `cdd review` audits naming, documentation coverage, circular dependencies, and module size

### Who It Serves

- **Individual developers** maintaining personal projects who want automated docs
- **Small OSS teams** who need architecture documentation without overhead
- **AI-assisted development teams** where code quality directly impacts AI agent effectiveness

---

## Features

| Feature | Command | What It Does |
|---------|---------|-------------|
| ⚡ **Init** | `cdd init` | Initialize CDD configuration in any project |
| 📖 **Doc Gen** | `cdd docgen` | Extract API docs, READMEs, and annotations from code via TypeScript AST |
| 🏗️ **Arch Spec** | `cdd spec` | Generate architecture spec with full dependency graph |
| 🔍 **Review** | `cdd review` | Audit codebase against CDD principles |
| 🩺 **Doctor** | `cdd doctor` | Diagnose Node, Git, CDD config, source analysis, and generated artifacts |
| ✅ **Verify** | `cdd verify` | Check release readiness: config, docs freshness, AI routing, and review errors |
| 📋 **Context** | `cdd context` | Print project structure, functions, and dependencies for AI prompts |
| 🤖 **AI Routing** | `cdd ai install` | Install CDD doc-routing rules into AI instruction files |
| 🎨 **Design** | `cdd design` | Extract design tokens — colors, typography, spacing — from CSS/TS/Tailwind |
| 📝 **Changelog** | `cdd changelog` | Auto-generate CHANGELOG.md from git history + code analysis |
| 👁️ **Watch** | `cdd docgen --watch` | Auto-regenerate docs on file changes |
| 📦 **Sync** | `cdd sync` | Run all generators at once: docgen + spec + design + changelog |
| 🗑️ **Uninstall** | `cdd uninstall` | Remove all CDD-generated artifacts from project |

---

## TUI — Interactive Mode (Default)

Running `cdd` without any subcommand launches an interactive TUI with a two-step menu:

```
$ cdd

    ██████╗██████╗ ██████╗ 
   ██╔════╝██╔══██╗██╔══██╗
   ██║     ██║  ██║██║  ██║
   ██║     ██║  ██║██║  ██║
   ╚██████╗██████╔╝██████╔╝
    ╚═════╝╚═════╝ ╚═════╝ 
   Code-Driven Development

? 실행할 명령어를 선택하세요 (Use arrow keys)
❯ 추천 워크플로 시작   — doctor로 상태 진단 후 다음 액션 확인
  릴리즈 준비 확인     — config, generated docs, AI routing, review errors
  명령어 직접 실행      — 생성/분석 명령어를 선택합니다
  init                 — CDD 설정 초기화
  update               — cdd 자체 업데이트
  uninstall            — CDD 아티팩트 제거
```

**Step 1** — `명령어 직접 실행`을 선택하면 그룹별 다중 선택 메뉴로 이동합니다:

```
? 실행할 명령어를 선택하세요 (Space로 선택, Enter로 실행)
  ⚡ 모두 선택
 │ 🩺 진단
  ├ ▪ doctor     — 프로젝트 상태와 다음 액션
  └ ▪ verify     — 릴리즈 준비 상태
 │ 📄 생성
  ├ ▪ docgen     — 코드 → 문서
  ├ ▪ spec       — 아키텍처 스펙
  ├ ▪ design     — 디자인 토큰 추출
  └ ▪ changelog  — CHANGELOG 자동 생성
 │ 🔍 분석
  ├ ▪ review     — CDD 감사
  └ ▪ context    — AI 컨텍스트 출력
```

- **그룹 헤더**(🩺 진단 / 📄 생성 / 🔍 분석)는 선택 불가 — 순수 시각적 구분
- **⚡ 모두 선택** — 체크하면 권장 흐름(doctor + 생성 + review + verify + context)을 한 번에 실행
- 다중 선택 후 Enter → 선택된 명령어를 순차 실행
- 생성 명령어(docgen/spec/design/changelog) 완료 후 파일 열기 확인 (`open`/`xdg-open`)

**doctor / verify / init / update / uninstall**은 첫 화면에서 바로 실행할 수 있습니다.

Pass `--cli` to skip the TUI and use traditional command-line mode directly. Use `--help` or `-h` for CLI help.

---

## Installation

```bash
# Install globally (recommended)
npm install -g @eastjin616/code-drive

# Or run directly without installation
npx @eastjin616/code-drive <command>
```

**Requirements:** Node.js 18+

---

## Quick Start

```bash
# Just run `cdd` — the TUI menu guides you through all commands
cdd

# Or use CLI mode for scripting/automation:
# Step 1: Initialize CDD in your project
cdd init

# Step 2: Generate all documentation, specs, design, and changelog in one go
cdd sync

# Step 3: Audit your codebase against CDD principles
cdd review

# Step 4: Check release readiness before handing the project to humans or AI agents
cdd verify
```

`cdd init` also installs a small CDD context-routing block into existing AI instruction files such as `AGENTS.md`, `CLAUDE.md`, `CODEX.md`, or `OPENCODE.md`. If none exist, it creates `AGENTS.md`. This lets Codex, Claude Code, OpenCode, and similar tools discover when to read `DESIGN.md`, `ARCHITECTURE.md`, `CHANGELOG.md`, and `docs/README.md` without users having to remember those files manually.

### Example Output

```bash
# Running `cdd docgen` on this project:
$ cdd docgen

Scanning codebase...
  13 source files, 28 functions, 1 classes, 11 interfaces
✓ 10 documentation files generated
  Output: /Users/you/project/docs/
```

Generated files:
```
docs/
├── README.md              # Project overview with API table
└── api/
    ├── src--cli.md         # API reference per source file
    ├── src--commands--docgen.md
    ├── src--core--analyzer.md
    ├── src--core--generator.md
    └── ...
```

```bash
# Running `cdd spec`:
$ cdd spec
Analyzing code architecture...
  28 functions, 1 classes, 11 interfaces
  41 import relationships
✓ Architecture spec generated
  Output: ARCHITECTURE.md
```

```bash
# Running `cdd review`:
$ cdd review
Running CDD review...

CDD Review — my-project v1.0.0
  28 functions, 1 classes, 11 interfaces

Warnings (3):
  ⚠ TODO: add multiplication function [src/index.ts:15]
  ⚠ HACK: fetchData uses mock endpoint [src/utils.ts:23]

Info (17):
  ℹ Exported function "fetchData" has no JSDoc/TSDoc comment. [src/utils.ts:24]
  ...
```

---

## The CDD Methodology

### Core Principles

1. **Code as Source of Truth** — The codebase is the canonical representation. Everything else is a derived view.
2. **Derived Artifacts** — Docs, specs, and architecture are generated from code, never written independently.
3. **Self-Documenting by Default** — Type signatures, JSDoc/TSDoc, and inline annotations are the primary documentation medium.
4. **Minimal Configuration** — If it can be expressed in code, it should be. Config exists only at system boundaries.
5. **AI-Native** — Clean code structure is the interface for AI agents. CDD is designed for workflows where AI reads, writes, and reviews code.

### For AI-Assisted Development

CDD is optimized for workflows where AI agents are first-class participants:

- **AI reads code** → Clean structure with type signatures is the best prompt context for Codex.
- **AI writes code** → Generated code self-documents when CDD conventions are followed.
- **No spec drift** → Since code IS the spec, there's nothing to become outdated.
- **AI discovers generated context** → `cdd init` and `cdd sync` keep AI instruction files wired to task-specific generated docs.

### AI Context Routing

Most AI coding tools read a project instruction file when they start, but humans do not always know to point them at CDD-generated docs. CDD handles that bridge automatically.

On `cdd init`, CDD looks for root-level AI instruction files:

- `AGENTS.md`
- `CLAUDE.md`
- `CODEX.md`
- `OPENCODE.md`

If one or more exist, CDD inserts or refreshes a managed block in each file. If none exist, CDD creates `AGENTS.md`. `cdd sync` refreshes the same block after regenerating docs, and `cdd ai install` can be used to reinstall it manually.

The managed block tells AI tools when to read each generated artifact:

- Use `docs/README.md` for project/API overview.
- Use `ARCHITECTURE.md` before module, entry point, import, or dependency changes.
- Use `DESIGN.md` before UI, UX, styling, layout, color, spacing, typography, or token changes.
- Use `CHANGELOG.md` before release notes, versioning, migrations, or history-sensitive work.
- Treat source code as final authority; if generated docs conflict with code, run `cdd sync`.

CDD only manages the block between `<!-- cdd:ai-context:start -->` and `<!-- cdd:ai-context:end -->`; existing instructions stay intact.

### Comparison to Other Methodologies

| Methodology | Source of Truth | Primary Audience |
|-------------|----------------|-----------------|
| **TDD** | Tests | Correctness verification |
| **BDD** | Behavior specs | Stakeholder communication |
| **Spec-Driven** | Written documents | AI prompt engineering |
| **CDD (this)** | **Code itself** | **Long-term maintainability** |

---

## Commands Reference

### `cdd init [directory]`

Initializes CDD configuration in your project. Creates a `.cdd/config.json` file and installs CDD context routing into existing AI instruction files (`AGENTS.md`, `CLAUDE.md`, `CODEX.md`, `OPENCODE.md`) or creates `AGENTS.md` when none exist.

| Option | Description |
|--------|-------------|
| `-f, --force` | Overwrite existing configuration |

### `cdd docgen [directory]`

Scans source files using the TypeScript compiler API and generates:
- **README.md** — Project overview with public API tables (functions, classes, interfaces)
- **api/*.md** — Per-file API reference docs with signatures and JSDoc
- **Code annotation index** — All TODO, FIXME, HACK, NOTE markers in a table

| Option | Description |
|--------|-------------|
| `-o, --output <path>` | Output directory (default: `./docs`) |
| `-w, --watch` | Watch source files and auto-regenerate on change |
| `--include-tests` | Include test and fixture files in generated docs |

### `cdd spec [directory]`

Analyzes code structure and generates an architecture specification with:
- Project overview and module map
- Full import dependency graph across all source files
- API surface metrics (exported functions, classes, interfaces)

| Option | Description |
|--------|-------------|
| `-o, --output <path>` | Output file (default: `./ARCHITECTURE.md`) |
| `--include-tests` | Include test and fixture files in architecture analysis |

### `cdd review [directory]`

Audits a codebase against CDD principles. Checks:

| Rule | Severity | What It Detects |
|------|----------|----------------|
| **naming** | Warn | Exported symbols with `_` prefix (leaked internals) |
| **documentation** | Info | Exported symbols missing JSDoc/TSDoc |
| **code-health** | Warn | TODO, FIXME, HACK annotations |
| **dependency** | Error | Circular dependencies between files |
| **module-size** | Warn | Files over 500 lines (split recommended) |

| Option | Description |
|--------|-------------|
| `-o, --output <path>` | Save report to file |
| `--include-tests` | Include test and fixture files in review |
| `--max-findings <count>` | Maximum findings shown per severity group |

### `cdd context [directory]`

Prints project context optimized for AI prompts — module structure, exported symbols, import relationships, and dependency graph. Useful for feeding into AI coding assistants (Claude Code, Codex, Copilot).

| Option | Description |
|--------|-------------|
| `-f, --file <path>` | Show context for a specific file only |
| `--include-tests` | Include test and fixture files in project context |

### `cdd ai install [directory]`

Installs or refreshes the CDD managed context-routing block in AI instruction files. This is useful when AI instruction files were added after `cdd init`, or when you want to repair the managed block without reinitializing CDD.

The command updates existing `AGENTS.md`, `CLAUDE.md`, `CODEX.md`, and `OPENCODE.md` files. If none exist, it creates `AGENTS.md`.

### `cdd doctor [directory]`

Runs a fast health check for local prerequisites and CDD setup:

- Node.js version
- Git availability and repository status
- `.cdd/config.json`
- Source analysis scope
- Generated artifact freshness

| Option | Description |
|--------|-------------|
| `--include-tests` | Include test and fixture files in project analysis |

### `cdd verify [directory]`

Checks whether a project is ready to hand off, release, or continue with an AI assistant. It combines environment, CDD setup, generated artifact freshness, AI context routing, and review-error checks into one status:

- `ready` — config, docs, AI routing, and review errors are clear
- `needs-sync` — generated docs are missing or older than source files
- `needs-attention` — setup, AI routing, source analysis, or review errors need action

| Option | Description |
|--------|-------------|
| `--include-tests` | Include test and fixture files in project analysis |
| `--json` | Print machine-readable JSON |

### `cdd design [directory]`

Scans source code for design tokens across multiple sources and generates a consolidated `DESIGN.md`:

- **CSS**: `--color-*`, `--font-*`, `--space-*`, `--radius-*`, `--shadow-*` custom properties
- **TypeScript**: Named `const` color/spacing objects (e.g. `const colors = {}`)
- **Tailwind**: `tailwind.config.*` theme extensions

Output includes color swatches (rendered as ASCII blocks), token categories, and source file references.

| Option | Description |
|--------|-------------|
| `-o, --output <path>` | Output file for design spec (default: `./DESIGN.md`) |

### `cdd uninstall [directory]`

Removes CDD-generated artifacts from the project — `.cdd/`, `docs/`, `ARCHITECTURE.md`, and related output files. If AI instruction files contain a CDD managed block, `cdd uninstall` asks whether to remove that block too while preserving the rest of each instruction file.

| Option | Description |
|--------|-------------|
| `--remove-ai-context` | Remove CDD managed blocks from AI instruction files without prompting |
| `--keep-ai-context` | Keep CDD managed blocks in AI instruction files without prompting |

### `cdd sync [directory]`

Runs all generators in sequence: `docgen` → `spec` → `design` → `changelog`. Each step runs with default options. Useful for quickly regenerating all project artifacts after code changes. Also refreshes the CDD context-routing block in AI instruction files so assistants continue to know when generated docs should be consulted.

| Option | Description |
|--------|-------------|
| `-o, --output <path>` | Output directory for generated artifacts (applied to all steps) |
| `--include-tests` | Include test and fixture files in generated analysis artifacts |

### `cdd changelog [directory]`

Parses git history using conventional commits and generates/updates CHANGELOG.md. Groups changes by type (Added, Fixed, Changed, Docs, etc.) and includes changed file paths. Uses existing tags to determine version ranges automatically.

| Option | Description |
|--------|-------------|
| `-f, --from <ref>` | Starting commit ref (default: last tag or first commit) |
| `-t, --to <ref>` | Ending commit ref (default: HEAD) |
| `-o, --output <path>` | Output file (default: `./CHANGELOG.md`) |
| `--dry-run` | Preview changelog without writing to file |
| `--dry-run` | Preview without writing to file |

---

## Project Structure

A CDD-guided project follows a convention-over-configuration layout:

```
my-project/
├── src/                    # Source code — the single source of truth
│   ├── index.ts
│   └── modules/
├── docs/                   # Generated documentation (cdd docgen)
├── .cdd/                   # CDD configuration
│   └── config.json
├── AGENTS.md               # AI instruction file with CDD context routing
├── ARCHITECTURE.md         # Generated architecture spec (cdd spec)
├── DESIGN.md               # Generated design token guide (cdd design)
├── CHANGELOG.md            # Generated changelog (cdd changelog)
└── README.md               # Enhanced by cdd docgen
```

---

## Development

```bash
git clone https://github.com/eastjin616/code-drive.git
cd code-drive
npm install
npm run build     # Compile TypeScript
npm test          # Run test suite
npm run lint      # ESLint
npm run format    # Prettier
```

### Scripts

| Script | Description |
|--------|-------------|
| `npm run build` | Compile TypeScript → `dist/` |
| `npm test` | Run vitest test suite (62 tests) |
| `npm run dev` | Run directly with tsx |
| `npm run lint` | ESLint check |
| `npm run format` | Prettier auto-format |

---

## Contributing

We welcome contributions! See [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

## License

MIT — see [LICENSE](LICENSE) for details.
