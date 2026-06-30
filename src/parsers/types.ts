import { NormalizedSBOM } from '../models/sbom';

export interface Parser {
  canParse(content: string, fileName: string): boolean;
  parse(content: string): NormalizedSBOM;
}

export class ParseError extends Error {
  constructor(message: string, public line?: number, public field?: string) {
    super(message);
    this.name = 'ParseError';
  }
}
