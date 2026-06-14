# `src/core/review-rules.ts`

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
function reviewSourceSize(sourceFiles: readonly string[], rootDir: string): ReviewFinding[]
```

### export function `collectReviewFindings`

```typescript
export function collectReviewFindings(targetDir: string, options: AnalysisScopeOptions = {}): ReviewSummary
```

## Interfaces

### export interface `ReviewFinding`

**Members:**
- `severity`
- `rule`
- `message`
- `file`
- `line`

### export interface `ReviewSummary`

**Members:**
- `projectName`
- `version`
- `functionCount`
- `classCount`
- `interfaceCount`
- `findings`
