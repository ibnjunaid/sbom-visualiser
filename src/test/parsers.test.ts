import { describe, it, expect } from 'vitest';
import { CycloneDXJSONParser } from '../parsers/cyclonedx-json';
import { SPDXJSONParser } from '../parsers/spdx-json';
import { SPDX3JSONParser } from '../parsers/spdx3-json';

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

describe('SPDX3JSONParser', () => {
  const parser = new SPDX3JSONParser();

  it('should parse complex SPDX 3.0 JSON-LD with prefixed types, array targets, and vulnerabilities', () => {
    const sample = {
      "@context": "https://spdx.org/rdf/3.0.1/spdx-context.jsonld",
      "@graph": [
        {
          "type": "CreationInfo",
          "@id": "https://syself.com/spdx/syself-node-image-hetzner-apalla-1-36-815d5c2c-dirty-6bd22fcd521cc65a#creationInfo",
          "specVersion": "3.0.1",
          "created": "2026-07-17T11:11:42Z",
          "createdBy": [
            "https://syself.com/spdx/syself-node-image-hetzner-apalla-1-36-815d5c2c-dirty-6bd22fcd521cc65a#agent-syself"
          ],
          "createdUsing": [
            "https://syself.com/spdx/syself-node-image-hetzner-apalla-1-36-815d5c2c-dirty-6bd22fcd521cc65a#tool-kaas"
          ]
        },
        {
          "type": "Tool",
          "spdxId": "https://syself.com/spdx/syself-node-image-hetzner-apalla-1-36-815d5c2c-dirty-6bd22fcd521cc65a#tool-kaas",
          "creationInfo": "https://syself.com/spdx/syself-node-image-hetzner-apalla-1-36-815d5c2c-dirty-6bd22fcd521cc65a#creationInfo",
          "name": "kaas"
        },
        {
          "type": "SpdxDocument",
          "spdxId": "https://syself.com/spdx/syself-node-image-hetzner-apalla-1-36-815d5c2c-dirty-6bd22fcd521cc65a#document",
          "creationInfo": "https://syself.com/spdx/syself-node-image-hetzner-apalla-1-36-815d5c2c-dirty-6bd22fcd521cc65a#creationInfo",
          "name": "syself-node-image-hetzner-apalla-1-36-815d5c2c-dirty",
          "profileConformance": ["core", "security", "software"],
          "rootElement": [
            "https://syself.com/spdx/syself-node-image-hetzner-apalla-1-36-815d5c2c-dirty-6bd22fcd521cc65a#Package-node-image"
          ],
          "element": [
            "https://syself.com/spdx/syself-node-image-hetzner-apalla-1-36-815d5c2c-dirty-6bd22fcd521cc65a#Package-node-image",
            "https://syself.com/spdx/syself-node-image-hetzner-apalla-1-36-815d5c2c-dirty-6bd22fcd521cc65a#Package-0-kernel",
            "https://syself.com/spdx/syself-node-image-hetzner-apalla-1-36-815d5c2c-dirty-6bd22fcd521cc65a#Package-6-glibc",
            "https://syself.com/spdx/syself-node-image-hetzner-apalla-1-36-815d5c2c-dirty-6bd22fcd521cc65a#Relationship-contains",
            "https://syself.com/spdx/syself-node-image-hetzner-apalla-1-36-815d5c2c-dirty-6bd22fcd521cc65a#Vulnerability-CVE-2026-5450",
            "https://syself.com/spdx/syself-node-image-hetzner-apalla-1-36-815d5c2c-dirty-6bd22fcd521cc65a#Rel-hasVuln-CVE-2026-5450-glibc"
          ]
        },
        {
          "type": "software_Package",
          "spdxId": "https://syself.com/spdx/syself-node-image-hetzner-apalla-1-36-815d5c2c-dirty-6bd22fcd521cc65a#Package-node-image",
          "creationInfo": "https://syself.com/spdx/syself-node-image-hetzner-apalla-1-36-815d5c2c-dirty-6bd22fcd521cc65a#creationInfo",
          "name": "syself-node-image-hetzner-apalla-1-36-815d5c2c-dirty",
          "software_packageVersion": "hetzner-apalla-1-36-815d5c2c-dirty",
          "software_primaryPurpose": "operatingSystem"
        },
        {
          "type": "software_Package",
          "spdxId": "https://syself.com/spdx/syself-node-image-hetzner-apalla-1-36-815d5c2c-dirty-6bd22fcd521cc65a#Package-0-kernel",
          "creationInfo": "https://syself.com/spdx/syself-node-image-hetzner-apalla-1-36-815d5c2c-dirty-6bd22fcd521cc65a#creationInfo",
          "name": "kernel",
          "software_packageVersion": "6.18.38",
          "software_primaryPurpose": "firmware",
          "externalIdentifier": [
            {
              "type": "ExternalIdentifier",
              "externalIdentifierType": "packageUrl",
              "identifier": "pkg:generic/linux@6.18.38"
            },
            {
              "type": "ExternalIdentifier",
              "externalIdentifierType": "cpe23",
              "identifier": "cpe:2.3:a:linux:linux_kernel:6.18.38:*:*:*:*:*:*:*"
            }
          ]
        },
        {
          "type": "software_Package",
          "spdxId": "https://syself.com/spdx/syself-node-image-hetzner-apalla-1-36-815d5c2c-dirty-6bd22fcd521cc65a#Package-6-glibc",
          "creationInfo": "https://syself.com/spdx/syself-node-image-hetzner-apalla-1-36-815d5c2c-dirty-6bd22fcd521cc65a#creationInfo",
          "name": "glibc",
          "software_packageVersion": "2.43",
          "software_primaryPurpose": "library",
          "externalIdentifier": [
            {
              "type": "ExternalIdentifier",
              "externalIdentifierType": "packageUrl",
              "identifier": "pkg:generic/glibc@2.43"
            }
          ]
        },
        {
          "type": "Relationship",
          "spdxId": "https://syself.com/spdx/syself-node-image-hetzner-apalla-1-36-815d5c2c-dirty-6bd22fcd521cc65a#Relationship-contains",
          "creationInfo": "https://syself.com/spdx/syself-node-image-hetzner-apalla-1-36-815d5c2c-dirty-6bd22fcd521cc65a#creationInfo",
          "relationshipType": "contains",
          "from": "https://syself.com/spdx/syself-node-image-hetzner-apalla-1-36-815d5c2c-dirty-6bd22fcd521cc65a#Package-node-image",
          "to": [
            "https://syself.com/spdx/syself-node-image-hetzner-apalla-1-36-815d5c2c-dirty-6bd22fcd521cc65a#Package-0-kernel",
            "https://syself.com/spdx/syself-node-image-hetzner-apalla-1-36-815d5c2c-dirty-6bd22fcd521cc65a#Package-6-glibc"
          ]
        },
        {
          "type": "security_Vulnerability",
          "spdxId": "https://syself.com/spdx/syself-node-image-hetzner-apalla-1-36-815d5c2c-dirty-6bd22fcd521cc65a#Vulnerability-CVE-2026-5450",
          "creationInfo": "https://syself.com/spdx/syself-node-image-hetzner-apalla-1-36-815d5c2c-dirty-6bd22fcd521cc65a#creationInfo",
          "name": "CVE-2026-5450",
          "externalIdentifier": [
            {
              "type": "ExternalIdentifier",
              "externalIdentifierType": "cve",
              "identifier": "CVE-2026-5450"
            }
          ]
        },
        {
          "type": "Relationship",
          "spdxId": "https://syself.com/spdx/syself-node-image-hetzner-apalla-1-36-815d5c2c-dirty-6bd22fcd521cc65a#Rel-hasVuln-CVE-2026-5450-glibc",
          "creationInfo": "https://syself.com/spdx/syself-node-image-hetzner-apalla-1-36-815d5c2c-dirty-6bd22fcd521cc65a#creationInfo",
          "relationshipType": "hasAssociatedVulnerability",
          "from": "https://syself.com/spdx/syself-node-image-hetzner-apalla-1-36-815d5c2c-dirty-6bd22fcd521cc65a#Package-6-glibc",
          "to": [
            "https://syself.com/spdx/syself-node-image-hetzner-apalla-1-36-815d5c2c-dirty-6bd22fcd521cc65a#Vulnerability-CVE-2026-5450"
          ]
        }
      ]
    };

    const content = JSON.stringify(sample);
    const result = parser.parse(content);

    expect(result.metadata.format).toBe('SPDX');
    expect(result.metadata.specVersion).toBe('3.0.1');
    expect(result.metadata.tool).toBe('kaas');
    expect(result.metadata.name).toBe('syself-node-image-hetzner-apalla-1-36-815d5c2c-dirty');

    expect(result.components).toHaveLength(3);

    const nodeImage = result.components.find(c => c.name.includes('syself-node-image'));
    expect(nodeImage).toBeDefined();
    expect(nodeImage?.type).toBe('operating-system');
    expect(nodeImage?.version).toBe('hetzner-apalla-1-36-815d5c2c-dirty');

    const kernel = result.components.find(c => c.name === 'kernel');
    expect(kernel).toBeDefined();
    expect(kernel?.type).toBe('firmware');
    expect(kernel?.version).toBe('6.18.38');
    expect(kernel?.purl).toBe('pkg:generic/linux@6.18.38');
    expect(kernel?.cpe).toBe('cpe:2.3:a:linux:linux_kernel:6.18.38:*:*:*:*:*:*:*');

    // Verify relationship targets array split
    const containsRels = result.relationships.filter(r => r.type === 'CONTAINS');
    expect(containsRels).toHaveLength(2);
    expect(containsRels.some(r => r.target.endsWith('Package-0-kernel'))).toBe(true);
    expect(containsRels.some(r => r.target.endsWith('Package-6-glibc'))).toBe(true);

    // Verify vulnerability mapping
    expect(result.vulnerabilities).toHaveLength(1);
    expect(result.vulnerabilities[0].id).toBe('CVE-2026-5450');
    expect(result.vulnerabilities[0].componentRef).toContain('Package-6-glibc');
  });
});
