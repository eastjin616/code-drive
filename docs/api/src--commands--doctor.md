# `src/commands/doctor.ts`

> Auto-generated API reference.

## Functions

### function `ok`

```typescript
function ok(msg: string): Check
```

### function `warn`

```typescript
function warn(msg: string): Check
```

### function `fail`

```typescript
function fail(msg: string): Check
```

### function `info`

```typescript
function info(msg: string): Check
```

### function `addRecommendation`

```typescript
function addRecommendation(recommendations: string[], message: string): void
```

### export function `doctorCommand`

```typescript
export function doctorCommand(dir: string, options: DoctorOptions = {}): Promise<void>
```

## Interfaces

### interface `Check`

**Members:**
- `label`
- `status`
- `message`

### interface `DoctorOptions`

**Members:**
- `includeTests`
