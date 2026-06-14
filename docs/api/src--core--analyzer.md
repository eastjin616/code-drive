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

### function `chooseEntryPoints`

```typescript
function chooseEntryPoints(sourceFiles: readonly string[], packageMain?: unknown): string[]
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
export function analyzeProject(dir: string, options: AnalysisScopeOptions = {}): ProjectInfo
```

### export function `analyzeSourceFiles`

```typescript
export function analyzeSourceFiles(dir: string, options: AnalysisScopeOptions = {}): { functions: FunctionDecl[]; classes: ClassDecl[]; interfaces: InterfaceDecl[]; imports: ImportEdge[]; }
```

### export function `extractAnnotations`

```typescript
export function extractAnnotations(dir: string, options: AnalysisScopeOptions = {}): CodeAnnotation[]
```

### export function `analyzeAll`

```typescript
export function analyzeAll(dir: string, options: AnalysisScopeOptions = {}): AnalysisResult
```
