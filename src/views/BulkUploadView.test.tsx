import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { BulkUploadView } from './BulkUploadView';

const mockUpload = vi.fn();
const mockReset = vi.fn();
const mockDownloadErrors = vi.fn();
const mockDownloadTemplate = vi.fn();

vi.mock('../hooks/useBulkUpload', () => ({
  useBulkUpload: vi.fn(),
}));

vi.mock('../components/admin/CSVUploader', () => ({
  CSVUploader: ({ onFileSelect, isDisabled, onDownloadTemplate }: { onFileSelect: (file: File) => void; isDisabled?: boolean; onDownloadTemplate: () => void }) => (
    <div data-testid="csv-uploader">
      <input
        data-testid="file-input"
        type="file"
        disabled={isDisabled}
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) onFileSelect(file);
        }}
      />
      <button data-testid="download-template" onClick={onDownloadTemplate}>Download Template</button>
    </div>
  ),
}));

vi.mock('../components/admin/UploadProgress', () => ({
  UploadProgress: ({ status, fileName }: { status: string; fileName?: string }) => (
    <div data-testid="upload-progress">
      <span data-testid="progress-status">{status}</span>
      {fileName && <span data-testid="progress-file">{fileName}</span>}
    </div>
  ),
}));

vi.mock('../components/admin/UploadSummaryPanel', () => ({
  UploadSummaryPanel: ({ onDownloadErrors, onReset }: { onDownloadErrors: () => void; onReset: () => void }) => (
    <div data-testid="upload-summary">
      <button data-testid="summary-download-errors" onClick={onDownloadErrors}>Download Errors</button>
      <button data-testid="summary-reset" onClick={onReset}>Reset</button>
    </div>
  ),
}));

import { useBulkUpload } from '../hooks/useBulkUpload';
import type { UploadSummary } from '../models/BulkUpload';
const mockUseBulkUpload = vi.mocked(useBulkUpload);

function setupHook(overrides: Partial<ReturnType<typeof useBulkUpload>> = {}) {
  mockUseBulkUpload.mockReturnValue({
    upload: mockUpload,
    status: 'idle',
    summary: null,
    progress: 0,
    error: null,
    reset: mockReset,
    downloadErrors: mockDownloadErrors,
    downloadTemplate: mockDownloadTemplate,
    ...overrides,
  } as unknown as ReturnType<typeof useBulkUpload>);
}

describe('BulkUploadView', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders header and CSV uploader in idle state', () => {
    setupHook();
    render(<BulkUploadView />);
    expect(screen.getByText('Carga Masiva de Productos')).toBeInTheDocument();
    expect(screen.getByTestId('csv-uploader')).toBeInTheDocument();
  });

  it('calls upload when file is selected', () => {
    setupHook();
    render(<BulkUploadView />);

    const file = new File(['a,b'], 'products.csv', { type: 'text/csv' });
    fireEvent.change(screen.getByTestId('file-input'), { target: { files: [file] } });

    expect(mockUpload).toHaveBeenCalledWith(file);
  });

  it('shows progress when uploading', () => {
    setupHook({ status: 'uploading', progress: 50 });
    render(<BulkUploadView />);
    expect(screen.getByTestId('upload-progress')).toBeInTheDocument();
    expect(screen.getByTestId('progress-status')).toHaveTextContent('uploading');
  });

  it('shows progress when validating', () => {
    setupHook({ status: 'validating' });
    render(<BulkUploadView />);
    expect(screen.getByTestId('progress-status')).toHaveTextContent('validating');
  });

  it('shows error state with retry button', () => {
    setupHook({ status: 'error', error: 'Upload failed' });
    render(<BulkUploadView />);
    expect(screen.getByText('Upload failed')).toBeInTheDocument();
    expect(screen.getByText('Reintentar')).toBeInTheDocument();
  });

  it('calls reset on retry', () => {
    setupHook({ status: 'error', error: 'fail' });
    render(<BulkUploadView />);
    fireEvent.click(screen.getByText('Reintentar'));
    expect(mockReset).toHaveBeenCalled();
  });

  it('shows summary panel on completion', () => {
    setupHook({
      status: 'completed',
      summary: {} as UploadSummary,
    });
    render(<BulkUploadView />);
    expect(screen.getByTestId('upload-summary')).toBeInTheDocument();
    expect(screen.queryByTestId('csv-uploader')).not.toBeInTheDocument();
  });

  it('calls downloadErrors from summary', () => {
    setupHook({
      status: 'completed',
      summary: {} as UploadSummary,
    });
    render(<BulkUploadView />);
    fireEvent.click(screen.getByTestId('summary-download-errors'));
    expect(mockDownloadErrors).toHaveBeenCalled();
  });

  it('calls reset from summary', () => {
    setupHook({
      status: 'completed',
      summary: {} as UploadSummary,
    });
    render(<BulkUploadView />);
    fireEvent.click(screen.getByTestId('summary-reset'));
    expect(mockReset).toHaveBeenCalled();
  });

  it('disables uploader during upload', () => {
    setupHook({ status: 'uploading' });
    render(<BulkUploadView />);
    expect(screen.getByTestId('file-input')).toBeDisabled();
  });

  it('calls downloadTemplate', () => {
    setupHook();
    render(<BulkUploadView />);
    fireEvent.click(screen.getByTestId('download-template'));
    expect(mockDownloadTemplate).toHaveBeenCalled();
  });
});
