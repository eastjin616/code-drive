# `src/core/ai-context.ts`

> Auto-generated API reference.

## Functions

### export function `findAiContextFiles`

```typescript
export function findAiContextFiles(projectDir: string): readonly string[]
```

### export function `generateAiContextBlock`

```typescript
export function generateAiContextBlock(): string
```

### export function `upsertAiContextBlock`

```typescript
export function upsertAiContextBlock(content: string, block = generateAiContextBlock()): string
```

### export function `removeAiContextBlock`

```typescript
export function removeAiContextBlock(content: string): string
```

### export function `installAiContext`

```typescript
export function installAiContext(projectDir: string): AiContextInstallResult
```

### export function `removeAiContext`

```typescript
export function removeAiContext(projectDir: string): AiContextRemoveResult
```

## Interfaces

### export interface `AiContextInstallResult`

**Members:**
- `targetFiles`
- `createdFiles`
- `updatedFiles`

### export interface `AiContextRemoveResult`

**Members:**
- `targetFiles`
- `updatedFiles`
- `unchangedFiles`
