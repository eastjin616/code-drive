# `src/core/prompt-pack.ts`

> Auto-generated API reference.

## Functions

### function `resolveActualPath`

```typescript
function resolveActualPath(targetDir: string, raw: string): string | null
```

### function `existingArtifacts`

```typescript
function existingArtifacts(targetDir: string): string[]
```

### function `generatedArtifactLines`

```typescript
function generatedArtifactLines(targetDir: string): string[]
```

### function `formatList`

```typescript
function formatList(items: readonly string[]): string[]
```

### function `focusFileSection`

```typescript
function focusFileSection(targetDir: string, options: PromptPackOptions): string[]
```

### export function `generatePromptPack`

```typescript
export function generatePromptPack(projectDir: string, options: PromptPackOptions = {}): string
```

## Interfaces

### export interface `PromptPackOptions`

**Members:**
- `file`
