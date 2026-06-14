export function generateCddConfig(dir: string): Record<string, unknown> {
  return {
    version: '0.1.0',
    sourceDir: 'src',
    docDir: 'docs',
    language: 'typescript',
    include: ['src/**/*.{ts,tsx,js,jsx,mjs,py,go,rs,java,kt,swift}'],
    exclude: [
      'tests/**',
      'test/**',
      'fixtures/**',
      '**/fixtures/**',
      '**/__tests__/**',
      '**/*.test.*',
      '**/*.spec.*',
    ],
    conventions: {
      modulePattern: '**/index.ts',
      annotationStyle: 'tsdoc',
    },
    generatedAt: new Date().toISOString(),
    projectRoot: dir,
  };
}
