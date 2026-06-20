# `src/tui-status.ts`

> Auto-generated API reference.

## Functions

### function `countChecks`

```typescript
function countChecks(result: VerifyResult): TuiStatusSummary
```

### function `hasNextAction`

```typescript
function hasNextAction(result: VerifyResult, snippet: string): boolean
```

### function `chooseRecommendedCommand`

```typescript
function chooseRecommendedCommand(result: VerifyResult): RecommendedCommand
```

### function `collectArtifactsNeedingSync`

```typescript
function collectArtifactsNeedingSync(result: VerifyResult): readonly string[]
```

### function `localizeNextAction`

```typescript
function localizeNextAction(action: string): string
```

### export function `buildTuiStatus`

```typescript
export function buildTuiStatus(result: VerifyResult): TuiStatus
```

### export function `readTuiStatus`

```typescript
export function readTuiStatus(projectDir: string): TuiStatus
```

### export function `statusSummaryParts`

```typescript
export function statusSummaryParts(summary: TuiStatusSummary): readonly string[]
```

## Interfaces

### export interface `TuiStatusSummary`

**Members:**
- `pass`
- `warn`
- `fail`
- `info`

### export interface `TuiStatus`

**Members:**
- `projectName`
- `status`
- `summary`
- `artifactsNeedingSync`
- `nextActions`
- `recommendedCommand`
