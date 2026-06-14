const HEX_COLOR_RE = /#([0-9a-fA-F]{3,8})\b/;
const RGB_COLOR_RE = /rgb[a]?\(\s*\d+/;
const HSL_COLOR_RE = /hsl[a]?\(\s*\d+/;

export function inferColorCategory(name: string): string {
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

export function isColorValue(value: string): boolean {
  const v = value.trim();
  return HEX_COLOR_RE.test(v) || RGB_COLOR_RE.test(v) || HSL_COLOR_RE.test(v);
}

export function isSpacingValue(value: string): boolean {
  return /^-?\d+(\.\d+)?(px|rem|em|vh|vw|%)$/.test(value.trim());
}
