import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('./apiClient', () => ({
  apiClient: {
    post: vi.fn(),
    get: vi.fn(),
    postMultipart: vi.fn(),
    getBlob: vi.fn(),
  },
}));

import { bulkUploadService } from './bulkUploadService';
import { apiClient } from './apiClient';

const mockApi = vi.mocked(apiClient);

describe('BulkUploadService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('initSession', () => {
    it('calls POST /api/upload/init with fileName', async () => {
      mockApi.post.mockResolvedValue({ uploadId: 'abc', status: 'UPLOADING' });
      const result = await bulkUploadService.initSession('products.csv');
      expect(mockApi.post).toHaveBeenCalledWith('/api/upload/init', { fileName: 'products.csv' });
      expect(result).toEqual({ uploadId: 'abc', status: 'UPLOADING' });
    });
  });

  describe('uploadChunk', () => {
    it('uploads chunk as multipart form', async () => {
      mockApi.postMultipart.mockResolvedValue({ uploadId: 'abc', chunkIndex: 0, received: true });
      const chunk = new Blob(['data']);
      const result = await bulkUploadService.uploadChunk('abc', 0, 'checksum0', chunk);
      expect(mockApi.postMultipart).toHaveBeenCalledWith('/api/upload/abc/chunk', expect.any(FormData));
      expect(result).toEqual({ uploadId: 'abc', chunkIndex: 0, received: true });
    });
  });

  describe('completeUpload', () => {
    it('calls POST to complete upload', async () => {
      const summary = { uploadId: 'abc', processingStatus: 'COMPLETED', totalRecords: 10, processedRecords: 10, failedRecords: 0 };
      mockApi.post.mockResolvedValue(summary);
      const result = await bulkUploadService.completeUpload('abc');
      expect(mockApi.post).toHaveBeenCalledWith('/api/upload/abc/complete', {});
      expect(result).toEqual(summary);
    });
  });

  describe('getStatus', () => {
    it('calls GET for upload status', async () => {
      const summary = { uploadId: 'abc', processingStatus: 'IN_PROGRESS' };
      mockApi.get.mockResolvedValue(summary);
      const result = await bulkUploadService.getStatus('abc');
      expect(mockApi.get).toHaveBeenCalledWith('/api/upload/abc/status');
      expect(result).toEqual(summary);
    });
  });

  describe('downloadErrors', () => {
    it('calls getBlob for errors download', async () => {
      const blob = new Blob(['errors']);
      mockApi.getBlob.mockResolvedValue(blob);
      const result = await bulkUploadService.downloadErrors('abc');
      expect(mockApi.getBlob).toHaveBeenCalledWith('/api/upload/abc/errors');
      expect(result).toBe(blob);
    });
  });

  describe('downloadTemplate', () => {
    it('calls getBlob for template download', async () => {
      const blob = new Blob(['template']);
      mockApi.getBlob.mockResolvedValue(blob);
      const result = await bulkUploadService.downloadTemplate();
      expect(mockApi.getBlob).toHaveBeenCalledWith('/api/upload/template');
      expect(result).toBe(blob);
    });
  });

  describe('getChunkSize', () => {
    it('returns chunk size constant', () => {
      expect(bulkUploadService.getChunkSize()).toBe(512 * 1024);
    });
  });
});
