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
| 📋 **Context** | `cdd context` | Print project structure, functions, and dependencies for AI prompts |
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
❯ 명령어 실행  — 생성/분석 명령어를 선택합니다
  init         — CDD 설정 초기화
  uninstall    — CDD 아티팩트 제거
```

**Step 1** — `명령어 실행`을 선택하면 그룹별 다중 선택 메뉴로 이동합니다:

```
? 실행할 명령어를 선택하세요 (Space로 선택, Enter로 실행)
  ⚡ 모두 선택
 │ 📄 생성
  ├ ▪ docgen     — 코드 → 문서
  ├ ▪ design     — 디자인 토큰 추출
  └ ▪ changelog  — CHANGELOG 자동 생성
 │ 🔍 분석
  ├ ▪ spec       — 아키텍처 스펙
  ├ ▪ review     — CDD 감사
  └ ▪ context    — AI 컨텍스트 출력
```

- **그룹 헤더**(📄 생성 / 🔍 분석)는 선택 불가 — 순수 시각적 구분
- **⚡ 모두 선택** — 체크하면 6개 모든 명령어를 한 번에 실행
- 다중 선택 후 Enter → 선택된 명령어를 순차 실행
- 생성 명령어(docgen/spec/design/changelog) 완료 후 파일 열기 확인 (`open`/`xdg-open`)

**init / uninstall**은 바로 실행 단계로 넘어갑니다 (디렉토리 입력 → 실행).

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

# Step 2: Generate all documentation, specs, and design in one go
cdd sync

# Step 3: Audit your codebase against CDD principles
cdd review

# Step 4: Generate CHANGELOG from git history
cdd changelog
```

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

Initializes CDD configuration in your project. Creates a `.cdd/config.json` file.

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

### `cdd spec [directory]`

Analyzes code structure and generates an architecture specification with:
- Project overview and module map
- Full import dependency graph across all source files
- API surface metrics (exported functions, classes, interfaces)

| Option | Description |
|--------|-------------|
| `-o, --output <path>` | Output file (default: `./ARCHITECTURE.md`) |

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

### `cdd context [directory]`

Prints project context optimized for AI prompts — module structure, exported symbols, import relationships, and dependency graph. Useful for feeding into AI coding assistants (Claude Code, Codex, Copilot).

| Option | Description |
|--------|-------------|
| `-f, --file <path>` | Show context for a specific file only |

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

Removes all CDD-generated artifacts from the project — `.cdd/`, `docs/`, `ARCHITECTURE.md`, and related output files.

### `cdd sync [directory]`

Runs all generators in sequence: `docgen` → `spec` → `design` → `changelog`. Each step runs with default options. Useful for quickly regenerating all project artifacts after code changes.

| Option | Description |
|--------|-------------|
| `-o, --output <path>` | Output directory for generated artifacts (applied to all steps) |

### `cdd changelog [directory]`

Parses git history using conventional commits and generates/updates CHANGELOG.md. Groups changes by type (Added, Fixed, Changed, Docs, etc.) and includes changed file paths. Uses existing tags to determine version ranges automatically.

| Option | Description |
|--------|-------------|
| `-f, --from <ref>` | Starting commit ref (default: last tag or first commit) |
| `-t, --to <ref>` | Ending commit ref (default: HEAD) |
| `-o, --output <path>` | Output file (default: `./CHANGELOG.md`) |
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
├── ARCHITECTURE.md         # Generated architecture spec (cdd spec)
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
| `npm test` | Run vitest test suite (36 tests) |
| `npm run dev` | Run directly with tsx |
| `npm run lint` | ESLint check |
| `npm run format` | Prettier auto-format |

---

## Contributing

We welcome contributions! See [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

## License

MIT — see [LICENSE](LICENSE) for details.
