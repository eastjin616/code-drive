export interface DesignColor {
  readonly name: string;
  readonly value: string;
  readonly source: string;
  readonly category: string;
}

export interface DesignTypography {
  readonly fontFamily: string;
  readonly source: string;
  sizes?: { readonly name: string; readonly value: string }[];
  weights?: { readonly name: string; readonly value: string }[];
}

export interface DesignSpacing {
  readonly name: string;
  readonly value: string;
  readonly source: string;
}

export interface DesignBorderRadius {
  readonly name: string;
  readonly value: string;
  readonly source: string;
}

export interface DesignShadow {
  readonly name: string;
  readonly value: string;
  readonly source: string;
}

export type DesignStyleCategory =
  | 'color'
  | 'typography'
  | 'spacing'
  | 'radius'
  | 'shadow'
  | 'border'
  | 'layout';

export interface DesignStyleProperty {
  readonly name: string;
  readonly value: string;
  readonly category: DesignStyleCategory;
}

export interface DesignStyleUsage {
  readonly selector: string;
  readonly source: string;
  properties: DesignStyleProperty[];
}

export interface DesignTokens {
  readonly projectName: string;
  colors: DesignColor[];
  typography: DesignTypography[];
  spacing: DesignSpacing[];
  borderRadius: DesignBorderRadius[];
  shadows: DesignShadow[];
  styleUsage: DesignStyleUsage[];
  hasTailwind: boolean;
}
