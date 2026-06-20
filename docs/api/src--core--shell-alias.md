# `src/core/shell-alias.ts`

> Auto-generated API reference.

## Functions

### function `normalizePath`

```typescript
function normalizePath(value: string, homeDir: string): string
```

### function `extractAliasTarget`

```typescript
function extractAliasTarget(line: string): string | null
```

### function `readShellAliasFiles`

```typescript
function readShellAliasFiles(homeDir: string): ShellAliasFile[]
```

### export function `findCddShellAliasIssues`

```typescript
export function findCddShellAliasIssues(options: ShellAliasOptions): ShellAliasIssue[]
```

## Interfaces

### export interface `ShellAliasFile`

**Members:**
- `path`
- `content`

### export interface `ShellAliasIssue`

**Members:**
- `file`
- `line`
- `target`

### export interface `ShellAliasOptions`

**Members:**
- `projectDir`
- `homeDir`
- `files`
