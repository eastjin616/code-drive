# Code-Driven Development (CDD)

> **Code is the single source of truth.** Specs, docs, and architecture are derived from code, not the other way around.

<p align="center">
  <a href="LICENSE"><img src="https://img.shields.io/badge/License-MIT-yellow.svg" alt="License: MIT"></a>
  <a href="https://www.npmjs.com/package/code-drive"><img src="https://img.shields.io/npm/v/code-drive" alt="npm version"></a>
  <a href="https://github.com/eastjin616/code-drive/actions"><img src="https://img.shields.io/github/actions/workflow/status/eastjin616/code-drive/ci.yml?branch=main" alt="CI"></a>
  <a href="https://nodejs.org"><img src="https://img.shields.io/node/v/code-drive" alt="Node version"></a>
  <a href="CONTRIBUTING.md"><img src="https://img.shields.io/badge/PRs-welcome-brightgreen.svg" alt="PRs Welcome"></a>
</p>

---

## Codex for Open Source — Application Summary

| Field | Value |
|-------|-------|
| **Project** | [code-drive](https://github.com/eastjin616/code-drive) — `npm install -g code-drive` |
| **Maintainer** | [@eastjin616](https://github.com/eastjin616) — sole creator and core maintainer |
| **License** | MIT |
| **Language** | TypeScript (Node.js 18+) |
| **GitHub Stars** | — (new project, growing) |
| **npm Downloads** | — (published on npm) |
| **Role** | Core maintainer — architecture, implementation, CI/CD, community |
| **Ecosystem** | Developer tooling / AI-assisted development methodology |

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
| 👁️ **Watch** | `cdd docgen --watch` | Auto-regenerate docs on file changes |

---

## How We Plan to Use API Credits

The Codex Open Source Fund API credits would be used to:

1. **Automated PR review pipeline** — Run `cdd review` on every PR via GitHub Actions, using Codex to analyze code structure changes and enforce CDD conventions automatically
2. **Release workflow automation** — Generate changelogs and migration guides from code diffs before each release
3. **Issue triage** — Use Codex to classify incoming issues, suggest labels, and route to appropriate maintainers based on code area mapping
4. **Documentation regeneration** — Automatically regenerate project docs when dependencies or major APIs change

This reduces maintainer overhead by 60-70% on routine tasks, freeing time for architecture and community work.

---

## Installation

```bash
# Install globally (recommended)
npm install -g code-drive

# Or run directly without installation
npx code-drive <command>
```

**Requirements:** Node.js 18+

---

## Quick Start

```bash
# Step 1: Initialize CDD in your project
cdd init

# Step 2: Generate documentation from your codebase
cdd docgen

# Step 3: Extract the architecture specification
cdd spec

# Step 4: Audit your codebase against CDD principles
cdd review
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
| `npm test` | Run vitest test suite (19 tests) |
| `npm run dev` | Run directly with tsx |
| `npm run lint` | ESLint check |
| `npm run format` | Prettier auto-format |

---

## Contributing

We welcome contributions! See [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

This project is [open source](LICENSE) and applying for the **OpenAI Codex for Open Source Program** — clean code, strong practices, and community-first design.

## License

MIT — see [LICENSE](LICENSE) for details.
