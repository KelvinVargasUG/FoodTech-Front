import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useBulkUpload } from './useBulkUpload';

vi.mock('../services/bulkUploadService', () => ({
  bulkUploadService: {
    initSession: vi.fn(),
    uploadChunk: vi.fn(),
    completeUpload: vi.fn(),
    getStatus: vi.fn(),
    downloadErrors: vi.fn(),
    downloadTemplate: vi.fn(),
    getChunkSize: vi.fn(() => 512 * 1024),
  },
}));

vi.mock('../helpers/validateCsvHeaders', () => ({
  validateCsvHeaders: vi.fn(async () => ({ valid: true, missingHeaders: [], extraHeaders: [] })),
}));

const getService = async () => {
  const { bulkUploadService } = await import('../services/bulkUploadService');
  return bulkUploadService;
};

const getValidate = async () => {
  const { validateCsvHeaders } = await import('../helpers/validateCsvHeaders');
  return validateCsvHeaders;
};

const buildCsvFile = (content = 'nombre,precio\nPizza,1500\n') =>
  new File([content], 'test.csv', { type: 'text/csv' });

const buildOversizedFile = () => {

  const content = 'A'.repeat(11 * 1024 * 1024);
  return new File([content], 'grande.csv', { type: 'text/csv' });
};

describe('useBulkUpload', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('initial state is idle with no errors', () => {
    const { result } = renderHook(() => useBulkUpload());

    expect(result.current.status).toBe('idle');
    expect(result.current.error).toBeNull();
    expect(result.current.summary).toBeNull();
    expect(result.current.progress).toBe(0);
    expect(result.current.isUploading).toBe(false);
    expect(result.current.isProcessing).toBe(false);
  });

  it('upload() transitions to completed on successful full flow', async () => {
    const svc = await getService();
    const session = { uploadId: 'uid-001', status: 'UPLOADING' };
    const summary = {
      uploadId: 'uid-001',
      uploadStatus: 'UPLOADED',
      processingStatus: 'COMPLETED',
      totalRecords: 1,
      processedRecords: 1,
      failedRecords: 0,
    };

    vi.mocked(svc.initSession).mockResolvedValueOnce(session as never);
    vi.mocked(svc.uploadChunk).mockResolvedValue({ uploadId: 'uid-001', chunkIndex: 0, received: true });
    vi.mocked(svc.completeUpload).mockResolvedValueOnce(summary as never);

    const { result } = renderHook(() => useBulkUpload());

    await act(async () => {
      await result.current.upload(buildCsvFile());
    });

    expect(result.current.status).toBe('completed');
    expect(result.current.summary).toEqual(summary);
    expect(result.current.error).toBeNull();
    expect(result.current.progress).toBe(100);
  });

  it('upload() sets error when CSV header validation fails', async () => {
    const validate = await getValidate();
    vi.mocked(validate).mockResolvedValueOnce({
      valid: false,
      missingHeaders: ['nombre', 'precio'],
      extraHeaders: [],
    });

    const svc = await getService();
    const { result } = renderHook(() => useBulkUpload());

    await act(async () => {
      await result.current.upload(buildCsvFile('col1,col2\nv1,v2\n'));
    });

    expect(result.current.status).toBe('error');
    expect(result.current.error).toContain('nombre');
    expect(svc.initSession).not.toHaveBeenCalled();
  });

  it('upload() sets error when file exceeds MAX_CSV_FILE_SIZE (10 MB) without calling any service', async () => {
    const svc = await getService();
    const validate = await getValidate();

    const { result } = renderHook(() => useBulkUpload());

    await act(async () => {
      await result.current.upload(buildOversizedFile());
    });

    expect(result.current.status).toBe('error');
    expect(result.current.error).toContain('10 MB');

    expect(validate).not.toHaveBeenCalled();
    expect(svc.initSession).not.toHaveBeenCalled();
  });

  it('upload() sets error when initSession throws', async () => {
    const svc = await getService();
    vi.mocked(svc.initSession).mockRejectedValueOnce(new Error('Network Error'));

    const { result } = renderHook(() => useBulkUpload());

    await act(async () => {
      await result.current.upload(buildCsvFile());
    });

    expect(result.current.status).toBe('error');
    expect(result.current.error).toBe('Network Error');
  });

  it('reset() returns state to idle after an error', async () => {
    const svc = await getService();
    vi.mocked(svc.initSession).mockRejectedValueOnce(new Error('oops'));

    const { result } = renderHook(() => useBulkUpload());

    await act(async () => {
      await result.current.upload(buildCsvFile());
    });

    expect(result.current.status).toBe('error');

    act(() => {
      result.current.reset();
    });

    expect(result.current.status).toBe('idle');
    expect(result.current.error).toBeNull();
  });

  it('upload() calls pollStatus when completeUpload returns PROCESSING status', async () => {
    const svc = await getService();
    const session = { uploadId: 'uid-poll', status: 'UPLOADING' };
    const processingResult = {
      uploadId: 'uid-poll',
      uploadStatus: 'UPLOADED',
      processingStatus: 'PROCESSING',
      totalRecords: 5,
      processedRecords: 0,
      failedRecords: 0,
    };
    const completedResult = {
      uploadId: 'uid-poll',
      uploadStatus: 'UPLOADED',
      processingStatus: 'COMPLETED',
      totalRecords: 5,
      processedRecords: 5,
      failedRecords: 0,
    };

    vi.mocked(svc.initSession).mockResolvedValueOnce(session as never);
    vi.mocked(svc.uploadChunk).mockResolvedValue({ uploadId: 'uid-poll', chunkIndex: 0, received: true });
    vi.mocked(svc.completeUpload).mockResolvedValueOnce(processingResult as never);
    vi.mocked(svc.getStatus).mockResolvedValueOnce(completedResult as never);

    const { result } = renderHook(() => useBulkUpload());

    await act(async () => {
      await result.current.upload(buildCsvFile());
    });

    expect(svc.getStatus).toHaveBeenCalledWith('uid-poll');
    expect(result.current.status).toBe('completed');
  });

  it('pollStatus sets error when getStatus throws an Error', async () => {
    const svc = await getService();
    vi.mocked(svc.getStatus).mockRejectedValueOnce(new Error('Poll failed'));

    const { result } = renderHook(() => useBulkUpload());

    await act(async () => {
      await result.current.pollStatus('uid-err');
    });

    expect(result.current.status).toBe('error');
    expect(result.current.error).toBe('Poll failed');
  });

  it('pollStatus sets generic error message when getStatus throws a non-Error', async () => {
    const svc = await getService();
    vi.mocked(svc.getStatus).mockRejectedValueOnce('string error');

    const { result } = renderHook(() => useBulkUpload());

    await act(async () => {
      await result.current.pollStatus('uid-nonerr');
    });

    expect(result.current.status).toBe('error');
    expect(result.current.error).toBe('Error al obtener el estado');
  });

  it('pollStatus sets status completed when getStatus returns FAILED', async () => {
    const svc = await getService();
    vi.mocked(svc.getStatus).mockResolvedValueOnce({
      uploadId: 'uid-fail',
      uploadStatus: 'UPLOADED',
      processingStatus: 'FAILED',
      totalRecords: 2,
      processedRecords: 0,
      failedRecords: 2,
    } as never);

    const { result } = renderHook(() => useBulkUpload());

    await act(async () => {
      await result.current.pollStatus('uid-fail');
    });

    expect(result.current.status).toBe('completed');
  });

  it('upload() sets generic error when a non-Error is thrown', async () => {
    const svc = await getService();
    vi.mocked(svc.initSession).mockRejectedValueOnce('random string');

    const { result } = renderHook(() => useBulkUpload());

    await act(async () => {
      await result.current.upload(buildCsvFile());
    });

    expect(result.current.status).toBe('error');
    expect(result.current.error).toBe('Error durante la carga');
  });

  it('downloadErrors triggers blob download when uploadId exists', async () => {
    const svc = await getService();
    const blob = new Blob(['err1\nerr2'], { type: 'text/csv' });
    vi.mocked(svc.downloadErrors).mockResolvedValueOnce(blob);

    // Setup upload to set lastUploadIdRef
    const session = { uploadId: 'uid-dl', status: 'UPLOADING' };
    const summary = {
      uploadId: 'uid-dl', uploadStatus: 'UPLOADED', processingStatus: 'COMPLETED',
      totalRecords: 1, processedRecords: 1, failedRecords: 0,
    };
    vi.mocked(svc.initSession).mockResolvedValueOnce(session as never);
    vi.mocked(svc.uploadChunk).mockResolvedValue({ uploadId: 'uid-dl', chunkIndex: 0, received: true });
    vi.mocked(svc.completeUpload).mockResolvedValueOnce(summary as never);

    const mockCreateObjectURL = vi.fn(() => 'blob:mock-url');
    const mockRevokeObjectURL = vi.fn();
    global.URL.createObjectURL = mockCreateObjectURL;
    global.URL.revokeObjectURL = mockRevokeObjectURL;

    const { result } = renderHook(() => useBulkUpload());

    await act(async () => {
      await result.current.upload(buildCsvFile());
    });

    await act(async () => {
      await result.current.downloadErrors();
    });

    expect(svc.downloadErrors).toHaveBeenCalledWith('uid-dl');
    expect(mockCreateObjectURL).toHaveBeenCalled();
  });

  it('downloadErrors does nothing when no uploadId is set', async () => {
    const svc = await getService();

    const { result } = renderHook(() => useBulkUpload());

    await act(async () => {
      await result.current.downloadErrors();
    });

    expect(svc.downloadErrors).not.toHaveBeenCalled();
  });

  it('downloadErrors sets error when service throws', async () => {
    const svc = await getService();

    // Setup upload first to set lastUploadIdRef
    const session = { uploadId: 'uid-dlerr', status: 'UPLOADING' };
    const summary = {
      uploadId: 'uid-dlerr', uploadStatus: 'UPLOADED', processingStatus: 'COMPLETED',
      totalRecords: 1, processedRecords: 1, failedRecords: 0,
    };
    vi.mocked(svc.initSession).mockResolvedValueOnce(session as never);
    vi.mocked(svc.uploadChunk).mockResolvedValue({ uploadId: 'uid-dlerr', chunkIndex: 0, received: true });
    vi.mocked(svc.completeUpload).mockResolvedValueOnce(summary as never);

    const { result } = renderHook(() => useBulkUpload());

    await act(async () => {
      await result.current.upload(buildCsvFile());
    });

    // Now set the downloadErrors mock to reject AFTER upload completes
    vi.mocked(svc.downloadErrors).mockRejectedValueOnce(new Error('Download fail'));

    await act(async () => {
      await result.current.downloadErrors();
    });

    expect(result.current.error).toBe('Download fail');
  });

  it('downloadErrors sets generic message for non-Error throws', async () => {
    const svc = await getService();

    const session = { uploadId: 'uid-dlerr2', status: 'UPLOADING' };
    const summary = {
      uploadId: 'uid-dlerr2', uploadStatus: 'UPLOADED', processingStatus: 'COMPLETED',
      totalRecords: 1, processedRecords: 1, failedRecords: 0,
    };
    vi.mocked(svc.initSession).mockResolvedValueOnce(session as never);
    vi.mocked(svc.uploadChunk).mockResolvedValue({ uploadId: 'uid-dlerr2', chunkIndex: 0, received: true });
    vi.mocked(svc.completeUpload).mockResolvedValueOnce(summary as never);

    const { result } = renderHook(() => useBulkUpload());

    await act(async () => {
      await result.current.upload(buildCsvFile());
    });

    vi.mocked(svc.downloadErrors).mockRejectedValueOnce(42);

    await act(async () => {
      await result.current.downloadErrors();
    });

    expect(result.current.error).toBe('Error al descargar errores');
  });

  it('downloadTemplate triggers blob download', async () => {
    const svc = await getService();
    const blob = new Blob(['col1,col2'], { type: 'text/csv' });
    vi.mocked(svc.downloadTemplate).mockResolvedValueOnce(blob);

    const mockCreateObjectURL = vi.fn(() => 'blob:tpl-url');
    const mockRevokeObjectURL = vi.fn();
    global.URL.createObjectURL = mockCreateObjectURL;
    global.URL.revokeObjectURL = mockRevokeObjectURL;

    const { result } = renderHook(() => useBulkUpload());

    await act(async () => {
      await result.current.downloadTemplate();
    });

    expect(svc.downloadTemplate).toHaveBeenCalled();
    expect(mockCreateObjectURL).toHaveBeenCalled();
  });

  it('downloadTemplate sets error when service throws Error', async () => {
    const svc = await getService();
    vi.mocked(svc.downloadTemplate).mockRejectedValueOnce(new Error('tpl error'));

    const { result } = renderHook(() => useBulkUpload());

    await act(async () => {
      await result.current.downloadTemplate();
    });

    expect(result.current.error).toBe('tpl error');
  });

  it('downloadTemplate sets generic message for non-Error throws', async () => {
    const svc = await getService();
    vi.mocked(svc.downloadTemplate).mockRejectedValueOnce(null);

    const { result } = renderHook(() => useBulkUpload());

    await act(async () => {
      await result.current.downloadTemplate();
    });

    expect(result.current.error).toBe('Error al descargar la plantilla');
  });
});
