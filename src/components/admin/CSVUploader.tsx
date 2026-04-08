import { useRef, useState } from 'react';

interface CSVUploaderProps {
  onFileSelect: (file: File) => void;
  isDisabled?: boolean;
  onDownloadTemplate: () => void;
}

const ACCEPTED_MIME = 'text/csv,application/vnd.ms-excel,.csv';
const MAX_FILE_SIZE = 10 * 1024 * 1024; 

export function CSVUploader({ onFileSelect, isDisabled = false, onDownloadTemplate }: CSVUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [sizeError, setSizeError] = useState<string | null>(null);

  const validateAndSelect = (file: File) => {
    if (file.size > MAX_FILE_SIZE) {
      setSizeError(`El archivo "${file.name}" supera el límite de 10 MB.`);
      return;
    }
    setSizeError(null);
    onFileSelect(file);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) validateAndSelect(file);

    if (inputRef.current) inputRef.current.value = '';
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file) validateAndSelect(file);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  return (
    <div className="space-y-4">
      {}
      <div
        role="button"
        tabIndex={isDisabled ? -1 : 0}
        aria-label="Zona de carga de archivo CSV"
        data-testid="csv-drop-zone"
        className={`border-2 border-dashed rounded-xl p-10 text-center transition-all
          ${isDisabled
            ? 'opacity-50 cursor-not-allowed border-white/10'
            : 'cursor-pointer border-primary/40 hover:border-primary/80 hover:bg-primary/5'
          }`}
        onClick={() => !isDisabled && inputRef.current?.click()}
        onKeyDown={(e) => { if (!isDisabled && (e.key === 'Enter' || e.key === ' ')) inputRef.current?.click(); }}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
      >
        <span className="material-symbols-outlined text-5xl text-primary/60 mb-3 block">upload_file</span>
        <p className="text-white-text font-medium">Arrastra tu archivo CSV aquí</p>
        <p className="text-silver-text text-sm mt-1">o haz clic para seleccionarlo</p>
        <p className="text-silver-text/60 text-xs mt-2">Máximo 10 MB · Solo archivos .csv</p>
      </div>

      {sizeError && (
        <p data-testid="upload-size-error" className="text-red-400 text-sm">
          {sizeError}
        </p>
      )}

      <input
        ref={inputRef}
        type="file"
        accept={ACCEPTED_MIME}
        className="hidden"
        onChange={handleChange}
        disabled={isDisabled}
        data-testid="csv-file-input"
      />

      {}
      <button
        type="button"
        data-testid="download-template-btn"
        onClick={onDownloadTemplate}
        className="text-primary text-sm underline hover:text-primary/80 transition-colors flex items-center gap-1"
      >
        <span className="material-symbols-outlined text-base">download</span>
        Descargar plantilla CSV
      </button>
    </div>
  );
}
