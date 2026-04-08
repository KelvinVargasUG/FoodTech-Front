import { apiClient } from './apiClient';
import type { ChunkResponse, UploadSession, UploadSummary } from '../models/BulkUpload';

const CHUNK_SIZE = 512 * 1024; 

class BulkUploadService {

  async initSession(fileName: string): Promise<UploadSession> {
    return apiClient.post<{ fileName: string }, UploadSession>('/api/upload/init', { fileName });
  }

  async uploadChunk(
    uploadId: string,
    chunkIndex: number,
    checksum: string,
    chunk: Blob
  ): Promise<ChunkResponse> {
    const formData = new FormData();
    formData.append('file', chunk, `chunk_${chunkIndex}`);
    formData.append('chunkIndex', String(chunkIndex));
    formData.append('checksum', checksum);

    return apiClient.postMultipart<ChunkResponse>(`/api/upload/${uploadId}/chunk`, formData);
  }

  async completeUpload(uploadId: string): Promise<UploadSummary> {
    return apiClient.post<Record<string, never>, UploadSummary>(
      `/api/upload/${uploadId}/complete`,
      {}
    );
  }

  async getStatus(uploadId: string): Promise<UploadSummary> {
    return apiClient.get<UploadSummary>(`/api/upload/${uploadId}/status`);
  }

  async downloadErrors(uploadId: string): Promise<Blob> {
    return apiClient.getBlob(`/api/upload/${uploadId}/errors`);
  }

  async downloadTemplate(): Promise<Blob> {
    return apiClient.getBlob('/api/upload/template');
  }

  getChunkSize(): number {
    return CHUNK_SIZE;
  }
}

export const bulkUploadService = new BulkUploadService();
