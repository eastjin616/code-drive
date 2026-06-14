# `src/commands/verify.ts`

> Auto-generated API reference.

## Functions

### function `statusColor`

```typescript
function statusColor(status: VerifyCheckStatus): (message: string) => string
```

### function `statusIcon`

```typescript
function statusIcon(status: VerifyCheckStatus): string
```

### export function `verifyCommand`

```typescript
export function verifyCommand(dir: string, options: VerifyCommandOptions = {}): Promise<void>
```

## Interfaces

### export interface `VerifyCommandOptions`

**Members:**
- `includeTests`
- `json`
