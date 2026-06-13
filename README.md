# Code-Driven Development (CDD)

> **Code is the single source of truth. Specs, docs, and architecture are derived from code, not the other way around.**

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![npm version](https://img.shields.io/npm/v/code-drive.svg)](https://www.npmjs.com/package/code-drive)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](CONTRIBUTING.md)

---

## Philosophy

In the age of AI-assisted software development, code is being generated faster than ever. Yet most methodologies still treat code as a *byproduct* — something to be generated from specs, documents, or configuration files.

**Code-Driven Development (CDD)** inverts this:

| Traditional (Spec-Driven) | Code-Driven (This) |
|--------------------------|-------------------|
| Spec → Code | Code → Spec |
| Documentation is written, then rots | Documentation is *extracted* from code |
| Architecture decisions live in ADRs | Architecture is encoded in code structure |
| Config files define behavior | Code defines behavior, config is minimal |

### Core Principles

1. **Code as Source of Truth** — The codebase is the canonical representation of system behavior. Everything else is a view.
2. **Derived Artifacts** — Documentation, architecture diagrams, and specifications are generated from code, never written independently.
3. **Self-Documenting by Default** — Code structure, type signatures, and inline annotations are the primary documentation medium.
4. **Minimal Configuration** — If it can be expressed in code, it should be. Configuration files exist only at system boundaries.
5. **AI-Native** — Designed for workflows where AI agents read, write, and review code. Clean code structure is the interface.

---

## Installation

```bash
# Install globally
npm install -g code-drive

# Or run directly
npx code-drive <command>
```

## Quick Start

```bash
# Initialize CDD in your project
cdd init

# Generate documentation from your codebase
cdd docgen

# Extract architecture spec from code structure
cdd spec

# Review a pull request against code-driven principles
cdd review ./path/to/changes
```

## Commands

| Command | Description |
|---------|-------------|
| `cdd init` | Initialize CDD configuration in a project |
| `cdd docgen` | Generate documentation from code annotations and structure |
| `cdd spec` | Extract and verify architecture specifications from code |
| `cdd review` | Analyze code changes against CDD principles |
| `cdd status` | Check CDD compliance of your project |

---

## The CDD Methodology

### Workflow

```
                    ┌─────────────────┐
                    │   Write Code     │
                    │  (Source of Truth)│
                    └────────┬────────┘
                             │
                             ▼
              ┌──────────────────────────────┐
              │       cdd docgen             │
              │  Extract docs from code       │
              └────────┬─────────┬───────────┘
                       │         │
                       ▼         ▼
              ┌────────────┐ ┌──────────────┐
              │  README.md  │ │ Architecture  │
              │  API Docs   │ │    Spec       │
              └────────────┘ └──────────────┘
```

### For AI-Assisted Development

CDD is particularly powerful when working with AI coding agents (Claude Code, Codex, Copilot, etc.):

- **AI agents read code** — Clean, well-structured code is the best prompt context
- **AI agents write code** — Generated code should be self-documenting by design
- **Code review with AI** — AI reviews check code against your project's structural patterns
- **No spec drift** — Since code IS the spec, there's nothing to drift

### Comparison to Other Methodologies

| Methodology | Source of Truth | Best For |
|-------------|----------------|----------|
| **TDD** | Tests | Ensuring correctness |
| **BDD** | Behavior specs | Stakeholder communication |
| **SDD** | Written specs | AI prompt engineering |
| **CDD (this)** | Code itself | Maintainability, long-term projects |

---

## Project Structure

A CDD-guided project follows a convention-over-configuration layout:

```
my-project/
├── src/                    # Source code — the source of truth
│   ├── index.ts
│   └── modules/
├── docs/                   # Generated documentation
├── .cdd/                   # CDD configuration and cache
│   └── config.json
└── README.md               # Generated/updated by cdd docgen
```

---

## Contributing

We welcome contributions! See [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

## License

MIT — see [LICENSE](LICENSE) for details.
