import { describe, it, expect, vi, beforeEach } from 'vitest';
import { validateCsvHeaders, REQUIRED_HEADERS } from './validateCsvHeaders';

type ParseOptions = {
  complete: (result: { data: string[][] }) => void;
  error?: (error: { message: string }) => void;
};

// Mock papaparse
vi.mock('papaparse', () => ({
  default: {
    parse: vi.fn(),
  },
}));

import Papa from 'papaparse';
const mockPapa = vi.mocked(Papa);

describe('validateCsvHeaders', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('exports REQUIRED_HEADERS with expected values', () => {
    expect(REQUIRED_HEADERS).toEqual([
      'nombre', 'precio', 'categoria', 'estacion', 'descripcion', 'estado',
    ]);
  });

  it('returns valid when all required headers are present', async () => {
    mockPapa.parse.mockImplementation((_file: File, options: ParseOptions) => {
      options.complete({
        data: [['nombre', 'precio', 'categoria', 'estacion', 'descripcion', 'estado']],
      });
    });

    const file = new File([''], 'test.csv');
    const result = await validateCsvHeaders(file);

    expect(result.valid).toBe(true);
    expect(result.missingHeaders).toEqual([]);
    expect(result.extraHeaders).toEqual([]);
  });

  it('returns invalid with missing headers', async () => {
    mockPapa.parse.mockImplementation((_file: File, options: ParseOptions) => {
      options.complete({
        data: [['nombre', 'precio']],
      });
    });

    const file = new File([''], 'test.csv');
    const result = await validateCsvHeaders(file);

    expect(result.valid).toBe(false);
    expect(result.missingHeaders).toContain('categoria');
    expect(result.missingHeaders).toContain('estacion');
    expect(result.missingHeaders).toContain('descripcion');
    expect(result.missingHeaders).toContain('estado');
  });

  it('reports extra headers', async () => {
    mockPapa.parse.mockImplementation((_file: File, options: ParseOptions) => {
      options.complete({
        data: [['nombre', 'precio', 'categoria', 'estacion', 'descripcion', 'estado', 'extra_col']],
      });
    });

    const file = new File([''], 'test.csv');
    const result = await validateCsvHeaders(file);

    expect(result.valid).toBe(true);
    expect(result.extraHeaders).toContain('extra_col');
  });

  it('trims and lowercases headers', async () => {
    mockPapa.parse.mockImplementation((_file: File, options: ParseOptions) => {
      options.complete({
        data: [['  Nombre  ', ' PRECIO ', 'Categoria', 'ESTACION', 'Descripcion', 'Estado']],
      });
    });

    const file = new File([''], 'test.csv');
    const result = await validateCsvHeaders(file);

    expect(result.valid).toBe(true);
    expect(result.missingHeaders).toEqual([]);
  });

  it('handles empty CSV (no headers)', async () => {
    mockPapa.parse.mockImplementation((_file: File, options: ParseOptions) => {
      options.complete({ data: [[]] });
    });

    const file = new File([''], 'test.csv');
    const result = await validateCsvHeaders(file);

    expect(result.valid).toBe(false);
    expect(result.missingHeaders).toHaveLength(6);
  });

  it('handles empty data array', async () => {
    mockPapa.parse.mockImplementation((_file: File, options: ParseOptions) => {
      options.complete({ data: [] });
    });

    const file = new File([''], 'test.csv');
    const result = await validateCsvHeaders(file);

    expect(result.valid).toBe(false);
  });

  it('rejects on parse error', async () => {
    mockPapa.parse.mockImplementation((_file: File, options: ParseOptions) => {
      options.error({ message: 'Bad file' });
    });

    const file = new File([''], 'test.csv');
    await expect(validateCsvHeaders(file)).rejects.toThrow('Error al leer el archivo CSV: Bad file');
  });
});
