export interface LoadedSbomSource {
  content: string;
  fileName: string;
}

export async function loadSbomFromUrl(url: string): Promise<LoadedSbomSource> {
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`Failed to load SBOM from URL (${response.status} ${response.statusText})`);
  }

  const content = await response.text();
  const fileName = getFileNameFromUrl(url);

  return { content, fileName };
}

function getFileNameFromUrl(url: string): string {
  try {
    const { pathname } = new URL(url);
    const segments = pathname.split('/').filter(Boolean);
    return segments.at(-1) ?? 'sbom-from-url';
  } catch {
    return 'sbom-from-url';
  }
}
