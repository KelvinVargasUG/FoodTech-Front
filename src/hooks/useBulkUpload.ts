import { useState, useCallback, useRef } from 'react';
import { bulkUploadService } from '../services/bulkUploadService';
import { validateCsvHeaders } from '../helpers/validateCsvHeaders';
import type { UploadSummary } from '../models/BulkUpload';
import { ProcessingStatusEnum } from '../models/BulkUpload';

type UploadStatus = 'idle' | 'validating' | 'uploading' | 'processing' | 'completed' | 'error';

const POLL_INTERVAL_MS = 3_000;

export const MAX_CSV_FILE_SIZE = 10 * 1024 * 1024; 

export interface UseBulkUploadReturn {

  upload: (file: File, createdBy?: string) => Promise<void>;

  pollStatus: (uploadId: string) => Promise<void>;

  status: UploadStatus;

  summary: UploadSummary | null;

  isUploading: boolean;

  isProcessing: boolean;

  progress: number;

  error: string | null;

  reset: () => void;

  downloadErrors: () => Promise<void>;

  downloadTemplate: () => Promise<void>;
}

export const useBulkUpload = (): UseBulkUploadReturn => {
  const [status, setStatus] = useState<UploadStatus>('idle');
  const [summary, setSummary] = useState<UploadSummary | null>(null);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const lastUploadIdRef = useRef<string | null>(null);
  const pollTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const reset = useCallback(() => {
    if (pollTimerRef.current) {
      clearTimeout(pollTimerRef.current);
      pollTimerRef.current = null;
    }
    setStatus('idle');
    setSummary(null);
    setProgress(0);
    setError(null);
    lastUploadIdRef.current = null;
  }, []);

  const pollStatus = useCallback(async (uploadId: string): Promise<void> => {
    setStatus('processing');

    const poll = async () => {
      try {
        const result = await bulkUploadService.getStatus(uploadId);
        setSummary(result);

        if (
          result.processingStatus === ProcessingStatusEnum.COMPLETED ||
          result.processingStatus === ProcessingStatusEnum.FAILED
        ) {
          setStatus('completed');
          return;
        }

        pollTimerRef.current = setTimeout(poll, POLL_INTERVAL_MS);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error al obtener el estado');
        setStatus('error');
      }
    };

    await poll();
  }, []);

  const upload = useCallback(
    async (file: File): Promise<void> => {
      reset();

      try {

        if (file.size > MAX_CSV_FILE_SIZE) {
          const sizeMB = (file.size / 1024 / 1024).toFixed(1);
          setError(
            `El archivo supera el tamaño máximo permitido (10 MB). Tamaño: ${sizeMB} MB`
          );
          setStatus('error');
          return;
        }

        setStatus('validating');
        const validation = await validateCsvHeaders(file);
        if (!validation.valid) {
          const missing = validation.missingHeaders.join(', ');
          setError(`Columnas faltantes en el CSV: ${missing}`);
          setStatus('error');
          return;
        }

        setStatus('uploading');
        const session = await bulkUploadService.initSession(file.name);
        const uploadId = session.uploadId;
        lastUploadIdRef.current = uploadId;

        const chunkSize = bulkUploadService.getChunkSize();
        const totalChunks = Math.ceil(file.size / chunkSize);

        for (let i = 0; i < totalChunks; i++) {
          const start = i * chunkSize;
          const end = Math.min(start + chunkSize, file.size);
          const chunk = file.slice(start, end);

          const checksum = String(i);

          await bulkUploadService.uploadChunk(uploadId, i, checksum, chunk);
          setProgress(Math.round(((i + 1) / totalChunks) * 80)); 
        }

        setProgress(85);
        const result = await bulkUploadService.completeUpload(uploadId);
        setSummary(result);
        setProgress(100);

        if (
          result.processingStatus !== ProcessingStatusEnum.COMPLETED &&
          result.processingStatus !== ProcessingStatusEnum.FAILED
        ) {
          await pollStatus(uploadId);
        } else {
          setStatus('completed');
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error durante la carga');
        setStatus('error');
      }
    },
    [reset, pollStatus]
  );

  const triggerBlobDownload = (blob: Blob, filename: string) => {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  const downloadErrors = useCallback(async (): Promise<void> => {
    const uploadId = lastUploadIdRef.current;
    if (!uploadId) return;
    try {
      const blob = await bulkUploadService.downloadErrors(uploadId);
      triggerBlobDownload(blob, `errores_${uploadId}.csv`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al descargar errores');
    }
  }, []);

  const downloadTemplate = useCallback(async (): Promise<void> => {
    try {
      const blob = await bulkUploadService.downloadTemplate();
      triggerBlobDownload(blob, 'plantilla_productos.csv');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al descargar la plantilla');
    }
  }, []);

  return {
    upload,
    pollStatus,
    status,
    summary,
    isUploading: status === 'uploading',
    isProcessing: status === 'processing',
    progress,
    error,
    reset,
    downloadErrors,
    downloadTemplate,
  };
};
