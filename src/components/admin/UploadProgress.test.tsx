import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { UploadProgress } from './UploadProgress';

describe('UploadProgress', () => {
  it('renders idle status', () => {
    render(<UploadProgress progress={0} status="idle" />);
    expect(screen.getByText('En espera')).toBeInTheDocument();
    expect(screen.getByText('0%')).toBeInTheDocument();
  });

  it('renders validating status with spinner', () => {
    render(<UploadProgress progress={10} status="validating" />);
    expect(screen.getByText('Validando cabeceras…')).toBeInTheDocument();
    expect(screen.getByText('autorenew')).toBeInTheDocument();
  });

  it('renders uploading status', () => {
    render(<UploadProgress progress={50} status="uploading" />);
    expect(screen.getByText('Cargando chunks…')).toBeInTheDocument();
    expect(screen.getByText('50%')).toBeInTheDocument();
  });

  it('renders processing status', () => {
    render(<UploadProgress progress={85} status="processing" />);
    expect(screen.getByText('Procesando en el servidor…')).toBeInTheDocument();
  });

  it('renders completed status with check icon', () => {
    render(<UploadProgress progress={100} status="completed" />);
    expect(screen.getByText('Proceso completado')).toBeInTheDocument();
    expect(screen.getByText('check_circle')).toBeInTheDocument();
  });

  it('renders error status with error icon', () => {
    render(<UploadProgress progress={40} status="error" />);
    expect(screen.getByText('Se produjo un error')).toBeInTheDocument();
    expect(screen.getByText('error')).toBeInTheDocument();
  });

  it('renders fileName when provided', () => {
    render(<UploadProgress progress={0} status="idle" fileName="products.csv" />);
    expect(screen.getByText('products.csv')).toBeInTheDocument();
  });

  it('does not render fileName when not provided', () => {
    render(<UploadProgress progress={0} status="idle" />);
    expect(screen.queryByText('description')).not.toBeInTheDocument();
  });

  it('renders progressbar with correct width and aria values', () => {
    render(<UploadProgress progress={75} status="uploading" />);
    const progressbar = screen.getByRole('progressbar');
    expect(progressbar).toHaveAttribute('aria-valuenow', '75');
    expect(progressbar).toHaveAttribute('aria-valuemin', '0');
    expect(progressbar).toHaveAttribute('aria-valuemax', '100');
    expect(progressbar).toHaveStyle({ width: '75%' });
  });
});
