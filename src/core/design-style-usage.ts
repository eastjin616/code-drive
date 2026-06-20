import type { DesignStyleCategory, DesignStyleUsage } from './design-types.js';

const COLOR_PROPERTIES = new Set([
  'color',
  'background',
  'background-color',
  'border-color',
  'outline-color',
  'fill',
  'stroke',
]);

const TYPOGRAPHY_PROPERTIES = new Set([
  'font',
  'font-family',
  'font-size',
  'font-weight',
  'line-height',
  'letter-spacing',
  'text-transform',
]);

const SPACING_PROPERTIES = new Set([
  'margin',
  'margin-top',
  'margin-right',
  'margin-bottom',
  'margin-left',
  'padding',
  'padding-top',
  'padding-right',
  'padding-bottom',
  'padding-left',
  'gap',
  'row-gap',
  'column-gap',
]);

const RADIUS_PROPERTIES = new Set([
  'border-radius',
  'border-top-left-radius',
  'border-top-right-radius',
  'border-bottom-right-radius',
  'border-bottom-left-radius',
]);

const BORDER_PROPERTIES = new Set([
  'border',
  'border-top',
  'border-right',
  'border-bottom',
  'border-left',
  'outline',
]);

const LAYOUT_PROPERTIES = new Set([
  'display',
  'position',
  'width',
  'height',
  'max-width',
  'min-width',
  'max-height',
  'min-height',
  'grid-template-columns',
  'grid-template-rows',
  'align-items',
  'justify-content',
]);

function stripCssComments(content: string): string {
  return content.replace(/\/\*[\s\S]*?\*\//g, '');
}

function categorizeProperty(name: string): DesignStyleCategory | null {
  const normalized = name.trim().toLowerCase();
  if (normalized.startsWith('--')) return null;
  if (COLOR_PROPERTIES.has(normalized)) return 'color';
  if (TYPOGRAPHY_PROPERTIES.has(normalized)) return 'typography';
  if (SPACING_PROPERTIES.has(normalized)) return 'spacing';
  if (RADIUS_PROPERTIES.has(normalized)) return 'radius';
  if (normalized === 'box-shadow' || normalized === 'text-shadow') return 'shadow';
  if (BORDER_PROPERTIES.has(normalized)) return 'border';
  if (LAYOUT_PROPERTIES.has(normalized)) return 'layout';
  return null;
}

function shouldSkipSelector(selector: string): boolean {
  const normalized = selector.trim();
  return !normalized
    || normalized.startsWith('@')
    || normalized === 'from'
    || normalized === 'to'
    || /^\d+%$/.test(normalized);
}

export function extractStyleUsage(content: string, filePath: string): DesignStyleUsage[] {
  const css = stripCssComments(content);
  const usages: DesignStyleUsage[] = [];
  const ruleMatches = css.matchAll(/([^{}]+)\{([^{}]+)\}/g);

  for (const rule of ruleMatches) {
    const selector = rule[1].trim().replace(/\s+/g, ' ');
    if (shouldSkipSelector(selector)) continue;

    const properties = rule[2]
      .split(';')
      .map((declaration) => declaration.trim())
      .flatMap((declaration) => {
        const separator = declaration.indexOf(':');
        if (separator <= 0) return [];

        const name = declaration.slice(0, separator).trim();
        const value = declaration.slice(separator + 1).trim();
        const category = categorizeProperty(name);
        if (!category || !value) return [];

        return [{ name, value, category }];
      });

    if (properties.length > 0) {
      usages.push({ selector, source: filePath, properties });
    }
  }

  return usages;
}
