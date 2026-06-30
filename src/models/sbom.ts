export type SBOMFormat = 'SPDX' | 'CycloneDX';

export interface SBOMMetadata {
  format: SBOMFormat;
  specVersion: string;
  name: string;
  tool?: string;
  timestamp?: string;
  componentCount: number;
}

export type ComponentType =
  | 'application'
  | 'framework'
  | 'library'
  | 'container'
  | 'operating-system'
  | 'device'
  | 'firmware'
  | 'file'
  | 'other';

export interface LicenseInfo {
  id?: string;
  name?: string;
  expression?: string;
  url?: string;
}

export interface SBOMComponent {
  id: string; // Internal unique ID
  name: string;
  version?: string;
  type: ComponentType;
  purl?: string;
  bomRef?: string; // Original reference in the SBOM
  supplier?: string;
  author?: string;
  publisher?: string;
  description?: string;
  licenses: {
    declared?: LicenseInfo[];
    concluded?: LicenseInfo[];
  };
  copyright?: string;
  externalRefs: {
    type: string;
    url: string;
    comment?: string;
  }[];
  properties?: Record<string, string>;
  raw?: any; // Original raw data for detail view
}

export type RelationshipType =
  | 'DEPENDS_ON'
  | 'DESCRIBES'
  | 'CONTAINS'
  | 'GENERATED_FROM'
  | 'OTHER';

export interface SBOMRelationship {
  source: string; // id or bomRef
  target: string; // id or bomRef
  type: RelationshipType;
}

export interface SBOMVulnerability {
  id: string; // CVE-ID or similar
  source?: string;
  description?: string;
  severity?: 'critical' | 'high' | 'medium' | 'low' | 'info' | 'unknown';
  cvssScore?: number;
  componentRef: string; // which component it applies to
  raw?: any;
}

export interface NormalizedSBOM {
  metadata: SBOMMetadata;
  components: SBOMComponent[];
  relationships: SBOMRelationship[];
  vulnerabilities: SBOMVulnerability[];
}
