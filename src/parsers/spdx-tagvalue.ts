import { NormalizedSBOM, SBOMComponent, SBOMRelationship } from '../models/sbom';
import { Parser, ParseError } from './types';

export class SPDXTagValueParser implements Parser {
  canParse(content: string, fileName: string): boolean {
    return content.includes('SPDXVersion:') && (content.includes('DocumentName:') || fileName.endsWith('.spdx'));
  }

  parse(content: string): NormalizedSBOM {
    const lines = content.split('\n');
    const doc: any = {
      packages: [],
      files: [],
      relationships: [],
      creationInfo: { creators: [] }
    };

    let currentPackage: any = null;
    let currentFile: any = null;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line || line.startsWith('#')) continue;

      const firstColon = line.indexOf(':');
      if (firstColon === -1) continue;

      const key = line.substring(0, firstColon).trim();
      let value = line.substring(firstColon + 1).trim();

      if (value.startsWith('<text>')) {
          let textValue = value.substring(6);
          if (!textValue.endsWith('</text>')) {
              i++;
              while (i < lines.length && !lines[i].includes('</text>')) {
                  textValue += '\n' + lines[i];
                  i++;
              }
              if (i < lines.length) {
                  textValue += '\n' + lines[i].replace('</text>', '');
              }
          } else {
              textValue = textValue.replace('</text>', '');
          }
          value = textValue.trim();
      }

      switch (key) {
        case 'SPDXVersion': doc.spdxVersion = value; break;
        case 'DocumentName': doc.name = value; break;
        case 'Creator': doc.creationInfo.creators.push(value); break;
        case 'Created': doc.creationInfo.created = value; break;

        case 'PackageName':
          currentPackage = { name: value, externalRefs: [] };
          doc.packages.push(currentPackage);
          currentFile = null;
          break;
        case 'SPDXID':
          if (currentPackage) currentPackage.SPDXID = value;
          else if (currentFile) currentFile.SPDXID = value;
          break;
        case 'PackageVersion': if (currentPackage) currentPackage.versionInfo = value; break;
        case 'PackageSupplier': if (currentPackage) currentPackage.supplier = value; break;
        case 'PackageLicenseDeclared': if (currentPackage) currentPackage.licenseDeclared = value; break;
        case 'PackageLicenseConcluded': if (currentPackage) currentPackage.licenseConcluded = value; break;
        case 'ExternalRef':
            if (currentPackage) {
                const parts = value.split(' ');
                currentPackage.externalRefs.push({
                    referenceCategory: parts[0],
                    referenceType: parts[1],
                    referenceLocator: parts[2]
                });
            }
            break;

        case 'FileName':
            currentFile = { fileName: value };
            doc.files.push(currentFile);
            currentPackage = null;
            break;

        case 'Relationship':
            const [id1, relType, id2] = value.split(/\s+/);
            doc.relationships.push({
                spdxElementId: id1,
                relationshipType: relType,
                relatedSpdxElement: id2
            });
            break;
      }
    }

    if (!doc.spdxVersion) {
        throw new ParseError('Missing SPDXVersion');
    }

    return this.mapToNormalized(doc);
  }

  private mapToNormalized(doc: any): NormalizedSBOM {
      const components: SBOMComponent[] = doc.packages.map((p: any) => ({
          id: p.SPDXID,
          name: p.name,
          version: p.versionInfo,
          type: 'library',
          purl: p.externalRefs.find((r: any) => r.referenceType === 'purl')?.referenceLocator,
          cpe: p.externalRefs.find((r: any) => r.referenceType?.startsWith('cpe'))?.referenceLocator,
          supplier: p.supplier?.replace(/^(Organization|Person):\s*/, ''),
          licenses: {
              declared: p.licenseDeclared ? [{ expression: p.licenseDeclared }] : [],
              concluded: p.licenseConcluded ? [{ expression: p.licenseConcluded }] : [],
          },
          externalRefs: p.externalRefs.map((r: any) => ({ type: r.referenceType, url: r.referenceLocator })),
          raw: p
      }));

      const relationships: SBOMRelationship[] = doc.relationships.map((r: any) => ({
          source: r.spdxElementId,
          target: r.relatedSpdxElement,
          type: r.relationshipType === 'DEPENDS_ON' ? 'DEPENDS_ON' :
                r.relationshipType === 'DESCRIBES' ? 'DESCRIBES' :
                r.relationshipType === 'CONTAINS' ? 'CONTAINS' : 'OTHER'
      }));

      return {
          metadata: {
              format: 'SPDX',
              specVersion: doc.spdxVersion,
              name: doc.name || 'Unnamed SPDX',
              tool: doc.creationInfo.creators.filter((c: string) => c.startsWith('Tool:')).join(', '),
              timestamp: doc.creationInfo.created,
              componentCount: components.length
          },
          components,
          relationships,
          vulnerabilities: []
      };
  }
}
