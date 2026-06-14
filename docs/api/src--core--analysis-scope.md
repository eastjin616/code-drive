# `src/core/analysis-scope.ts`

> Auto-generated API reference.

## Functions

### function `isRecord`

```typescript
function isRecord(value: unknown): value is Record<string, unknown>
```

### function `readString`

```typescript
function readString(record: Record<string, unknown>, key: string): string | undefined
```

### function `readStringArray`

```typescript
function readStringArray(record: Record<string, unknown>, key: string): readonly string[] | undefined
```

### function `normalizePathPattern`

```typescript
function normalizePathPattern(pattern: string): string
```

### function `sourceDirPattern`

```typescript
function sourceDirPattern(sourceDir: string, extensions: string): string
```

### function `testSourcePatterns`

```typescript
function testSourcePatterns(extensions: string): string[]
```

### export function `readCddConfig`

```typescript
export function readCddConfig(projectDir: string): CddConfig
```

### export function `getSourceFiles`

```typescript
export function getSourceFiles(projectDir: string, extensions: string, options: AnalysisScopeOptions = {}): string[]
```

## Interfaces

### export interface `AnalysisScopeOptions`

**Members:**
- `includeTests`
- `include`
- `exclude`

### export interface `CddConfig`

**Members:**
- `version`
- `sourceDir`
- `docDir`
- `projectRoot`
- `include`
- `exclude`
