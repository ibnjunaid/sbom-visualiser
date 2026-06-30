import { NormalizedSBOM, SBOMComponent, SBOMRelationship } from '../models/sbom';
import { Parser, ParseError } from './types';

export class SPDX3JSONParser implements Parser {
  canParse(content: string): boolean {
    try {
      const json = JSON.parse(content);
      return json['@context']?.includes('spdx') || json['spdxVersion']?.startsWith('3.');
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
    const vulnerabilities: any[] = [];

    const docElement = elements.find((e: any) => e.type === 'SpdxDocument' || e['@type'] === 'SpdxDocument') || elements[0];
    const creationInfo = docElement?.creationInfo || elements.find((e: any) => e.created)?.creationInfo;

    const metadata = {
        format: 'SPDX' as const,
        specVersion: json.spdxVersion || '3.0',
        name: docElement?.name || 'Unnamed SPDX 3.0 Document',
        tool: creationInfo?.createdUsing?.join(', '),
        timestamp: creationInfo?.created,
        componentCount: 0
    };

    for (const e of elements) {
        const type = e.type || e['@type'];
        if (type === 'Package' || type === 'Component' || type === 'SoftwareComponent') {
            components.push({
                id: e['@id'] || e.spdxId,
                name: e.name,
                version: e.packageVersion || e.version,
                type: 'library',
                purl: e.externalIdentifier?.find((id: any) => id.identifierType === 'purl')?.identifier,
                supplier: e.supplier,
                licenses: {
                    declared: e.licenseDeclared ? [{ expression: e.licenseDeclared }] : []
                },
                raw: e,
                externalRefs: []
            });
        } else if (type === 'Relationship') {
            relationships.push({
                source: e.from,
                target: e.to,
                type: this.mapRelationshipType(e.relationshipType)
            });
        }
    }

    metadata.componentCount = components.length;

    return { metadata, components, relationships, vulnerabilities };
  }

  private mapRelationshipType(type: string): any {
      if (type?.includes('dependsOn')) return 'DEPENDS_ON';
      if (type?.includes('describes')) return 'DESCRIBES';
      if (type?.includes('contains')) return 'CONTAINS';
      return 'OTHER';
  }
}
