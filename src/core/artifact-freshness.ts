import * as fs from 'node:fs';
import * as path from 'node:path';

export interface ArtifactTarget {
  readonly label: string;
  readonly path: string;
}

export type ArtifactFreshnessStatus = 'missing' | 'fresh' | 'stale';

export interface ArtifactFreshness {
  readonly label: string;
  readonly path: string;
  readonly status: ArtifactFreshnessStatus;
  readonly sourceCount: number;
  readonly artifactMtimeMs?: number;
  readonly newestSourceMtimeMs?: number;
}

function newestSourceMtime(projectDir: string, sourceFiles: readonly string[]): number | undefined {
  let newest: number | undefined;

  for (const sourceFile of sourceFiles) {
    const fullPath = path.join(projectDir, sourceFile);
    if (!fs.existsSync(fullPath)) continue;

    const mtimeMs = fs.statSync(fullPath).mtimeMs;
    newest = newest === undefined ? mtimeMs : Math.max(newest, mtimeMs);
  }

  return newest;
}

export function assessArtifactFreshness(
  projectDir: string,
  artifacts: readonly ArtifactTarget[],
  sourceFiles: readonly string[],
): ArtifactFreshness[] {
  const newestSourceMtimeMs = newestSourceMtime(projectDir, sourceFiles);

  return artifacts.map((artifact) => {
    if (!fs.existsSync(artifact.path)) {
      return {
        label: artifact.label,
        path: artifact.path,
        status: 'missing',
        sourceCount: sourceFiles.length,
      };
    }

    const artifactMtimeMs = fs.statSync(artifact.path).mtimeMs;
    const isStale = newestSourceMtimeMs !== undefined && artifactMtimeMs < newestSourceMtimeMs;

    return {
      label: artifact.label,
      path: artifact.path,
      status: isStale ? 'stale' : 'fresh',
      sourceCount: sourceFiles.length,
      artifactMtimeMs,
      newestSourceMtimeMs,
    };
  });
}
