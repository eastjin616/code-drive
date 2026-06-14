# `src/core/design-extractor.ts`

> Auto-generated API reference.

## Functions

### function `stripComments`

```typescript
function stripComments(code: string): string
```

### function `extractConstantObject`

```typescript
function extractConstantObject(rawContent: string, filePath: string): Partial<DesignTokens>
```

### function `extractTailwindConfig`

```typescript
function extractTailwindConfig(filePath: string): Partial<DesignTokens> | null
```

### export function `extractDesignTokens`

```typescript
export function extractDesignTokens(projectDir: string, projectName: string): DesignTokens
```

### function `mergeTokens`

```typescript
function mergeTokens(target: DesignTokens, source: DesignTokens): void
```

### function `mergePartialTokens`

```typescript
function mergePartialTokens(target: DesignTokens, source: Partial<DesignTokens>): void
```

### function `dedupeColors`

```typescript
function dedupeColors(arr: DesignColor[]): DesignColor[]
```

### function `dedupeByName`

```typescript
function dedupeByName(arr: T[]): T[]
```
