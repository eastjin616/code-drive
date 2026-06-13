# `src/core/analyzer.ts`

> Auto-generated API reference.

## Functions

### function `detectLanguage`

```typescript
function detectLanguage(ext: string): string
```

### function `getJSDoc`

```typescript
function getJSDoc(node: ts.Node, _sourceFile: ts.SourceFile): string
```

### function `getNodeText`

```typescript
function getNodeText(node: ts.Node | undefined): string
```

### function `parseSourceFile`

```typescript
function parseSourceFile(filePath: string, relativePath: string): { functions: FunctionDecl[]; classes: ClassDecl[]; interfaces: InterfaceDecl[]; imports: ImportEdge[]; }
```

### function `visit`

```typescript
function visit(node: ts.Node)
```

### export function `analyzeProject`

```typescript
export function analyzeProject(dir: string): ProjectInfo
```

### export function `analyzeSourceFiles`

```typescript
export function analyzeSourceFiles(dir: string): { functions: FunctionDecl[]; classes: ClassDecl[]; interfaces: InterfaceDecl[]; imports: ImportEdge[]; }
```

### export function `extractAnnotations`

```typescript
export function extractAnnotations(dir: string): CodeAnnotation[]
```

### export function `analyzeAll`

```typescript
export function analyzeAll(dir: string): AnalysisResult
```

## Interfaces

### export interface `ProjectInfo`

**Members:**
- `name`
- `version`
- `language`
- `sourceFiles`
- `entryPoints`
- `dependencies`

### export interface `FunctionDecl`

**Members:**
- `name`
- `file`
- `line`
- `exportKind`
- `params`
- `returnType`
- `doc`

### export interface `ClassDecl`

**Members:**
- `name`
- `file`
- `line`
- `exportKind`
- `methods`
- `properties`
- `extendsClause`
- `doc`

### export interface `InterfaceDecl`

**Members:**
- `name`
- `file`
- `line`
- `exportKind`
- `members`
- `doc`

### export interface `ImportEdge`

**Members:**
- `from`
- `to`
- `symbols`

### export interface `CodeAnnotation`

**Members:**
- `file`
- `line`
- `tag`
- `content`

### export interface `AnalysisResult`

**Members:**
- `project`
- `functions`
- `classes`
- `interfaces`
- `imports`
- `annotations`
