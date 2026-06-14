# `src/core/analyzer-types.ts`

> Auto-generated API reference.

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
