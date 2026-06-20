# `src/core/design-style-usage.ts`

> Auto-generated API reference.

## Functions

### function `stripCssComments`

```typescript
function stripCssComments(content: string): string
```

### function `categorizeProperty`

```typescript
function categorizeProperty(name: string): DesignStyleCategory | null
```

### function `shouldSkipSelector`

```typescript
function shouldSkipSelector(selector: string): boolean
```

### export function `extractStyleUsage`

```typescript
export function extractStyleUsage(content: string, filePath: string): DesignStyleUsage[]
```
