# CDD Verify Design

## Goal

Add `cdd verify` as a release-readiness command that tells users whether a project is ready, needs a doc sync, or needs attention before release or AI-assisted work.

## Problem

CDD now generates documentation, architecture specs, design tokens, changelogs, health checks, and AI context routing. Users still need one clear command that answers: "Is this project in a good CDD state right now?"

## Command

```bash
cdd verify [directory]
cdd verify [directory] --include-tests
cdd verify [directory] --json
```

## Status Model

- `ready`: CDD config exists, source analysis works, required generated artifacts exist and are fresh, AI context routing exists, and no review errors are present.
- `needs-sync`: generated artifacts are missing or stale, but the project is otherwise analyzable.
- `needs-attention`: CDD config is missing or invalid, project analysis fails, source files are missing, AI routing is missing, review errors exist, or required runtime/git checks fail.

`needs-attention` outranks `needs-sync`; `needs-sync` outranks `ready`.

## Checks

`cdd verify` checks:

- Node.js major version is at least 18.
- Git is available and the directory is a git repository.
- `.cdd/config.json` exists and is valid JSON.
- Source analysis finds source files using `.cdd/config.json` scope.
- `docs/README.md`, `ARCHITECTURE.md`, `DESIGN.md`, and `CHANGELOG.md` exist.
- Generated artifacts are not older than source files.
- At least one AI instruction file contains the CDD managed AI context block.
- Review rules find no `error` severity findings.

Review warnings and info are shown but do not block readiness unless future rules promote them to errors.

## Output

Human output is concise and action-oriented:

```txt
CDD Verify - my-project

Status: needs-sync

Checks
  PASS CDD config found
  PASS 42 source files analyzed
  WARN DESIGN.md is older than source files
  PASS AI context routing installed

Next actions
  1. Run cdd sync .
```

JSON output returns stable structured data:

```json
{
  "status": "needs-sync",
  "projectName": "my-project",
  "checks": [
    { "status": "warn", "code": "artifact-stale", "message": "DESIGN.md is older than source files" }
  ],
  "nextActions": ["Run cdd sync ."]
}
```

## Architecture

- `src/core/verify.ts` owns the readiness model and pure-ish project checks.
- `src/commands/verify.ts` owns CLI output formatting.
- `src/commands/review.ts` exports review collection so `verify` can reuse the same rules without parsing terminal output.
- `src/cli.ts` registers `verify`.
- `tests/verify.test.ts` covers ready, missing docs, stale docs, and missing AI routing.

## Error Handling

Expected project problems become verify checks, not thrown errors. Missing target directory remains a thrown command error. JSON output must not include ANSI color.

## Documentation

Update `README.md`, `README.ko.md`, and `CHANGELOG.md` to describe `cdd verify`, options, readiness statuses, and the recommended release workflow:

```bash
cdd sync .
cdd verify .
```

## Verification

Run:

```bash
npm run lint
npm run build
npm test
node dist/cli.js verify <demo-project>
node dist/cli.js verify <demo-project> --json
```
