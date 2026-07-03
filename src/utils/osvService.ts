export interface OSVVulnerability {
  id: string;
  summary?: string;
  details?: string;
  published?: string;
  modified?: string;
  references?: { type: string; url: string }[];
}

export async function fetchVulnerabilitiesForPurl(purl: string): Promise<OSVVulnerability[]> {
  try {
    const response = await fetch('https://api.osv.dev/v1/query', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ package: { purl } })
    });

    if (!response.ok) return [];

    const data = await response.json();
    if (!data.vulns || !Array.isArray(data.vulns)) return [];

    return data.vulns.map((v: any) => ({
      id: v.id,
      summary: v.summary,
      details: v.details,
      published: v.published,
      modified: v.modified,
      references: v.references
    }));
  } catch (error) {
    console.error('Error fetching from OSV.dev:', error);
    return [];
  }
}

export async function batchFetchVulnerabilities(purls: string[]): Promise<Record<string, OSVVulnerability[]>> {
    const results: Record<string, OSVVulnerability[]> = {};

    // OSV batch API supports up to 1000 queries but let's do them sequentially or in small chunks
    // to be safe and avoid giant request bodies, though for most SBOMs it's fine.
    // For simplicity, we'll map them individually for now or use the batch endpoint if preferred.
    // The current OSV batch API actually takes a list of queries.

    const queries = purls.map(purl => ({ package: { purl } }));

    // We'll process in chunks of 50 to avoid timeouts/limits
    const chunkSize = 50;
    for (let i = 0; i < queries.length; i += chunkSize) {
        const chunk = queries.slice(i, i + chunkSize);
        try {
            const response = await fetch('https://api.osv.dev/v1/querybatch', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ queries: chunk })
            });

            if (response.ok) {
                const data = await response.json();
                if (data.results && Array.isArray(data.results)) {
                    data.results.forEach((res: any, idx: number) => {
                        const purl = purls[i + idx];
                        if (res.vulns) {
                            results[purl] = res.vulns;
                        }
                    });
                }
            }
        } catch (e) {
            console.error('Batch fetch error:', e);
        }
    }

    return results;
}
