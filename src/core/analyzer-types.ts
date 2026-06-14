export interface ProjectInfo {
  readonly name: string;
  readonly version: string;
  readonly language: string;
  readonly sourceFiles: readonly string[];
  readonly entryPoints: readonly string[];
  readonly dependencies: readonly string[];
}

export interface FunctionDecl {
  readonly name: string;
  readonly file: string;
  readonly line: number;
  readonly exportKind: 'export' | 'default' | 'none';
  readonly params: readonly string[];
  readonly returnType: string;
  readonly doc: string;
}

export interface ClassDecl {
  readonly name: string;
  readonly file: string;
  readonly line: number;
  readonly exportKind: 'export' | 'default' | 'none';
  readonly methods: readonly string[];
  readonly properties: readonly string[];
  readonly extendsClause: string;
  readonly doc: string;
}

export interface InterfaceDecl {
  readonly name: string;
  readonly file: string;
  readonly line: number;
  readonly exportKind: 'export' | 'none';
  readonly members: readonly string[];
  readonly doc: string;
}

export interface ImportEdge {
  readonly from: string;
  readonly to: string;
  readonly symbols: readonly string[];
}

export interface CodeAnnotation {
  readonly file: string;
  readonly line: number;
  readonly tag: string;
  readonly content: string;
}

export interface AnalysisResult {
  readonly project: ProjectInfo;
  readonly functions: readonly FunctionDecl[];
  readonly classes: readonly ClassDecl[];
  readonly interfaces: readonly InterfaceDecl[];
  readonly imports: readonly ImportEdge[];
  readonly annotations: readonly CodeAnnotation[];
}
