# `src/core/changelog-parser.ts`

> Auto-generated API reference.

## Functions

### export function `classifyCommitType`

```typescript
export function classifyCommitType(message: string): { type: CommitType; scope?: string; description: string; breaking: boolean }
```

### export function `isGitRepo`

```typescript
export function isGitRepo(dir: string): boolean
```

### export function `parseGitLog`

```typescript
export function parseGitLog(from?: string, to?: string, dir = '.'): Commit[]
```

### function `parseCommitBlock`

```typescript
function parseCommitBlock(block: string): Commit | null
```

### export function `getChangedFiles`

```typescript
export function getChangedFiles(hash: string, dir = '.'): string[]
```

### export function `getCurrentTag`

```typescript
export function getCurrentTag(dir = '.'): string | null
```

### export function `getFirstCommitHash`

```typescript
export function getFirstCommitHash(dir = '.'): string | null
```

## Interfaces

### export interface `Commit`

**Members:**
- `hash`
- `date`
- `raw`
- `type`
- `scope`
- `description`
- `breaking`
