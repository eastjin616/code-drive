/**
 * Adds two numbers together
 * @param a First number
 * @param b Second number
 */
export function add(a: number, b: number): number {
  return a + b;
}

/** Subtracts b from a */
export function subtract(a: number, b: number) {
  return a - b;
}

// TODO: add multiplication function
// FIXME: handle negative numbers in subtract

/**
 * Default greeting function
 */
export default function greet(name: string): string {
  return `Hello, ${name}!`;
}
