# cdd changelog — Design Spec

**Version**: 0.1 (draft)
**Date**: 2026-06-13
**Status**: Draft

## Overview

`cdd changelog` — git log를 분석하고 변경된 API/함수까지 AST로 추적하여 CHANGELOG.md를 자동 생성한다. 단순 커밋 메시지 나열이 아닌, **실제로 바뀐 함수/인터페이스 레벨의 변경사항**까지 포함한다.

```bash
cdd changelog         # 기본: 마지막 태그 ~ HEAD
cdd changelog -f v0.1.0 -t v0.2.0   # 특정 범위
cdd changelog --dry-run              # 파일 쓰지 않고 출력만
```

## File Structure

```
src/
├── core/
│   ├── analyzer.ts              # (기존)
│   ├── changelog-parser.ts      # [신규] git log 파싱
│   ├── changelog-generator.ts   # [신규] 마크다운 생성 + 머지
│   └── ...
├── commands/
│   ├── changelog.ts             # [신규] CLI 진입점
│   └── ...
├── cli.ts                       # 수정: changelogCommand 등록
└── tui.ts                       # 수정: changelog 메뉴 항목 추가
```

## Core Types

```typescript
// changelog-parser.ts

interface Commit {
  hash: string;
  date: string;         // ISO 8601 (git log --format=%ai)
  raw: string;          // 원본 커밋 메시지 전체
  type: CommitType;     // feat | fix | docs | chore | refactor | test | style | perf | ci
  scope?: string;       // (scope) 그룹
  description: string;  // 첫 줄 요약
  breaking: boolean;    // BREAKING CHANGE 감지
}

type CommitType = 'feat' | 'fix' | 'docs' | 'chore' | 'refactor'
                | 'test' | 'style' | 'perf' | 'ci' | 'other';

interface ChangedFile {
  hash: string;
  path: string;
  addedFunctions: string[];    // AST 분석: 새로 추가된 함수
  modifiedFunctions: string[]; // AST 분석: 기존에서 변경된 함수
  removedFunctions: string[];  // (참고: git diff --diff-filter=D)
}
```

```typescript
// changelog-generator.ts

interface ChangelogEntry {
  type: 'added' | 'fixed' | 'changed' | 'removed' | 'deprecated' | 'security' | 'docs';
  description: string;
  files: string[];
  functions?: string[];
}

interface ReleaseSection {
  version: string;
  date: string;
  entries: ChangelogEntry[];
}
```

## Component Details

### changelog-parser.ts

**`parseGitLog(from?: string, to?: string): Commit[]`**

- `git log --format=%H||%ai||%s||%b=====` 실행
- 각 라인을 `||` 기준으로 split → hash / date / subject / body
- subject를 conventional commit 정규식으로 파싱: `^(feat|fix|docs|...)(\(.+\))?!?:\s(.+)`
- body에 `BREAKING CHANGE:` 포함 → `breaking: true`

**`getChangedFiles(hash: string): string[]`**

- `git diff-tree --no-commit-id -r --name-only <hash>` 실행
- 결과를 라인 단위로 배열 반환
- 첫 번째 커밋(root commit)은 `--diff-filter=A`로 처리 (전체 파일이 added)

**`getCurrentTag(): string | null`**

- `git describe --tags --abbrev=0` 실행
- 실패 시 null 반환 (from 기본값 = 모든 커밋)

**`classifyCommitType(message: string): CommitType`**

- 정규식 기반 conventional commit 타입 추출
- 매칭 실패 → `'other'`

> **Note**: v0.1에서는 함수 레벨 AST diff는 제외. 커밋 메시지 + 변경 파일 목록 기반으로 동작.

### changelog-generator.ts

**`generateChangelog(commits: Commit[], dir: string): string`**

1. 각 커밋에 대해 `getChangedFiles()` 호출
2. 변경된 파일을 `analyzeSourceFiles()`로 AST 스캔 → 새로 추가된 함수, 변경된 함수 식별
3. Commit.type 기반으로 ChangelogEntry 매핑:
   - `feat` → `added`
   - `fix` → `fixed`
   - `docs` → `docs`
   - `refactor` + 함수 변경 → `changed`
   - `breaking: true` → `changed` (별도 표시)
   - 그 외 → `changed`
4. ReleaseSection 생성 (version = `getCurrentTag()` or `from..to`)

**`mergeWithExisting(newSection: ReleaseSection, existingPath: string): string`**

1. 기존 CHANGELOG.md 읽기
2. 첫 번째 `## [` (최상위 헤더) 찾기
3. 그 앞에 새 ReleaseSection prepend
4. 파일이 없으면 새로 생성

**`formatReleaseSection(section: ReleaseSection): string`**

출력 포맷:
```markdown
## [0.3.0] — 2026-06-13

### Added
- `cdd changelog` — 커밋 로그 + AST 기반 체인지로그 생성
  → `src/core/changelog-parser.ts`, `src/core/changelog-generator.ts`, `src/commands/changelog.ts`
  → 함수 추가: `parseGitLog()`, `generateChangelog()`, `mergeWithExisting()`

### Fixed
- `cdd review` — 순환 의존성 감지 오류 수정
  → `src/core/analyzer.ts`
```

### commands/changelog.ts

CLI 옵션:

| Option | Description |
|--------|-------------|
| `-f, --from <ref>` | 시작 커밋 (기본: 마지막 태그, 없으면 최초 커밋) |
| `-t, --to <ref>` | 끝 커밋 (기본: HEAD) |
| `-o, --output <path>` | 출력 파일 (기본: `./CHANGELOG.md`) |
| `--dry-run` | 파일 쓰지 않고 표준 출력만 |

동작:

1. `path.resolve(dir)` → targetDir 확인
2. `spawnSync('git', ['rev-parse', '--git-dir'], cwd: targetDir)` → git 레포 확인
3. `from` 기본값: `getCurrentTag()` || 최초 커밋 (`git log --reverse --format=%H | head -1`)
4. `parseGitLog(from, to)` → `Commit[]`
5. `generateChangelog(commits, targetDir)` → `section`
6. 기존 파일 읽기 시도
7. `mergeWithExisting(section, outputPath)` → 결과 문자열
8. `--dry-run`이면 stdout 출력, 아니면 파일 저장

## Error Handling

| 상황 | 처리 |
|------|------|
| git 레포 아님 | `Chalk.red("Not a git repository")` → exit 1 |
| 태그 없어서 from 자동설정 실패 | 최초 커밋 해시로 fallback |
| 변경 파일 없음 | `Chalk.yellow("No changes found")` → exit 0, 파일 생성 안 함 |
| git 명령어 실패 | stderr 캡처 → 에러 메시지 + exit 1 |
| CHANGELOG.md 없음 | 새로 생성 (prepend 없이 전체) |

## Testing

| Test | Description |
|------|-------------|
| `parseGitLog()` | fixture 문자열 → Commit[] 정확성 |
| `classifyCommitType()` | feat/fix/docs/... 타입 분류 |
| `getChangedFiles()` | fixture diff → 파일 목록 |
| 컨벤셔널 커밋 정규식 | edge case: `feat(scope)!:`, `fix!:`, body BREAKING CHANGE |
| `generateChangelog()` | 가상 커밋 목록 → 마크다운 포맷 일치 |
| `mergeWithExisting()` | 기존 CHANGELOG.md prepend 검증 |
| `formatReleaseSection()` | 출력 포맷 스냅샷 |
| 통합 테스트 | 실제 git repo에서 전체 플로우 실행 |

## Not In Scope (v0.1)

- `cdd design` merge/업데이트 모드 (다음 태스크)
- GitHub 릴리스 연동
- Jira/Linear 티켓 링크 자동 추출
- 멀티랭귀지 AST 분석 (현재는 TS/JS만)

## Implementation Order

1. `changelog-parser.ts` — git 인터페이스 + 커밋 파싱
2. `changelog-generator.ts` — 마크다운 생성 + prepend 머지
3. `commands/changelog.ts` — CLI 연결
4. `cli.ts` + `tui.ts` — 등록
5. 테스트 추가
6. README 업데이트
