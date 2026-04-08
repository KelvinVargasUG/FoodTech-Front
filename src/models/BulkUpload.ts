export const UploadStatusEnum = {
  UPLOADING: 'UPLOADING',
  UPLOADED: 'UPLOADED',
  FAILED: 'FAILED',
} as const;

export type UploadStatus = (typeof UploadStatusEnum)[keyof typeof UploadStatusEnum];

export const ProcessingStatusEnum = {
  PENDING: 'PENDING',
  IN_PROGRESS: 'IN_PROGRESS',
  COMPLETED: 'COMPLETED',
  FAILED: 'FAILED',
} as const;

export type ProcessingStatus = (typeof ProcessingStatusEnum)[keyof typeof ProcessingStatusEnum];

export interface UploadSession {
  uploadId: string;
  status: UploadStatus;
}

export interface ChunkResponse {
  uploadId: string;
  chunkIndex: number;
  received: boolean;
}

export interface UploadSummary {
  uploadId: string;
  uploadStatus: UploadStatus;
  processingStatus: ProcessingStatus;
  totalRecords: number;
  processedRecords: number;
  failedRecords: number;
}
