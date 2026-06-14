# `src/commands/context.ts`

> Auto-generated API reference.

## Functions

### function `buildReverseImports`

```typescript
function buildReverseImports(imports: readonly ImportEdge[]): Map<string, { file: string; symbols: readonly string[] }[]>
```

### function `resolveActualPath`

```typescript
function resolveActualPath(targetDir: string, raw: string): string | null
```

### function `projectContext`

```typescript
function projectContext(targetDir: string, relativeDir: string, options: AnalysisScopeOptions): string
```

### function `fileContext`

```typescript
function fileContext(targetDir: string, filePath: string, options: AnalysisScopeOptions): string
```

### export function `contextCommand`

```typescript
export function contextCommand(dir: string, options: { file?: string; includeTests?: boolean }): Promise<void>
```
