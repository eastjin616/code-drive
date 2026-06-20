# `src/tui-runner.ts`

> Auto-generated API reference.

## Functions

### function `isDirectSelection`

```typescript
function isDirectSelection(value: unknown): value is DirectSelection
```

### function `promptContinue`

```typescript
function promptContinue(): Promise<boolean>
```

### function `openFile`

```typescript
function openFile(filePath: string): void
```

### function `maybeOpenOutput`

```typescript
function maybeOpenOutput(command: RunnableCommand, targetDir: string): Promise<void>
```

### function `runInit`

```typescript
function runInit(targetDir: string): Promise<void>
```

### function `runCommand`

```typescript
function runCommand(command: Exclude<RunnableCommand, 'init'>, targetDir: string): Promise<void>
```

### function `runOne`

```typescript
function runOne(command: RunnableCommand, targetDir: string): Promise<void>
```

### function `showCurrentDashboard`

```typescript
function showCurrentDashboard(targetDir: string): RecommendedCommand
```

### function `runDirectCommands`

```typescript
function runDirectCommands(targetDir: string): Promise<void>
```

### export function `runTUI`

```typescript
export function runTUI(): Promise<void>
```
