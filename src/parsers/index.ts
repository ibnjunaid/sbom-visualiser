import { CycloneDXJSONParser } from './cyclonedx-json';
import { CycloneDXXMLParser } from './cyclonedx-xml';
import { SPDXJSONParser } from './spdx-json';
import { SPDXTagValueParser } from './spdx-tagvalue';
import { SPDX3JSONParser } from './spdx3-json';
import { NormalizedSBOM } from '../models/sbom';
import { Parser, ParseError } from './types';

const parsers: Parser[] = [
  new CycloneDXJSONParser(),
  new CycloneDXXMLParser(),
  new SPDXJSONParser(),
  new SPDX3JSONParser(),
  new SPDXTagValueParser(),
];

export function parseSBOM(content: string, fileName: string): NormalizedSBOM {
  for (const parser of parsers) {
    if (parser.canParse(content, fileName)) {
      return parser.parse(content);
    }
  }
  throw new ParseError('Unsupported SBOM format or version');
}
