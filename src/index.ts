/**
 * code-drive — Code-Driven Development CLI
 *
 * Code is the single source of truth.
 * Specs, docs, and architecture are derived from code, not the other way around.
 */

export { runCLI } from './cli.js';
export { initCommand } from './commands/init.js';
export { docgenCommand } from './commands/docgen.js';
export { specCommand } from './commands/spec.js';
