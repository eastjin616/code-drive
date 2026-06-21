# Code Drive Stability Contract

Code Drive `1.x` is the stability line for the public CLI. The project may keep improving implementation quality, generated prose, and diagnostics, but the contracts below define what users can depend on without expecting a breaking change during the `1.x` series.

## Runtime Support

Code Drive `1.x` supports Node.js 20.19+.

The CI support matrix is Node.js 20.19, 22, and 24. Node.js 18 is not supported because current runtime dependencies require Node.js 20+.

## Stable Commands

The following commands are stable in `1.x`:

| Command | Stable contract |
| --- | --- |
| `cdd` | Opens the interactive dashboard when no subcommand is provided. |
| `cdd init [directory]` | Creates `.cdd/config.json` and installs AI context routing when needed. |
| `cdd sync [directory]` | Runs docgen, spec, design, changelog, and AI context routing refresh in order. |
| `cdd prompt [directory]` | Prints a copy-paste AI prompt pack; `--file` focuses the pack on one source file. |
| `cdd verify [directory]` | Checks setup, generated artifact freshness, AI routing, and review errors. |
| `cdd doctor [directory]` | Reports local environment and project setup diagnostics. |
| `cdd ai install [directory]` | Installs or refreshes CDD context routing in AI instruction files. |
| `cdd uninstall [directory]` | Removes generated CDD artifacts and optionally removes managed AI context routing. |

Adding new commands, options, checks, or generated sections is allowed in `1.x` when existing behavior remains compatible. Removing commands, renaming options, changing default target directories, or changing the meaning of an existing status is a breaking change.

## Generated Artifact Contract

These generated artifact paths are stable in `1.x`:

- `.cdd/config.json`
- `docs/README.md`
- `docs/api/*.md`
- `ARCHITECTURE.md`
- `DESIGN.md`
- `CHANGELOG.md`
- CDD managed blocks inside `AGENTS.md`, `CLAUDE.md`, `CODEX.md`, or `OPENCODE.md`

The managed block markers are stable:

```html
<!-- cdd:ai-context:start -->
<!-- cdd:ai-context:end -->
```

Stable generated artifact guarantees:

- Code Drive only owns generated files and CDD managed blocks.
- Existing human-written text outside managed blocks is preserved.
- `.cdd/config.json` remains JSON.
- Generated markdown top-level artifact paths remain stable.

Non-contract details:

- Exact generated markdown prose may improve over time.
- API table ordering and summary wording may change.
- Additional generated sections may be added.

In short, generated markdown paths and ownership boundaries are stable; generated markdown sentence-level wording is not a strict compatibility contract.

## Exit Code Contract

`cdd verify` has a stable exit code contract:

| Verify status | Exit code | Meaning |
| --- | ---: | --- |
| `ready` | `0` | The project is ready for handoff or release. |
| `needs-sync` | `1` | Generated artifacts are missing or stale. |
| `needs-attention` | `1` | Setup, AI routing, source analysis, git, or review checks failed. |

When `--json` is used, the same exit code contract applies and the JSON `status` field is stable.

## Upgrade Guide

To upgrade from an older Code Drive release:

```bash
npm install -g @eastjin616/code-drive@latest
cdd doctor .
cdd sync .
cdd verify .
```

If `cdd verify .` reports `needs-sync`, run `cdd sync .` and verify again. If it reports `needs-attention`, follow the printed next actions before relying on generated artifacts.

## Breaking Change Policy

During the `1.x` series, these changes require a new major version:

- Removing or renaming a stable command.
- Removing a stable option or changing its meaning.
- Changing default generated artifact paths.
- Changing managed block marker strings.
- Deleting or renaming existing `.cdd/config.json` fields without compatibility handling.
- Changing `cdd verify` status meanings or exit codes.
- Dropping a supported Node.js major version from the documented support matrix.

Internal refactors, dependency updates, new diagnostics, new commands, new optional generated sections, and clearer generated prose are non-breaking when the contracts above remain intact.
