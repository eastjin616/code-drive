# `src/core/changelog-generator.ts`

> Auto-generated API reference.

## Functions

### function `commitTypeToSection`

```typescript
function commitTypeToSection(type: CommitType, breaking: boolean): ChangelogSectionType
```

### export function `formatEntryLine`

```typescript
export function formatEntryLine(entry: ChangelogEntry): string
```

### export function `formatReleaseSection`

```typescript
export function formatReleaseSection(section: ReleaseSection): string
```

### export function `buildChangelog`

```typescript
export function buildChangelog(commits: CommitWithFiles[], version: string): ReleaseSection
```

### export function `mergeWithExisting`

```typescript
export function mergeWithExisting(newContent: string, existingPath: string): string
```

### function `escapeRegExp`

```typescript
function escapeRegExp(value: string): string
```

### function `removeVersionSection`

```typescript
function removeVersionSection(content: string, version: string): string
```

### export function `generateChangelogMarkdown`

```typescript
export function generateChangelogMarkdown(commits: CommitWithFiles[], version: string, outputPath: string): string
```

## Interfaces

### export interface `ChangelogEntry`

**Members:**
- `type`
- `description`
- `files`

### export interface `ReleaseSection`

**Members:**
- `version`
- `date`
- `entries`

### export interface `CommitWithFiles`

**Members:**
- `files`
