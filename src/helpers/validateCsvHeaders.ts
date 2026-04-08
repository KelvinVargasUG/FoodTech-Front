import Papa from 'papaparse';

export const REQUIRED_HEADERS = [
  'nombre',
  'precio',
  'categoria',
  'estacion',
  'descripcion',
  'estado',
] as const;

export type CsvHeader = (typeof REQUIRED_HEADERS)[number];

export interface CsvValidationResult {
  valid: boolean;
  missingHeaders: string[];
  extraHeaders: string[];
}

export async function validateCsvHeaders(file: File): Promise<CsvValidationResult> {
  return new Promise((resolve, reject) => {
    Papa.parse<string[]>(file, {
      preview: 1,
      header: false,
      skipEmptyLines: true,
      complete(results) {
        const rawHeaders = (results.data[0] ?? []).map((h: string) =>
          String(h).trim().toLowerCase()
        );
        const required = REQUIRED_HEADERS.map((h) => h.toLowerCase());

        const missingHeaders = required.filter((h) => !rawHeaders.includes(h));
        const extraHeaders = rawHeaders.filter((h) => !required.includes(h));

        resolve({
          valid: missingHeaders.length === 0,
          missingHeaders,
          extraHeaders,
        });
      },
      error(err) {
        reject(new Error(`Error al leer el archivo CSV: ${err.message}`));
      },
    });
  });
}
