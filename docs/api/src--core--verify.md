# `src/core/verify.ts`

> Auto-generated API reference.

## Functions

### function `pass`

```typescript
function pass(code: string, message: string, target?: string): VerifyCheck
```

### function `warn`

```typescript
function warn(code: string, message: string, target?: string): VerifyCheck
```

### function `fail`

```typescript
function fail(code: string, message: string, target?: string): VerifyCheck
```

### function `info`

```typescript
function info(code: string, message: string, target?: string): VerifyCheck
```

### function `addNextAction`

```typescript
function addNextAction(actions: string[], action: string): void
```

### function `isRecord`

```typescript
function isRecord(value: unknown): value is Record<string, unknown>
```

### function `readProjectName`

```typescript
function readProjectName(projectDir: string): string
```

### function `verifyNode`

```typescript
function verifyNode(): VerifyCheck
```

### function `verifyGit`

```typescript
function verifyGit(projectDir: string): VerifyCheck[]
```

### function `verifyConfig`

```typescript
function verifyConfig(projectDir: string): VerifyCheck
```

### function `verifyArtifacts`

```typescript
function verifyArtifacts(projectDir: string, sourceFiles: readonly string[]): { readonly checks: readonly VerifyCheck[]; readonly needsSync: boolean }
```

### function `determineStatus`

```typescript
function determineStatus(checks: readonly VerifyCheck[], needsSync: boolean): VerifyStatus
```

### export function `verifyProject`

```typescript
export function verifyProject(projectDir: string, options: VerifyOptions = {}): VerifyResult
```

## Interfaces

### export interface `VerifyCheck`

**Members:**
- `status`
- `code`
- `message`
- `target`

### export interface `VerifyResult`

**Members:**
- `status`
- `projectName`
- `checks`
- `nextActions`
