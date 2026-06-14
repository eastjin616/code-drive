# `src/commands/review.ts`

> Auto-generated API reference.

## Functions

### function `parseMaxFindings`

```typescript
function parseMaxFindings(raw: string | number | undefined): number
```

### function `printFindingGroup`

```typescript
function printFindingGroup(title: string, findings: ReviewFinding[], maxFindings: number, color: (message: string) => string, icon: string): void
```

### export function `reviewCommand`

```typescript
export function reviewCommand(dir: string, options: ReviewOptions): Promise<void>
```

## Interfaces

### interface `ReviewOptions`

**Members:**
- `output`
- `includeTests`
- `maxFindings`
