# `src/commands/review.ts`

> Auto-generated API reference.

## Functions

### function `reviewNaming`

```typescript
function reviewNaming(functions: ReturnType<typeof analyzeAll>['functions']): ReviewFinding[]
```

### function `reviewAnnotations`

```typescript
function reviewAnnotations(annotations: ReturnType<typeof analyzeAll>['annotations']): ReviewFinding[]
```

### function `reviewDependencies`

```typescript
function reviewDependencies(imports: ReturnType<typeof analyzeAll>['imports']): ReviewFinding[]
```

### function `reviewSourceSize`

```typescript
function reviewSourceSize(sourceFiles: string[], rootDir: string): ReviewFinding[]
```

### export function `reviewCommand`

```typescript
export function reviewCommand(dir: string, options: { output?: string }): Promise<void>
```

## Interfaces

### interface `ReviewFinding`

**Members:**
- `severity`
- `rule`
- `message`
- `file`
- `line`
