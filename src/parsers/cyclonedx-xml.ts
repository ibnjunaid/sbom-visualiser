import { XMLParser } from 'fast-xml-parser';
import { NormalizedSBOM } from '../models/sbom';
import { Parser, ParseError } from './types';
import { CycloneDXJSONParser } from './cyclonedx-json';

export class CycloneDXXMLParser implements Parser {
  private xmlParser = new XMLParser({
    ignoreAttributes: false,
    attributeNamePrefix: "@_",
    parseAttributeValue: true
  });

  canParse(content: string): boolean {
    return content.trim().startsWith('<?xml') && content.includes('bomFormat="CycloneDX"');
  }

  parse(content: string): NormalizedSBOM {
    let xml: any;
    try {
      xml = this.xmlParser.parse(content);
    } catch (e: any) {
      throw new ParseError(`Invalid XML: ${e.message}`);
    }

    const bom = xml.bom;
    if (!bom || bom['@_bomFormat'] !== 'CycloneDX') {
      throw new ParseError('Not a CycloneDX SBOM');
    }

    const jsonEquivalent: any = {
      bomFormat: bom['@_bomFormat'],
      specVersion: bom['@_specVersion'],
      metadata: this.normalizeMetadata(bom.metadata),
      components: this.normalizeComponents(bom.components?.component),
      dependencies: this.normalizeDependencies(bom.dependencies?.dependency),
      vulnerabilities: this.normalizeVulnerabilities(bom.vulnerabilities?.vulnerability)
    };

    return new CycloneDXJSONParser().parse(JSON.stringify(jsonEquivalent));
  }

  private normalizeMetadata(m: any): any {
    if (!m) return undefined;
    return {
      timestamp: m.timestamp,
      tools: this.ensureArray(m.tools?.tool || m.tools?.component || m.tools?.service),
      component: m.component ? this.normalizeComponent(m.component) : undefined
    };
  }

  private normalizeComponents(c: any): any[] {
    return this.ensureArray(c).map(comp => this.normalizeComponent(comp));
  }

  private normalizeComponent(c: any): any {
    return {
      ...c,
      'bom-ref': c['@_bom-ref'],
      type: c['@_type'],
      licenses: this.ensureArray(c.licenses?.license || c.licenses?.expression).map(l => {
          if (typeof l === 'string') return { expression: l };
          return { license: l };
      }),
      externalReferences: this.ensureArray(c.externalReferences?.reference).map(r => ({
          ...r,
          type: r['@_type']
      }))
    };
  }

  private normalizeDependencies(d: any): any[] {
      return this.ensureArray(d).map(dep => ({
          ref: dep['@_ref'],
          dependsOn: this.ensureArray(dep.dependency).map(sub => sub['@_ref'])
      }));
  }

  private normalizeVulnerabilities(v: any): any[] {
      return this.ensureArray(v).map(vuln => ({
          ...vuln,
          id: vuln.id,
          ratings: this.ensureArray(vuln.ratings?.rating),
          affects: this.ensureArray(vuln.affects?.target).map(t => ({ ref: t.ref }))
      }));
  }

  private ensureArray(item: any): any[] {
    if (item === undefined || item === null) return [];
    return Array.isArray(item) ? item : [item];
  }
}
