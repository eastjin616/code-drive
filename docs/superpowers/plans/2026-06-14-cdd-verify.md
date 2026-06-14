# CDD Verify Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add `cdd verify` to report CDD release readiness with human and JSON output.

**Architecture:** Add a focused verification core in `src/core/verify.ts`, a thin command wrapper in `src/commands/verify.ts`, and reuse existing analyzer, artifact freshness, AI context, git, and review logic. Keep terminal formatting out of the core so tests can assert structured results.

**Tech Stack:** TypeScript, Commander, Chalk, Vitest, Node fs/path/child_process.

---

### Task 1: Extract Reusable Review Findings

**Files:**
- Modify: `src/commands/review.ts`

- [x] Export reusable review types from `src/core/review-rules.ts`.
- [x] Add `collectReviewFindings(dir: string, options: AnalysisScopeOptions)`.
- [x] Make `reviewCommand` call `collectReviewFindings` instead of duplicating rule orchestration.
- [x] Verify review extraction through full `npm test`.

### Task 2: Add Verify Core

**Files:**
- Create: `src/core/verify.ts`
- Test: `tests/verify.test.ts`

- [x] Write failing tests for:
  - Ready project with fresh docs and AI context returns `ready`.
  - Missing generated artifacts returns `needs-sync`.
  - Stale generated artifact returns `needs-sync`.
  - Missing AI context routing returns `needs-attention`.
- [x] Implement `verifyProject(projectDir, options)` with status union `ready | needs-sync | needs-attention`.
- [x] Use `assessArtifactFreshness`, `findAiContextFiles`, `analyzeProject`, `collectReviewFindings`, and `isGitRepo`.
- [x] Return `checks` and `nextActions` arrays with stable `code`, `status`, and `message` fields.

### Task 3: Add Verify Command

**Files:**
- Create: `src/commands/verify.ts`
- Modify: `src/cli.ts`
- Modify: `src/index.ts`

- [x] Add `verifyCommand(dir, { includeTests, json })`.
- [x] For `--json`, print JSON from `verifyProject` without ANSI.
- [x] For human output, print title, status, checks, and next actions.
- [x] Register `cdd verify [directory] --include-tests --json` in `src/cli.ts`.
- [x] Export `verifyCommand` from `src/index.ts`.

### Task 4: Update Docs

**Files:**
- Modify: `README.md`
- Modify: `README.ko.md`
- Modify: `CHANGELOG.md`

- [x] Add `verify` to feature tables and command references.
- [x] Add release workflow example including `cdd verify`.
- [x] Document statuses: `ready`, `needs-sync`, `needs-attention`.
- [x] Add HEAD changelog entry for `cdd verify`.

### Task 5: Full Verification and Demo

**Commands:**
- `npm run lint`
- `npm run build`
- `npm test`
- `node dist/cli.js verify /Users/seodongjin/Desktop/cdd-demo-code-drive-20260614-lgLeQi`
- `node dist/cli.js verify --json /Users/seodongjin/Desktop/cdd-demo-code-drive-20260614-lgLeQi`

**Expected:**
- [x] Lint/build/tests exit 0.
- [x] Human verify prints a readiness status and next actions.
- [x] JSON verify prints parseable JSON with `status`, `checks`, and `nextActions`.
