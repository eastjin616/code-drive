export interface ModuleGroup {
  readonly name: string;
  readonly files: readonly string[];
}

export function groupByModule(sourceFiles: readonly string[]): ModuleGroup[] {
  const map = new Map<string, string[]>();
  for (const file of sourceFiles) {
    const parts = file.split(/[/\\]/);
    const moduleName = parts.length > 1 ? parts[0] : '(root)';
    if (!map.has(moduleName)) map.set(moduleName, []);
    const files = map.get(moduleName);
    if (files) files.push(file);
  }
  return Array.from(map.entries())
    .map(([name, files]) => ({ name, files }))
    .sort((a, b) => a.name.localeCompare(b.name));
}
