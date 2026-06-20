# Agent Harness and Loop Engineering

이 문서는 `code-drive`에서 Codex가 리드하고, 필요할 때 Gemini/Kimi 같은 외부 어드바이저나 네이티브 서브에이전트를 붙여 구현과 검증을 반복하는 운영 하네스다. 목적은 더 많은 에이전트를 쓰는 것이 아니라, 코드가 진짜 source of truth라는 CDD 원칙을 유지하면서 테스트 가능한 루프를 만드는 것이다.

## Operating Contract

- Codex가 최종 책임자다. 계획, 파일 수정, 검증 결과 해석, 최종 보고는 Codex가 소유한다.
- Gemini/Kimi는 advisory reviewer다. 설계 리스크, 놓친 테스트, 간단한 대안 검토를 맡기되 파일 수정 권한을 주지 않는다.
- 네이티브 서브에이전트는 bounded teammate다. 독립적인 파일 범위, 질문, 검증 명령이 있을 때만 사용한다.
- 기존 사용자 변경은 보호한다. dirty worktree에서는 새 파일 추가나 명시된 범위 수정만 수행한다.
- 새 의존성은 추가하지 않는다. 하네스는 현재 CLI, 테스트, 문서, `.omx` artifact만 사용한다.

## Loop Shape

Canonical loop:

```text
inspect -> plan -> split -> act -> test -> review -> capture -> repeat
```

1. **Intake**
   - 사용자 요청을 한 문장 목표로 고정한다.
   - 수정 범위, 금지 범위, 완료 증거를 적는다.
   - `AGENTS.md`, `.omx/notepad.md`, 관련 generated docs를 읽되, 충돌하면 소스 코드와 실제 테스트를 우선한다.

2. **Harness Plan**
   - 구현 루프인지, 테스트 루프인지, 문서 루프인지 분류한다.
   - 최소 검증 명령을 먼저 정한다.
   - 병렬화 가능한 work lane만 서브에이전트로 분리한다.

3. **Advisor Check**
   - Gemini/Kimi가 사용 가능하면 read-only prompt로 리스크와 누락 체크를 묻는다.
   - 실패해도 작업은 멈추지 않는다.
   - raw output 또는 실패 사유를 `.omx/artifacts/agent-harness-<slug>-<timestamp>.md`에 남긴다.

4. **Implementation Loop**
   - 작은 diff 단위로 수정한다.
   - behavior가 바뀌면 테스트를 먼저 추가하거나 기존 테스트로 고정한다.
   - shared utility, command routing, generated output 포맷을 건드리면 관련 테스트를 좁게 실행한 뒤 필요할 때 전체 테스트로 확장한다.

5. **Verification Loop**
   - 변경 파일 기준으로 targeted test를 실행한다.
   - TypeScript나 public API를 건드리면 `npm run build`를 실행한다.
   - 포맷/문서만 바꿨다면 링크, 경로, 지침 충돌, diff scope를 확인한다.
   - 실패하면 원인 분석으로 돌아가고, 성공 전에는 완료를 주장하지 않는다.

6. **Synthesis**
   - 변경 파일, 하네스에서 얻은 신호, 검증 증거, 남은 리스크를 짧게 기록한다.
   - advisor 의견은 검증된 내용만 반영한다.

## Team Lanes

| Lane | Owner | When to Use | Output |
| --- | --- | --- | --- |
| Lead | Codex | Always | plan, edits, verification, final synthesis |
| Advisor | Gemini/Kimi | Requirements risk, test gaps, alternate approach review | artifact note, concise signal |
| Explorer | native `explore`/`researcher` | File mapping or dependency research that is independent | paths, symbols, cited findings |
| Executor | native `executor` | Disjoint implementation slice with clear write ownership | changed files and verification |
| Verifier | native `verifier`/`test-engineer` | Parallel test strategy or claim validation | pass/fail evidence and gaps |

Do not spawn a teammate for vague ownership. A valid lane includes:

- exact responsibility,
- allowed files or read-only status,
- stop condition,
- expected evidence.

For pane-based work, keep the layout configurable instead of hardcoding pane counts. A practical default is one leader pane, one implementation pane, one verification pane, and optional read-only advisor panes. Collapse back to single-threaded work when lanes are not independent.

## Visible Pane Protocol

이 workspace는 `cmux` 안에서 실행된다. 사용자가 "pane을 띄워서 보이게 작업"을 요청하면 `tmux split-window`나 macOS Terminal attach를 쓰지 말고, 현재 `cmux` workspace에 직접 split을 만들어야 한다. tmux 세션에 pane을 만들어도 Codex App 화면에는 보이지 않는다.

Current-session pane creation uses the bundled cmux CLI:

```bash
"$CMUX_BUNDLED_CLI_PATH" new-split right \
  --workspace "$CMUX_WORKSPACE_ID" \
  --surface "$CMUX_SURFACE_ID" \
  --focus false
```

Then send work into the returned surface id:

```bash
"$CMUX_BUNDLED_CLI_PATH" send \
  --workspace "$CMUX_WORKSPACE_ID" \
  --surface <surface-id> \
  $'cd /Users/seodongjin/Documents/GitHub/code-drive\nclear\nnpm test\n'
```

Recommended visible layout:

- **Lead pane**: current Codex session.
- **Test pane**: targeted tests, full test suite, build, lint.
- **Status/Smoke pane**: `git status`, focused diff checks, CLI smoke output.
- **Optional review pane**: external CLI or read-only checks when available.

Before claiming pane work is visible, verify it in the current `cmux` workspace:

```bash
"$CMUX_BUNDLED_CLI_PATH" list-panes --workspace "$CMUX_WORKSPACE_ID" --id-format both
"$CMUX_BUNDLED_CLI_PATH" tree --workspace "$CMUX_WORKSPACE_ID" --id-format both
```

The expected result is multiple panes under the same `CMUX_WORKSPACE_ID`, including the original Codex pane plus the new test/status panes. If only one pane appears, no visible pane was created.

## Advisor Prompt Template

```text
You are an advisory reviewer only. Do not edit files.

Task:
<one sentence objective>

Repository context:
<branch/status summary, relevant files, constraints>

Question:
Give concise risks, missing checks, and recommended next action.
Return at most 8 bullets.
```

## Implementation Prompt Template

```text
You are a bounded implementation teammate.

Task:
<specific slice>

Ownership:
<allowed files/directories>

Constraints:
- Do not revert unrelated changes.
- Follow AGENTS.md and existing repo patterns.
- Keep the diff small.

Verification:
<targeted command or manual evidence>

Return:
- changed files
- verification result
- blockers or risks
```

## Verification Matrix

| Change Type | Minimum Evidence | Escalate To |
| --- | --- | --- |
| Markdown-only workflow docs | `git diff --check`, path/link review | no broad test unless docs drive generated output |
| CLI command behavior | targeted Vitest file, then `npm run build` | `npm test` if routing or shared command behavior changes |
| Core analyzer/generator logic | focused unit tests plus generated output review | `npm test` and `npm run build` |
| TUI behavior | TUI unit tests plus manual command smoke where practical | full test suite if status/recommendation flow changes |
| Release/readiness flow | `npm run lint`, `npm run build`, `npm test` | demo project smoke if user-facing docs or commands change |

## Artifact Format

Each harness run should create a durable note:

```markdown
# Agent Harness: <task>

## Task

## Local Context

## Advisor Prompt

## Advisor Output

## Codex Synthesis

## Verification
```

If Gemini/Kimi is unavailable, record the exact failure and continue with Codex-owned execution.

## Handoff Template

```markdown
## What Changed

## What Was Verified

## Advisor/Subagent Signal

## Open Risks

## Next Step
```

## Stop Conditions

Stop only when:

- requested file changes are complete,
- verification evidence is collected,
- advisor/subagent results have been integrated or explicitly rejected,
- no known errors remain in the touched scope,
- final report lists changed files and remaining risks.

Continue looping when:

- tests fail,
- the diff touches broader behavior than planned,
- an advisor reports a plausible unverified risk,
- generated docs conflict with source code,
- the worktree shows unexpected changes in files outside the owned scope.
