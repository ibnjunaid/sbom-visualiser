import { NormalizedSBOM, SBOMComponent, SBOMRelationship, RelationshipType } from '../models/sbom';
import { Parser, ParseError } from './types';
import * as yaml from 'js-yaml';

export class SPDXJSONParser implements Parser {
  canParse(content: string): boolean {
    try {
      const json = JSON.parse(content);
      return (json.spdxVersion?.startsWith('SPDX-2.') || json.spdxVersion?.startsWith('SPDX-3.')) && !json['@context'];
    } catch {
      try {
          const doc = yaml.load(content) as any;
          return doc && doc.spdxVersion?.startsWith('SPDX-2.');
      } catch {
          return false;
      }
    }
  }

  parse(content: string): NormalizedSBOM {
    let doc: any;
    try {
        if (content.trim().startsWith('{')) {
            doc = JSON.parse(content);
        } else {
            doc = yaml.load(content);
        }
    } catch (e: any) {
      throw new ParseError(`Invalid JSON/YAML: ${e.message}`);
    }

    if (doc.spdxVersion?.startsWith('SPDX-2.')) {
      return this.parseSPDX2(doc);
    } else {
        throw new ParseError('Unsupported SPDX version or format');
    }
  }

  private parseSPDX2(doc: any): NormalizedSBOM {
    const components: SBOMComponent[] = [];
    const relationships: SBOMRelationship[] = [];

    const metadata = {
      format: 'SPDX' as const,
      specVersion: doc.spdxVersion,
      name: doc.name || 'Unnamed SPDX Document',
      tool: this.extractTools(doc.creationInfo?.creators),
      timestamp: doc.creationInfo?.created,
      componentCount: 0,
    };

    if (Array.isArray(doc.packages)) {
      for (const p of doc.packages) {
        components.push(this.mapPackage(p));
      }
    }

    if (Array.isArray(doc.files)) {
        for (const f of doc.files) {
            components.push(this.mapFile(f));
        }
    }

    metadata.componentCount = components.length;

    if (Array.isArray(doc.relationships)) {
      for (const rel of doc.relationships) {
        relationships.push({
          source: rel.spdxElementId,
          target: rel.relatedSpdxElement,
          type: this.mapRelationshipType(rel.relationshipType),
        });
      }
    }

    const vulnerabilities: any[] = [];
    for (const comp of components) {
        const securityRefs = comp.externalRefs?.filter(r => r.type.includes('security') || r.type.includes('advisory'));
        for (const ref of securityRefs || []) {
            vulnerabilities.push({
                id: ref.url.split('/').pop() || 'Unknown',
                source: ref.type,
                description: ref.comment || `Security reference: ${ref.url}`,
                componentRef: comp.id,
                raw: ref
            });
        }
    }

    return { metadata, components, relationships, vulnerabilities };
  }

  private mapPackage(p: any): SBOMComponent {
    return {
      id: p.SPDXID,
      bomRef: p.SPDXID,
      name: p.name,
      version: p.versionInfo,
      type: 'library',
      purl: this.findExternalRef(p.externalRefs, ['purl', 'PACKAGE-MANAGER']),
      cpe: this.findExternalRef(p.externalRefs, ['cpe23Type', 'cpe22Type', 'SECURITY']),
      supplier: this.extractSupplier(p.supplier),
      author: this.extractSupplier(p.originator),
      description: p.description || p.summary,
      licenses: {
        declared: p.licenseDeclared ? [{ expression: p.licenseDeclared }] : [],
        concluded: p.licenseConcluded ? [{ expression: p.licenseConcluded }] : [],
      },
      copyright: p.copyrightText,
      externalRefs: Array.isArray(p.externalRefs)
        ? p.externalRefs.map((r: any) => ({ type: r.referenceType, url: r.referenceLocator, comment: r.comment }))
        : [],
      raw: p
    };
  }

  private mapFile(f: any): SBOMComponent {
      return {
          id: f.SPDXID,
          bomRef: f.SPDXID,
          name: f.fileName,
          type: 'file',
          licenses: {
              concluded: f.licenseConcluded ? [{ expression: f.licenseConcluded }] : [],
          },
          copyright: f.copyrightText,
          externalRefs: [],
          raw: f
      };
  }

  private mapRelationshipType(type: string): RelationshipType {
    switch (type) {
      case 'DEPENDS_ON': return 'DEPENDS_ON';
      case 'DESCRIBES': return 'DESCRIBES';
      case 'CONTAINS': return 'CONTAINS';
      case 'GENERATED_FROM': return 'GENERATED_FROM';
      default: return 'OTHER';
    }
  }

  private findExternalRef(refs: any[], types: string[]): string | undefined {
    if (!Array.isArray(refs)) return undefined;
    return refs.find(r => types.includes(r.referenceType) || types.includes(r.referenceCategory))?.referenceLocator;
  }

  private extractSupplier(supplier: string): string | undefined {
      if (!supplier) return undefined;
      return supplier.replace(/^(Organization|Person):\s*/, '');
  }

  private extractTools(creators: string[]): string | undefined {
      if (!Array.isArray(creators)) return undefined;
      return creators.filter(c => c.startsWith('Tool:')).map(c => c.replace('Tool: ', '')).join(', ');
  }
}
