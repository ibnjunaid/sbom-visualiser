import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';
import { loadSbomFromUrl } from '../utils/sbomLoader';

describe('loadSbomFromUrl', () => {
  const originalFetch = global.fetch;

  beforeEach(() => {
    vi.restoreAllMocks();
  });

  afterEach(() => {
    global.fetch = originalFetch;
  });

  it('fetches SBOM text and derives a filename from the URL', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      text: async () => '{"bomFormat":"CycloneDX"}'
    } as Response);

    const result = await loadSbomFromUrl('https://example.com/sbom-files/sample.spdx.json');

    expect(result).toEqual({
      content: '{"bomFormat":"CycloneDX"}',
      fileName: 'sample.spdx.json'
    });
  });

  it('throws a helpful error when the URL request fails', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 404,
      statusText: 'Not Found'
    } as Response);

    await expect(loadSbomFromUrl('https://example.com/missing.json')).rejects.toThrow('Failed to load SBOM from URL');
  });
});
