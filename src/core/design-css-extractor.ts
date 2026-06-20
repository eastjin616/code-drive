import type { DesignTokens } from './design-types.js';
import { inferColorCategory } from './design-token-utils.js';

export function extractCSSVariables(content: string, filePath: string): DesignTokens {
  const tokens: DesignTokens = {
    projectName: '',
    colors: [],
    typography: [],
    spacing: [],
    borderRadius: [],
    shadows: [],
    styleUsage: [],
    hasTailwind: false,
  };

  const colorMatches = content.matchAll(/--(?:color|clr|c)-([\w-]+)\s*:\s*([^;]+)/gi);
  for (const m of colorMatches) {
    tokens.colors.push({
      name: m[1].trim(),
      value: m[2].trim(),
      source: filePath,
      category: inferColorCategory(m[1]),
    });
  }

  const fontMatches = content.matchAll(/--(?:font-family|ff|font(?!-size))-([\w-]+)\s*:\s*([^;]+)/gi);
  for (const m of fontMatches) {
    tokens.typography.push({
      fontFamily: m[2].trim(),
      source: filePath,
    });
  }

  const sizeMatches = content.matchAll(/--(?:fs|font-size|text)-([\w-]+)\s*:\s*([^;]+)/gi);
  for (const m of sizeMatches) {
    if (!tokens.typography[0]) tokens.typography.push({ fontFamily: '', source: filePath });
    const typography = tokens.typography[0];
    if (!typography.sizes) typography.sizes = [];
    typography.sizes.push({ name: m[1].trim(), value: m[2].trim() });
  }

  const spacingMatches = content.matchAll(/--(?:spacing|space|gap)-([\w-]+)\s*:\s*([^;]+)/gi);
  for (const m of spacingMatches) {
    tokens.spacing.push({
      name: m[1].trim(),
      value: m[2].trim(),
      source: filePath,
    });
  }

  const radiusMatches = content.matchAll(/--(?:radius|rounded|border-radius)-([\w-]+)\s*:\s*([^;]+)/gi);
  for (const m of radiusMatches) {
    tokens.borderRadius.push({
      name: m[1].trim(),
      value: m[2].trim(),
      source: filePath,
    });
  }

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
