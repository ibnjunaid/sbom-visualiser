import { describe, it, expect } from 'vitest';
import { CycloneDXJSONParser } from '../parsers/cyclonedx-json';
import { SPDXJSONParser } from '../parsers/spdx-json';

describe('CycloneDXJSONParser', () => {
  const parser = new CycloneDXJSONParser();

  it('should parse valid CycloneDX 1.5 JSON', () => {
    const content = JSON.stringify({
      bomFormat: 'CycloneDX',
      specVersion: '1.5',
      components: [
        { name: 'test-pkg', version: '1.0.0', type: 'library' }
      ]
    });
    const result = parser.parse(content);
    expect(result.metadata.format).toBe('CycloneDX');
    expect(result.components).toHaveLength(1);
    expect(result.components[0].name).toBe('test-pkg');
  });

  it('should throw error for invalid JSON', () => {
    expect(() => parser.parse('invalid')).toThrow();
  });
});

describe('SPDXJSONParser', () => {
  const parser = new SPDXJSONParser();

  it('should parse valid SPDX 2.3 JSON', () => {
    const content = JSON.stringify({
      spdxVersion: 'SPDX-2.3',
      name: 'Test SPDX',
      packages: [
        { name: 'pkg-a', SPDXID: 'SPDXRef-A', versionInfo: '1.2.3' }
      ]
    });
    const result = parser.parse(content);
    expect(result.metadata.format).toBe('SPDX');
    expect(result.components).toHaveLength(1);
    expect(result.components[0].name).toBe('pkg-a');
  });
});
