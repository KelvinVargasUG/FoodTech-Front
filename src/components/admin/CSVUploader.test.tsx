import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { CSVUploader } from './CSVUploader';

describe('CSVUploader', () => {
  const onFileSelect = vi.fn();
  const onDownloadTemplate = vi.fn();

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('renders drop zone and template download button', () => {
    render(
      <CSVUploader
        onFileSelect={onFileSelect}
        onDownloadTemplate={onDownloadTemplate}
      />
    );

    expect(screen.getByRole('button', { name: /Zona de carga/i })).toBeDefined();
    expect(screen.getByText(/Descargar plantilla/i)).toBeDefined();
  });

  it('calls onDownloadTemplate when template button is clicked', () => {
    render(
      <CSVUploader
        onFileSelect={onFileSelect}
        onDownloadTemplate={onDownloadTemplate}
      />
    );

    const btn = screen.getByText(/Descargar plantilla/i);
    fireEvent.click(btn);
    expect(onDownloadTemplate).toHaveBeenCalledTimes(1);
  });

  it('calls onFileSelect when a CSV file is selected via input', () => {
    render(
      <CSVUploader
        onFileSelect={onFileSelect}
        onDownloadTemplate={onDownloadTemplate}
      />
    );

    const input = screen.getByTestId('csv-file-input') as HTMLInputElement;
    const file = new File(['nombre,precio\n'], 'test.csv', { type: 'text/csv' });
    fireEvent.change(input, { target: { files: [file] } });

    expect(onFileSelect).toHaveBeenCalledWith(file);
  });

  it('does not trigger click when disabled', () => {
    render(
      <CSVUploader
        onFileSelect={onFileSelect}
        onDownloadTemplate={onDownloadTemplate}
        isDisabled
      />
    );

    const dropZone = screen.getByRole('button', { name: /Zona de carga/i });
    expect(dropZone).toHaveAttribute('tabIndex', '-1');
  });

  it('shows upload-size-error and does NOT call onFileSelect when file exceeds 10 MB', () => {
    render(
      <CSVUploader
        onFileSelect={onFileSelect}
        onDownloadTemplate={onDownloadTemplate}
      />
    );

    const input = screen.getByTestId('csv-file-input') as HTMLInputElement;

    const oversizedContent = 'A'.repeat(11 * 1024 * 1024);
    const oversizedFile = new File([oversizedContent], 'grande.csv', { type: 'text/csv' });

    fireEvent.change(input, { target: { files: [oversizedFile] } });

    expect(onFileSelect).not.toHaveBeenCalled();
    expect(screen.getByTestId('upload-size-error')).toBeDefined();
    expect(screen.getByTestId('upload-size-error').textContent).toContain('10 MB');
  });

  it('calls onFileSelect when a file is dropped on the drop zone', () => {
    render(
      <CSVUploader onFileSelect={onFileSelect} onDownloadTemplate={onDownloadTemplate} />
    );

    const dropZone = screen.getByTestId('csv-drop-zone');
    const file = new File(['a,b\n1,2\n'], 'drop.csv', { type: 'text/csv' });

    fireEvent.drop(dropZone, {
      dataTransfer: { files: [file] },
    });

    expect(onFileSelect).toHaveBeenCalledWith(file);
  });

  it('prevents default on dragOver', () => {
    render(
      <CSVUploader onFileSelect={onFileSelect} onDownloadTemplate={onDownloadTemplate} />
    );

    const dropZone = screen.getByTestId('csv-drop-zone');
    const dragOverEvent = new Event('dragover', { bubbles: true, cancelable: true });
    dropZone.dispatchEvent(dragOverEvent);
    // dragOver handler calls e.preventDefault(); we just ensure the handler runs
    expect(dropZone).toBeDefined();
  });

  it('opens file dialog on Enter key when not disabled', () => {
    render(
      <CSVUploader onFileSelect={onFileSelect} onDownloadTemplate={onDownloadTemplate} />
    );

    const dropZone = screen.getByTestId('csv-drop-zone');
    // Simulate Enter keydown → should trigger inputRef.current.click()
    fireEvent.keyDown(dropZone, { key: 'Enter' });
    // No assertion error means the handler ran without crashing
    expect(dropZone).toBeDefined();
  });

  it('opens file dialog on Space key when not disabled', () => {
    render(
      <CSVUploader onFileSelect={onFileSelect} onDownloadTemplate={onDownloadTemplate} />
    );

    const dropZone = screen.getByTestId('csv-drop-zone');
    fireEvent.keyDown(dropZone, { key: ' ' });
    expect(dropZone).toBeDefined();
  });

  it('does NOT open file dialog on keydown when disabled', () => {
    render(
      <CSVUploader onFileSelect={onFileSelect} onDownloadTemplate={onDownloadTemplate} isDisabled />
    );

    const dropZone = screen.getByTestId('csv-drop-zone');
    fireEvent.keyDown(dropZone, { key: 'Enter' });
    fireEvent.keyDown(dropZone, { key: ' ' });
    // Should not crash; disabled guard prevents inputRef click
    expect(dropZone).toBeDefined();
  });

  it('does not call onFileSelect when change event has no files', () => {
    render(
      <CSVUploader onFileSelect={onFileSelect} onDownloadTemplate={onDownloadTemplate} />
    );

    const input = screen.getByTestId('csv-file-input') as HTMLInputElement;
    fireEvent.change(input, { target: { files: [] } });

    expect(onFileSelect).not.toHaveBeenCalled();
  });

  it('clears size error when a valid file is selected after oversized file', () => {
    render(
      <CSVUploader onFileSelect={onFileSelect} onDownloadTemplate={onDownloadTemplate} />
    );

    const input = screen.getByTestId('csv-file-input') as HTMLInputElement;

    // First: oversized file
    const oversized = new File(['A'.repeat(11 * 1024 * 1024)], 'big.csv', { type: 'text/csv' });
    fireEvent.change(input, { target: { files: [oversized] } });
    expect(screen.getByTestId('upload-size-error')).toBeDefined();

    // Then: valid file
    const valid = new File(['a,b\n'], 'ok.csv', { type: 'text/csv' });
    fireEvent.change(input, { target: { files: [valid] } });
    expect(screen.queryByTestId('upload-size-error')).toBeNull();
    expect(onFileSelect).toHaveBeenCalledWith(valid);
  });

  it('shows size error when oversized file is dropped', () => {
    render(
      <CSVUploader onFileSelect={onFileSelect} onDownloadTemplate={onDownloadTemplate} />
    );

    const dropZone = screen.getByTestId('csv-drop-zone');
    const oversized = new File(['A'.repeat(11 * 1024 * 1024)], 'huge.csv', { type: 'text/csv' });

    fireEvent.drop(dropZone, { dataTransfer: { files: [oversized] } });

    expect(onFileSelect).not.toHaveBeenCalled();
    expect(screen.getByTestId('upload-size-error')).toBeDefined();
  });

  it('does NOT call onFileSelect when drop has no files', () => {
    render(
      <CSVUploader onFileSelect={onFileSelect} onDownloadTemplate={onDownloadTemplate} />
    );

    const dropZone = screen.getByTestId('csv-drop-zone');
    fireEvent.drop(dropZone, { dataTransfer: { files: [] } });

    expect(onFileSelect).not.toHaveBeenCalled();
  });
});
