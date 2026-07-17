import { NormalizedSBOM, SBOMComponent, SBOMRelationship } from '../models/sbom';
import { Parser, ParseError } from './types';

import { ComponentType } from '../models/sbom';

export class SPDX3JSONParser implements Parser {
  canParse(content: string): boolean {
    try {
      const json = JSON.parse(content);
      return (
        json['@context']?.includes('spdx') ||
        json['spdxVersion']?.startsWith('3.') ||
        (json['@graph'] && json['@graph'].some((e: any) => e.specVersion?.startsWith('3.')))
      );
    } catch {
      return false;
    }
  }

  parse(content: string): NormalizedSBOM {
    let json: any;
    try {
      json = JSON.parse(content);
    } catch (e: any) {
      throw new ParseError(`Invalid JSON: ${e.message}`);
    }

    const elements = json['@graph'] || (Array.isArray(json) ? json : [json]);

    const components: SBOMComponent[] = [];
    const relationships: SBOMRelationship[] = [];
    const rawVulnerabilities: any[] = [];

    // Helper map of ID -> Element for resolution
    const elementMap: Record<string, any> = {};
    for (const e of elements) {
      const id = e['@id'] || e.spdxId;
      if (id) {
        elementMap[id] = e;
      }
    }

    const docElement = elements.find((e: any) => {
      const type = e.type || e['@type'];
      return type === 'SpdxDocument' || type?.endsWith('SpdxDocument');
    }) || elements[0];

    // Find CreationInfo
    let creationInfo = docElement?.creationInfo;
    if (typeof creationInfo === 'string' && elementMap[creationInfo]) {
      creationInfo = elementMap[creationInfo];
    } else if (!creationInfo) {
      creationInfo = elements.find((e: any) => {
        const type = e.type || e['@type'];
        return type === 'CreationInfo' || type?.endsWith('CreationInfo');
      });
    }

    // Resolve creation tools
    let toolsList: string[] = [];
    if (creationInfo?.createdUsing) {
      const creators = Array.isArray(creationInfo.createdUsing) ? creationInfo.createdUsing : [creationInfo.createdUsing];
      for (const cr of creators) {
        if (typeof cr === 'string') {
          const resolved = elementMap[cr];
          if (resolved) {
            toolsList.push(resolved.name || resolved['@id'] || resolved.spdxId);
          } else {
            toolsList.push(cr.split('#').pop() || cr);
          }
        } else {
          toolsList.push(cr.name || cr['@id'] || cr.spdxId);
        }
      }
    }

    const metadata = {
        format: 'SPDX' as const,
        specVersion: json.spdxVersion || creationInfo?.specVersion || '3.0',
        name: docElement?.name || 'Unnamed SPDX 3.0 Document',
        tool: toolsList.length > 0 ? toolsList.join(', ') : undefined,
        timestamp: creationInfo?.created,
        componentCount: 0
    };

    for (const e of elements) {
        const rawType = e.type || e['@type'];
        if (!rawType) continue;

        // Strip prefixes if present (e.g. software_Package -> Package)
        const type = rawType.split('_').pop() || rawType;

        if (type === 'Package' || type === 'Component' || type === 'SoftwareComponent') {
            // Extract external identifiers
            let purl: string | undefined;
            let cpe: string | undefined;
            if (Array.isArray(e.externalIdentifier)) {
              for (const ext of e.externalIdentifier) {
                const idType = ext.externalIdentifierType || ext.type;
                if (idType === 'packageUrl' || idType === 'purl') {
                  purl = ext.identifier;
                } else if (idType === 'cpe23' || idType === 'cpe22' || idType === 'cpe') {
                  cpe = ext.identifier;
                }
              }
            }

            // Extract license info if available
            const licensesList: any[] = [];
            if (e.licenseDeclared) {
              licensesList.push({ expression: e.licenseDeclared });
            } else if (e.licenseConcluded) {
              licensesList.push({ expression: e.licenseConcluded });
            }

            components.push({
                id: e['@id'] || e.spdxId,
                bomRef: e['@id'] || e.spdxId,
                name: e.name || (e['@id'] || e.spdxId || '').split('#').pop() || 'Unnamed Element',
                version: e.software_packageVersion || e.packageVersion || e.version,
                type: this.mapPurposeToType(e.software_primaryPurpose),
                purl,
                cpe,
                supplier: e.supplier,
                licenses: {
                    declared: licensesList
                },
                raw: e,
                externalRefs: []
            });
        } else if (type === 'Relationship') {
            const targets = Array.isArray(e.to) ? e.to : [e.to];
            for (const target of targets) {
              if (e.from && target) {
                relationships.push({
                    source: e.from,
                    target: target,
                    type: this.mapRelationshipType(e.relationshipType)
                });
              }
            }
        } else if (type === 'Vulnerability' || type === 'security_Vulnerability') {
            rawVulnerabilities.push(e);
        }
    }

    metadata.componentCount = components.length;

    // Process vulnerabilities based on "hasAssociatedVulnerability" relationships
    const vulnerabilities: any[] = [];
    for (const rel of relationships) {
      if (rel.type === 'OTHER') {
        const matchingRelElement = elements.find((e: any) => {
          const type = e.type || e['@type'];
          return (type === 'Relationship' || type?.endsWith('Relationship')) &&
                 e.from === rel.source &&
                 (Array.isArray(e.to) ? e.to.includes(rel.target) : e.to === rel.target) &&
                 e.relationshipType?.includes('hasAssociatedVulnerability');
        });

        if (matchingRelElement) {
          // Relates a component (source) to a vulnerability (target)
          const vulnElement = elementMap[rel.target];
          if (vulnElement) {
            vulnerabilities.push({
              id: vulnElement.name || vulnElement.spdxId?.split('#').pop() || 'Unknown',
              source: 'SPDX-3.0 Embedded',
              description: vulnElement.summary || vulnElement.description || `Associated vulnerability: ${vulnElement.name || vulnElement['@id']}`,
              componentRef: rel.source,
              raw: vulnElement
            });
          }
        }
      }
    }

    return { metadata, components, relationships, vulnerabilities };
  }

  private mapPurposeToType(purpose: string): ComponentType {
    if (!purpose) return 'library';
    const p = purpose.toLowerCase();
    if (p.includes('application')) return 'application';
    if (p.includes('framework')) return 'framework';
    if (p.includes('library')) return 'library';
    if (p.includes('container')) return 'container';
    if (p.includes('operatingsystem')) return 'operating-system';
    if (p.includes('device')) return 'device';
    if (p.includes('firmware')) return 'firmware';
    if (p.includes('file')) return 'file';
    return 'other';
  }

  private mapRelationshipType(type: string): any {
      if (!type) return 'OTHER';
      if (type.includes('dependsOn')) return 'DEPENDS_ON';
      if (type.includes('describes')) return 'DESCRIBES';
      if (type.includes('contains')) return 'CONTAINS';
      if (type.includes('generatedFrom')) return 'GENERATED_FROM';
      return 'OTHER';
  }
}
