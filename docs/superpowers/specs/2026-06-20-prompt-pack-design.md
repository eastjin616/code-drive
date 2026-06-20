# Prompt Pack Design

## Goal

Make `code-drive` useful for people who use AI through manual prompt engineering only: ChatGPT, Claude, Gemini, or similar web/chat tools that do not automatically read `AGENTS.md`, `CODEX.md`, `CLAUDE.md`, `CHANGELOG.md`, `ARCHITECTURE.md`, or generated docs.

## Target User

The primary user has a repository with useful project documents, but their AI surface cannot discover those files automatically. They need a copy-paste prompt that carries the project summary, relevant artifacts, constraints, and suggested questions into a chat session.

## Proposed Feature

Add a `cdd prompt` command that prints a Markdown prompt pack to stdout.

The prompt pack should:

- identify the project name, version, language, source count, entry points, dependencies, and generated CDD artifacts,
- explain that code is the source of truth and generated docs are context,
- list the important files the user should paste or attach when available,
- include a goal placeholder the user can edit,
- include useful starter questions for project explanation, risk review, implementation planning, and prompt-only next steps,
- support `--file <path>` to focus the prompt on one source file while still carrying project-level constraints.

## Scope

In scope:

- new prompt generator module,
- new `cdd prompt` CLI command,
- TUI command label/menu entry,
- focused tests for whole-project and file prompt output,
- README/README.ko story update that starts from why CDD exists and introduces prompt-only usage.

Out of scope:

- calling external AI APIs,
- copying to clipboard,
- adding dependencies,
- changing generated doc formats,
- changing agent-routing blocks.

## Architecture

Create `src/core/prompt-pack.ts` as a pure formatter on top of existing analyzer data. Create `src/commands/prompt.ts` as the command adapter that resolves options and writes stdout. Wire it into `src/cli.ts`, `src/tui-labels.ts`, `src/tui-messages.ts`, and `src/tui-runner.ts` using existing command patterns.

## Verification

- TDD for `generatePromptPack` whole-project output.
- TDD for `generatePromptPack` file-focused output.
- CLI smoke with `node dist/cli.js prompt . --file src/cli.ts`.
- `npm test`, `npm run build`, `npm run lint`, `git diff --check`.

