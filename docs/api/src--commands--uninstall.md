# `src/commands/uninstall.ts`

> Auto-generated API reference.

## Functions

### export function `uninstallCommand`

```typescript
export function uninstallCommand(dir: string, options: UninstallOptions = {}): Promise<void>
```

### function `askRemoveAiContext`

```typescript
function askRemoveAiContext(aiContextFiles: readonly string[]): Promise<boolean>
```

### function `askRemoveRootDocs`

```typescript
function askRemoveRootDocs(rootDocs: readonly string[]): Promise<boolean>
```

### function `countFiles`

```typescript
function countFiles(dir: string): number
```

## Interfaces

### interface `UninstallOptions`

**Members:**
- `removeAiContext`
- `removeRootDocs`
