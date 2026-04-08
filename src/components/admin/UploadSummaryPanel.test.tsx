import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { UploadSummaryPanel } from './UploadSummaryPanel';
import type { UploadSummary } from '../../models/BulkUpload';

const buildSummary = (overrides: Partial<UploadSummary> = {}): UploadSummary => ({
  uploadId: 'uid-001',
  uploadStatus: 'UPLOADED',
  processingStatus: 'COMPLETED',
  totalRecords: 10,
  processedRecords: 8,
  failedRecords: 2,
  ...overrides,
});

describe('UploadSummaryPanel', () => {
  it('renders all stat values correctly', () => {
    render(<UploadSummaryPanel summary={buildSummary()} />);

    expect(screen.getByText('10')).toBeDefined(); 
    expect(screen.getByText('8')).toBeDefined();  
    expect(screen.getByText('2')).toBeDefined();  
  });

  it('shows download errors button when failedRecords > 0', () => {
    const onDownloadErrors = vi.fn();
    render(
      <UploadSummaryPanel
        summary={buildSummary({ failedRecords: 3 })}
        onDownloadErrors={onDownloadErrors}
      />
    );

    const btn = screen.getByText(/Descargar reporte/i);
    expect(btn).toBeDefined();
    fireEvent.click(btn);
    expect(onDownloadErrors).toHaveBeenCalledTimes(1);
  });

  it('does NOT show download errors button when failedRecords is 0', () => {
    render(
      <UploadSummaryPanel
        summary={buildSummary({ failedRecords: 0 })}
        onDownloadErrors={vi.fn()}
      />
    );

    expect(screen.queryByText(/Descargar reporte/i)).toBeNull();
  });

  it('calls onReset when "Nueva carga" button is clicked', () => {
    const onReset = vi.fn();
    render(<UploadSummaryPanel summary={buildSummary()} onReset={onReset} />);

    const btn = screen.getByText(/Nueva carga/i);
    fireEvent.click(btn);
    expect(onReset).toHaveBeenCalledTimes(1);
  });

  it('hides "Nueva carga" when onReset is not provided', () => {
    render(<UploadSummaryPanel summary={buildSummary()} />);
    expect(screen.queryByText(/Nueva carga/i)).toBeNull();
  });
});
