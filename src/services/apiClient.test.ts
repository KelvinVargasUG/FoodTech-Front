import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// Mock authService before importing apiClient
vi.mock('./authService', () => ({
  authService: {
    getToken: vi.fn(),
  },
}));

import { apiClient } from './apiClient';
import { authService } from './authService';

const mockAuthService = vi.mocked(authService);

describe('ApiClient', () => {
  const mockResponse = (body: unknown, ok = true, status = 200) => {
    return {
      ok,
      status,
      json: vi.fn().mockResolvedValue(body),
      blob: vi.fn().mockResolvedValue(new Blob(['test'])),
    } as unknown as Response;
  };

  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn());
    mockAuthService.getToken.mockReturnValue('test-token');
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('getHeaders', () => {
    it('includes Authorization when token exists', async () => {
      vi.mocked(fetch).mockResolvedValue(mockResponse({ data: 'ok' }));
      await apiClient.get('/test');
      expect(fetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          headers: expect.objectContaining({
            Authorization: 'Bearer test-token',
            'Content-Type': 'application/json',
          }),
        })
      );
    });

    it('omits Authorization when no token', async () => {
      mockAuthService.getToken.mockReturnValue(null);
      vi.mocked(fetch).mockResolvedValue(mockResponse({ data: 'ok' }));
      await apiClient.get('/test');
      const callHeaders = (fetch as unknown as ReturnType<typeof vi.fn>).mock.calls[0][1].headers;
      expect(callHeaders.Authorization).toBeUndefined();
    });
  });

  describe('get', () => {
    it('makes GET request and returns parsed JSON', async () => {
      vi.mocked(fetch).mockResolvedValue(mockResponse({ id: 1 }));
      const result = await apiClient.get('/api/items');
      expect(result).toEqual({ id: 1 });
      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/items'),
        expect.objectContaining({ method: 'GET' })
      );
    });

    it('throws on non-ok response', async () => {
      vi.mocked(fetch).mockResolvedValue(mockResponse(null, false, 404));
      await expect(apiClient.get('/not-found')).rejects.toThrow('HTTP error! status: 404');
    });
  });

  describe('post', () => {
    it('makes POST request with JSON body', async () => {
      vi.mocked(fetch).mockResolvedValue(mockResponse({ created: true }));
      const result = await apiClient.post('/api/items', { name: 'test' });
      expect(result).toEqual({ created: true });
      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/items'),
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({ name: 'test' }),
        })
      );
    });

    it('throws on non-ok response', async () => {
      vi.mocked(fetch).mockResolvedValue(mockResponse(null, false, 500));
      await expect(apiClient.post('/api/items', {})).rejects.toThrow('HTTP error! status: 500');
    });
  });

  describe('postNoContent', () => {
    it('makes POST request without returning body', async () => {
      vi.mocked(fetch).mockResolvedValue(mockResponse(null, true));
      await apiClient.postNoContent('/api/action', { id: 1 });
      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/action'),
        expect.objectContaining({ method: 'POST' })
      );
    });

    it('throws on non-ok response', async () => {
      vi.mocked(fetch).mockResolvedValue(mockResponse(null, false, 403));
      await expect(apiClient.postNoContent('/api/action', {})).rejects.toThrow('HTTP error! status: 403');
    });
  });

  describe('patch', () => {
    it('makes PATCH request', async () => {
      vi.mocked(fetch).mockResolvedValue(mockResponse({ updated: true }));
      const result = await apiClient.patch('/api/items/1');
      expect(result).toEqual({ updated: true });
      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/items/1'),
        expect.objectContaining({ method: 'PATCH' })
      );
    });

    it('throws on non-ok response', async () => {
      vi.mocked(fetch).mockResolvedValue(mockResponse(null, false, 400));
      await expect(apiClient.patch('/bad')).rejects.toThrow('HTTP error! status: 400');
    });
  });

  describe('put', () => {
    it('makes PUT request with JSON body', async () => {
      vi.mocked(fetch).mockResolvedValue(mockResponse({ id: 1, name: 'updated' }));
      const result = await apiClient.put('/api/items/1', { name: 'updated' });
      expect(result).toEqual({ id: 1, name: 'updated' });
      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/items/1'),
        expect.objectContaining({
          method: 'PUT',
          body: JSON.stringify({ name: 'updated' }),
        })
      );
    });

    it('throws on non-ok response', async () => {
      vi.mocked(fetch).mockResolvedValue(mockResponse(null, false, 409));
      await expect(apiClient.put('/api/items/1', {})).rejects.toThrow('HTTP error! status: 409');
    });
  });

  describe('postMultipart', () => {
    it('makes POST request with FormData (no Content-Type header)', async () => {
      vi.mocked(fetch).mockResolvedValue(mockResponse({ received: true }));
      const formData = new FormData();
      formData.append('file', new Blob(['data']), 'test.csv');

      const result = await apiClient.postMultipart('/api/upload', formData);
      expect(result).toEqual({ received: true });
      const callHeaders = (fetch as unknown as ReturnType<typeof vi.fn>).mock.calls[0][1].headers;
      expect(callHeaders['Content-Type']).toBeUndefined();
      expect(callHeaders['Authorization']).toBe('Bearer test-token');
    });

    it('omits Authorization when no token', async () => {
      mockAuthService.getToken.mockReturnValue(null);
      vi.mocked(fetch).mockResolvedValue(mockResponse({ received: true }));
      const formData = new FormData();
      await apiClient.postMultipart('/api/upload', formData);
      const callHeaders = (fetch as unknown as ReturnType<typeof vi.fn>).mock.calls[0][1].headers;
      expect(callHeaders['Authorization']).toBeUndefined();
    });

    it('throws on non-ok response', async () => {
      vi.mocked(fetch).mockResolvedValue(mockResponse(null, false, 413));
      await expect(apiClient.postMultipart('/api/upload', new FormData())).rejects.toThrow('HTTP error! status: 413');
    });
  });

  describe('getBlob', () => {
    it('makes GET request and returns blob', async () => {
      const blob = new Blob(['file-content']);
      vi.mocked(fetch).mockResolvedValue({
        ok: true,
        blob: vi.fn().mockResolvedValue(blob),
      } as unknown as Response);

      const result = await apiClient.getBlob('/api/download');
      expect(result).toBe(blob);
    });

    it('throws on non-ok response', async () => {
      vi.mocked(fetch).mockResolvedValue(mockResponse(null, false, 404));
      await expect(apiClient.getBlob('/api/download')).rejects.toThrow('HTTP error! status: 404');
    });
  });
});
