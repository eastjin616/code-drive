# `src/core/generator.ts`

> Auto-generated API reference.

## Functions

### export function `generateReadmeDocs`

```typescript
export function generateReadmeDocs(project: ProjectInfo, functions: FunctionDecl[], classes: ClassDecl[], interfaces: InterfaceDecl[], annotations: CodeAnnotation[]): string
```

### export function `generateApiDocs`

```typescript
export function generateApiDocs(filePath: string, functions: FunctionDecl[], classes: ClassDecl[], interfaces: InterfaceDecl[]): string
```

### export function `generateArchitectureSpec`

```typescript
export function generateArchitectureSpec(project: ProjectInfo, functions: FunctionDecl[], classes: ClassDecl[], interfaces: InterfaceDecl[], imports: ImportEdge[]): string
```

### export function `generateCddConfig`

```typescript
export function generateCddConfig(dir: string): Record<string, unknown>
```

### function `groupByModule`

```typescript
function groupByModule(sourceFiles: string[]): ModuleGroup[]
```

### export function `writeDocs`

```typescript
export function writeDocs(results: DocResult[]): void
```

## Interfaces

### export interface `DocResult`

**Members:**
- `filePath`
- `content`

### interface `ModuleGroup`

**Members:**
- `name`
- `files`
