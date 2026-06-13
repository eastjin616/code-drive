import { add } from './index.js';

/** A calculator class with multiplication support */
export class Calculator {
  factor: number;

  constructor(factor: number) {
    this.factor = factor;
  }

  multiply(a: number, b: number): number {
    return a * b;
  }
}

/** User interface for the application */
export interface User {
  name: string;
  age: number;
  email?: string;
}

// HACK: fetchData uses mock endpoint for now
export async function fetchData(url: string): Promise<unknown> {
  const result = await fetch(url);
  return result.json();
}
