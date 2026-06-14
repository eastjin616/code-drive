# `src/core/artifact-freshness.ts`

> Auto-generated API reference.

## Functions

### function `newestSourceMtime`

```typescript
function newestSourceMtime(projectDir: string, sourceFiles: readonly string[]): number | undefined
```

### export function `assessArtifactFreshness`

```typescript
export function assessArtifactFreshness(projectDir: string, artifacts: readonly ArtifactTarget[], sourceFiles: readonly string[]): ArtifactFreshness[]
```

## Interfaces

### export interface `ArtifactTarget`

**Members:**
- `label`
- `path`

### export interface `ArtifactFreshness`

**Members:**
- `label`
- `path`
- `status`
- `sourceCount`
- `artifactMtimeMs`
- `newestSourceMtimeMs`
