import * as fs from 'node:fs';
import * as path from 'node:path';
import { globSync } from 'glob';

// ─── Types ────────────────────────────────────────────────────────────

export interface DesignColor {
  name: string;
  value: string;
  source: string;
  category: string; // 'primary', 'neutral', 'accent', 'semantic', etc.
}

export interface DesignTypography {
  fontFamily: string;
  source: string;
  sizes?: { name: string; value: string }[];
  weights?: { name: string; value: string }[];
}

export interface DesignSpacing {
  name: string;
  value: string;
  source: string;
}

export interface DesignBorderRadius {
  name: string;
  value: string;
  source: string;
}

export interface DesignShadow {
  name: string;
  value: string;
  source: string;
}

export interface DesignTokens {
  projectName: string;
  colors: DesignColor[];
  typography: DesignTypography[];
  spacing: DesignSpacing[];
  borderRadius: DesignBorderRadius[];
  shadows: DesignShadow[];
  hasTailwind: boolean;
}

// ─── CSS Custom Properties Extractor ──────────────────────────────────

const CSS_VAR_PATTERNS: Record<string, RegExp>[] = [
  {
    color: /--(?:color|clr|c)-([\w-]+)\s*:\s*([^;]+)/gi,
  },
  {
    font: /--(?:font|ff)-([\w-]+)\s*:\s*([^;]+)/gi,
  },
  {
    size: /--(?:fs|font-size|text)-([\w-]+)\s*:\s*([^;]+)/gi,
  },
  {
    weight: /--(?:fw|font-weight)-([\w-]+)\s*:\s*([^;]+)/gi,
  },
  {
    spacing: /--(?:spacing|space|gap|m-|p-)-([\w-]+)\s*:\s*([^;]+)/gi,
  },
  {
    radius: /--(?:radius|rounded|border-radius)-([\w-]+)\s*:\s*([^;]+)/gi,
  },
  {
    shadow: /--(?:shadow|box-shadow)-([\w-]+)\s*:\s*([^;]+)/gi,
  },
];

function extractCSSVariables(content: string, filePath: string): DesignTokens {
  const tokens: DesignTokens = {
    projectName: '',
    colors: [],
    typography: [],
    spacing: [],
    borderRadius: [],
    shadows: [],
    hasTailwind: false,
  };

  // Colors
  const colorMatches = content.matchAll(/--(?:color|clr|c)-([\w-]+)\s*:\s*([^;]+)/gi);
  for (const m of colorMatches) {
    tokens.colors.push({
      name: m[1].trim(),
      value: m[2].trim(),
      source: filePath,
      category: inferColorCategory(m[1]),
    });
  }

  // Typography - font families
  const fontMatches = content.matchAll(/--(?:font|ff)-([\w-]+)\s*:\s*([^;]+)/gi);
  for (const m of fontMatches) {
    tokens.typography.push({
      fontFamily: m[2].trim(),
      source: filePath,
    });
  }

  // Font sizes
  const sizeMatches = content.matchAll(/--(?:fs|font-size|text)-([\w-]+)\s*:\s*([^;]+)/gi);
  for (const m of sizeMatches) {
    if (!tokens.typography[0]) tokens.typography.push({ fontFamily: '', source: filePath });
    const t = tokens.typography[0];
    if (!t.sizes) t.sizes = [];
    t.sizes.push({ name: m[1].trim(), value: m[2].trim() });
  }

  // Spacing
  const spacingMatches = content.matchAll(/--(?:spacing|space|gap)-([\w-]+)\s*:\s*([^;]+)/gi);
  for (const m of spacingMatches) {
    tokens.spacing.push({
      name: m[1].trim(),
      value: m[2].trim(),
      source: filePath,
    });
  }

  // Border radius
  const radiusMatches = content.matchAll(/--(?:radius|rounded|border-radius)-([\w-]+)\s*:\s*([^;]+)/gi);
  for (const m of radiusMatches) {
    tokens.borderRadius.push({
      name: m[1].trim(),
      value: m[2].trim(),
      source: filePath,
    });
  }

  // Shadows
  const shadowMatches = content.matchAll(/--(?:shadow|box-shadow)-([\w-]+)\s*:\s*([^;]+)/gi);
  for (const m of shadowMatches) {
    tokens.shadows.push({
      name: m[1].trim(),
      value: m[2].trim(),
      source: filePath,
    });
  }

  return tokens;
}

// ─── Theme Constants Extractor ─────────────────────────────────────────

const HEX_COLOR_RE = /#([0-9a-fA-F]{3,8})\b/;
const RGB_COLOR_RE = /rgb[a]?\(\s*\d+/;
const HSL_COLOR_RE = /hsl[a]?\(\s*\d+/;

function inferColorCategory(name: string): string {
  const n = name.toLowerCase();
  if (/primary|brand|accent|main/.test(n)) return 'primary';
  if (/secondary|sub/.test(n)) return 'secondary';
  if (/success|error|warning|info|danger|semantic/.test(n)) return 'semantic';
  if (/neutral|gray|grey|slate|stone|zinc/.test(n)) return 'neutral';
  if (/bg|background|surface|base/.test(n)) return 'background';
  if (/text|fg|foreground|content/.test(n)) return 'text';
  if (/border|outline|ring|divider/.test(n)) return 'border';
  if (/hover|active|focus|disabled/.test(n)) return 'state';
  return 'other';
}

function isColorValue(value: string): boolean {
  const v = value.trim();
  return HEX_COLOR_RE.test(v) || RGB_COLOR_RE.test(v) || HSL_COLOR_RE.test(v);
}

function isSpacingValue(value: string): boolean {
  return /^-?\d+(\.\d+)?(px|rem|em|vh|vw|%)$/.test(value.trim());
}

function isRadiusValue(value: string): boolean {
  return /^-?\d+(\.\d+)?(px|rem|em|%)$/.test(value.trim()) || value.trim() === '9999px';
}

function extractConstantObject(content: string, filePath: string): Partial<DesignTokens> {
  const result: Partial<DesignTokens> = {};
  const colors: DesignColor[] = [];
  const spacing: DesignSpacing[] = [];
  const typography: DesignTypography[] = [];
  const borderRadius: DesignBorderRadius[] = [];
  const shadows: DesignShadow[] = [];

  // Match theme/token/color/style constant objects
  // Looks for: `const colors = {`, `const theme = {`, etc.
  const objectPatterns = [
    /(?:export\s+)?(?:const|let|var)\s+(?:colors|color|theme|tokens|designTokens|palette|styles|designSystem)\s*[:=]\s*\{([\s\S]*?)\};?(?=\s*\n\s*(?:export|const|let|var|\/\/|\/\*|$))/gi,
  ];

  for (const pattern of objectPatterns) {
    let match: RegExpExecArray | null;
    while ((match = pattern.exec(content)) !== null) {
      const block = match[1];

      if (match[0].toLowerCase().includes('color') || match[0].toLowerCase().includes('theme') || match[0].toLowerCase().includes('palette')) {
        // Extract key-value pairs that look like colors
        const kvMatches = block.matchAll(/(\w[\w-]*)\s*:\s*['"]([^'"]+)['"]/g);
        for (const kv of kvMatches) {
          if (isColorValue(kv[2])) {
            colors.push({
              name: kv[1],
              value: kv[2],
              source: filePath,
              category: inferColorCategory(kv[1]),
            });
          } else if (isSpacingValue(kv[2])) {
            spacing.push({ name: kv[1], value: kv[2], source: filePath });
          }
        }

        // Unquoted hex values
        const hexMatches = block.matchAll(/(\w[\w-]*)\s*:\s*(#[0-9a-fA-F]{3,8})\b/g);
        for (const kv of hexMatches) {
          if (!colors.some((c) => c.name === kv[1])) {
            colors.push({
              name: kv[1],
              value: kv[2],
              source: filePath,
              category: inferColorCategory(kv[1]),
            });
          }
        }

        // RGB/HSL function values
        const funcMatches = block.matchAll(/(\w[\w-]*)\s*:\s*(rgba?|hsla?)\(([^)]+)\)/gi);
        for (const kv of funcMatches) {
          colors.push({
            name: kv[1],
            value: `${kv[2]}(${kv[3]})`,
            source: filePath,
            category: inferColorCategory(kv[1]),
          });
        }
      }

      // Font family detection
      const fontMatch = block.match(/(?:fontFamily|font)\s*:\s*['"]([^'"]+)['"]/);
      if (fontMatch) {
        typography.push({ fontFamily: fontMatch[1], source: filePath });
      }
    }
  }

  // Match individual exported color constants: `export const RED = '#ff0000'`
  const singleColorPattern = /(?:export\s+)?(?:const|let|var)\s+(\w[\w-]*)\s*[:=]\s*(['"](#[0-9a-fA-F]{3,8})['"]|rgba?\([^)]+\)|hsla?\([^)]+\))/g;
  const singleColors = content.matchAll(singleColorPattern);
  for (const scMatch of singleColors) {
    const val = scMatch[2].replace(/['"]/g, '');
    if (!colors.some((c) => c.name === scMatch[1] && c.value === val)) {
      colors.push({
        name: scMatch[1],
        value: val,
        source: filePath,
        category: inferColorCategory(scMatch[1]),
      });
    }
  }

  if (colors.length) result.colors = colors;
  if (spacing.length) result.spacing = spacing;
  if (typography.length) result.typography = typography;
  if (borderRadius.length) result.borderRadius = borderRadius;
  if (shadows.length) result.shadows = shadows;

  return result;
}

// ─── Tailwind Config Detector ─────────────────────────────────────────

function extractTailwindConfig(filePath: string): Partial<DesignTokens> | null {
  const content = fs.readFileSync(filePath, 'utf-8');
  const result: Partial<DesignTokens> = { hasTailwind: true };
  const colors: DesignColor[] = [];
  const spacing: DesignSpacing[] = [];

  // Extract colors from theme.extend.colors or theme.colors
  const colorSectionMatch = content.match(/(?:colors|color)\s*:\s*\{([\s\S]*?)\}(?=\s*[,}]|\s*\/\/|\s*\/\*)/);
  if (colorSectionMatch) {
    const block = colorSectionMatch[1];
    const hexMatches = block.matchAll(/(\w[\w-]*)\s*:\s*['"]?(#[0-9a-fA-F]{3,8})['"]?/g);
    for (const kv of hexMatches) {
      colors.push({
        name: kv[1],
        value: kv[2],
        source: filePath,
        category: inferColorCategory(kv[1]),
      });
    }
  }

  if (colors.length) result.colors = colors;
  if (spacing.length) result.spacing = spacing;

  return result;
}

// ─── Main ──────────────────────────────────────────────────────────────

export function extractDesignTokens(projectDir: string, projectName: string): DesignTokens {
  const merged: DesignTokens = {
    projectName,
    colors: [],
    typography: [],
    spacing: [],
    borderRadius: [],
    shadows: [],
    hasTailwind: false,
  };

  // 1. Scan CSS files
  const cssFiles = globSync('**/*.css', {
    cwd: projectDir,
    ignore: ['node_modules/**', 'dist/**', '.git/**'],
    absolute: true,
  });

  for (const cssFile of cssFiles) {
    const content = fs.readFileSync(cssFile, 'utf-8');
    const cssTokens = extractCSSVariables(content, cssFile);
    mergeTokens(merged, cssTokens);
  }

  // 2. Scan Tailwind config
  const tailwindFiles = globSync('**/tailwind.config.{js,ts,mjs,mts}', {
    cwd: projectDir,
    ignore: ['node_modules/**', 'dist/**', '.git/**'],
    absolute: true,
  });

  for (const twFile of tailwindFiles) {
    merged.hasTailwind = true;
    const twTokens = extractTailwindConfig(twFile);
    if (twTokens) mergePartialTokens(merged, twTokens);
  }

  // 3. Scan TS/TSX source files for theme/color constants
  const tsFiles = globSync('src/**/*.{ts,tsx}', {
    cwd: projectDir,
    ignore: ['node_modules/**', 'dist/**', '.git/**', '**/*.test.*', '**/*.spec.*'],
    absolute: true,
  });

  for (const tsFile of tsFiles) {
    const content = fs.readFileSync(tsFile, 'utf-8');
    const constTokens = extractConstantObject(content, tsFile);
    mergePartialTokens(merged, constTokens);
  }

  // Deduplicate
  merged.colors = dedupeColors(merged.colors);
  merged.spacing = dedupeByName(merged.spacing);
  merged.borderRadius = dedupeByName(merged.borderRadius);
  merged.shadows = dedupeByName(merged.shadows);

  return merged;
}

// ─── Merging Helpers ──────────────────────────────────────────────────

function mergeTokens(target: DesignTokens, source: DesignTokens): void {
  target.colors.push(...source.colors);
  target.typography.push(...source.typography);
  target.spacing.push(...source.spacing);
  target.borderRadius.push(...source.borderRadius);
  target.shadows.push(...source.shadows);
  if (source.hasTailwind) target.hasTailwind = true;
}

function mergePartialTokens(target: DesignTokens, source: Partial<DesignTokens>): void {
  if (source.colors) target.colors.push(...source.colors);
  if (source.typography) target.typography.push(...source.typography);
  if (source.spacing) target.spacing.push(...source.spacing);
  if (source.borderRadius) target.borderRadius.push(...source.borderRadius);
  if (source.shadows) target.shadows.push(...source.shadows);
  if (source.hasTailwind) target.hasTailwind = true;
}

function dedupeColors(arr: DesignColor[]): DesignColor[] {
  const seen = new Set<string>();
  return arr.filter((c) => {
    const key = `${c.name}:${c.value}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function dedupeByName<T extends { name: string }>(arr: T[]): T[] {
  const seen = new Set<string>();
  return arr.filter((c) => {
    if (seen.has(c.name)) return false;
    seen.add(c.name);
    return true;
  });
}
