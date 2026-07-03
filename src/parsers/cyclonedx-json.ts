import { NormalizedSBOM, SBOMComponent, SBOMRelationship, SBOMVulnerability, ComponentType } from '../models/sbom';
import { Parser, ParseError } from './types';

export class CycloneDXJSONParser implements Parser {
  canParse(content: string): boolean {
    try {
      const json = JSON.parse(content);
      return json.bomFormat === 'CycloneDX';
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

    if (json.bomFormat !== 'CycloneDX') {
      throw new ParseError('Not a CycloneDX SBOM');
    }

    const components: SBOMComponent[] = [];
    const relationships: SBOMRelationship[] = [];
    const vulnerabilities: SBOMVulnerability[] = [];

    const metadata = {
      format: 'CycloneDX' as const,
      specVersion: json.specVersion || 'unknown',
      name: json.metadata?.component?.name || 'Unnamed SBOM',
      tool: this.extractTool(json.metadata?.tools),
      timestamp: json.metadata?.timestamp,
      componentCount: 0,
    };

    if (json.metadata?.component) {
      components.push(this.mapComponent(json.metadata.component));
    }

    if (Array.isArray(json.components)) {
      for (const c of json.components) {
        components.push(this.mapComponent(c));
      }
    }

    metadata.componentCount = components.length;

    if (Array.isArray(json.dependencies)) {
      for (const dep of json.dependencies) {
        if (Array.isArray(dep.dependsOn)) {
          for (const targetRef of dep.dependsOn) {
            relationships.push({
              source: dep.ref,
              target: targetRef,
              type: 'DEPENDS_ON',
            });
          }
        }
      }
    }

    if (Array.isArray(json.vulnerabilities)) {
      for (const v of json.vulnerabilities) {
        if (Array.isArray(v.affects)) {
          for (const affect of v.affects) {
            vulnerabilities.push({
              id: v.id,
              source: v.source?.name,
              description: v.description,
              severity: this.mapSeverity(v.ratings?.[0]?.severity),
              cvssScore: v.ratings?.[0]?.score,
              componentRef: affect.ref,
              raw: v
            });
          }
        }
      }
    }

    return { metadata, components, relationships, vulnerabilities };
  }

  private mapComponent(c: any): SBOMComponent {
    return {
      id: c['bom-ref'] || c.purl || c.cpe || `${c.name}@${c.version}`,
      bomRef: c['bom-ref'],
      name: c.name,
      version: c.version,
      type: this.mapType(c.type),
      purl: c.purl,
      cpe: c.cpe,
      supplier: c.supplier?.name,
      author: c.author,
      publisher: c.publisher,
      description: c.description,
      licenses: {
        declared: this.mapLicenses(c.licenses)
      },
      copyright: c.copyright,
      externalRefs: Array.isArray(c.externalReferences)
        ? c.externalReferences.map((r: any) => ({ type: r.type, url: r.url, comment: r.comment }))
        : [],
      properties: Array.isArray(c.properties)
        ? c.properties.reduce((acc: any, p: any) => ({ ...acc, [p.name]: p.value }), {})
        : {},
      raw: c
    };
  }

  private mapType(type: string): ComponentType {
    const t = type?.toLowerCase();
    if (['application', 'framework', 'library', 'container', 'operating-system', 'device', 'firmware', 'file'].includes(t)) {
      return t as ComponentType;
    }
    return 'other';
  }

  private mapLicenses(licenses: any[]): any[] {
    if (!Array.isArray(licenses)) return [];
    return licenses.map(l => {
      if (l.license) {
        return {
          id: l.license.id,
          name: l.license.name,
          url: l.license.url
        };
      } else if (l.expression) {
        return {
          expression: l.expression
        };
      }
      return {};
    });
  }

  private mapSeverity(severity: string): SBOMVulnerability['severity'] {
    const s = severity?.toLowerCase();
    if (['critical', 'high', 'medium', 'low', 'info', 'none'].includes(s)) {
      return s === 'none' ? 'info' : s as any;
    }
    return 'unknown';
  }

  private extractTool(tools: any): string | undefined {
    if (!tools) return undefined;
    if (Array.isArray(tools.components)) {
      return tools.components.map((c: any) => `${c.name}${c.version ? ' ' + c.version : ''}`).join(', ');
    }
    if (Array.isArray(tools.services)) {
        return tools.services.map((s: any) => s.name).join(', ');
    }
    if (Array.isArray(tools)) {
        return tools.map((t: any) => `${t.vendor ? t.vendor + ' ' : ''}${t.name}${t.version ? ' ' + t.version : ''}`).join(', ');
    }
    return undefined;
  }
}
