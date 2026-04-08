import { useState } from 'react';
import { CSVUploader } from '../components/admin/CSVUploader';
import { UploadProgress } from '../components/admin/UploadProgress';
import { UploadSummaryPanel } from '../components/admin/UploadSummaryPanel';
import { useBulkUpload } from '../hooks/useBulkUpload';

export function BulkUploadView() {
  const {
    upload,
    status,
    summary,
    progress,
    error,
    reset,
    downloadErrors,
    downloadTemplate,
  } = useBulkUpload();

  const [selectedFileName, setSelectedFileName] = useState<string | undefined>();

  const handleFileSelect = async (file: File) => {
    setSelectedFileName(file.name);
    await upload(file);
  };

  const handleReset = () => {
    reset();
    setSelectedFileName(undefined);
  };

  const isInProgress = status === 'validating' || status === 'uploading' || status === 'processing';

  return (
    <div className="min-h-screen bg-midnight p-8">
      <div className="max-w-2xl mx-auto space-y-8">
        {}
        <div>
          <h1 className="text-2xl font-bold text-white-text flex items-center gap-3">
            <span className="material-symbols-outlined text-3xl text-primary">upload_file</span>
            Carga Masiva de Productos
          </h1>
          <p className="text-silver-text mt-1 text-sm">
            Importa múltiples productos a la vez subiendo un archivo CSV con la plantilla requerida.
          </p>
        </div>

        {}
        {status !== 'completed' && (
          <div className="bg-charcoal border border-white/10 rounded-xl p-6 space-y-5">
            <CSVUploader
              onFileSelect={handleFileSelect}
              isDisabled={isInProgress}
              onDownloadTemplate={downloadTemplate}
            />
          </div>
        )}

        {}
        {(isInProgress || status === 'error') && (
          <div className="bg-charcoal border border-white/10 rounded-xl p-6">
            <UploadProgress
              progress={progress}
              status={status}
              fileName={selectedFileName}
            />
            {error && (
              <p className="mt-3 text-red-400 text-sm flex items-center gap-2">
                <span className="material-symbols-outlined text-base">error</span>
                {error}
              </p>
            )}
            {status === 'error' && (
              <button
                type="button"
                onClick={handleReset}
                className="mt-4 px-4 py-2 rounded-lg border border-white/10 text-silver-text text-sm hover:bg-white/5 transition-colors flex items-center gap-2"
              >
                <span className="material-symbols-outlined text-base">refresh</span>
                Reintentar
              </button>
            )}
          </div>
        )}

        {}
        {status === 'completed' && summary && (
          <UploadSummaryPanel
            summary={summary}
            onDownloadErrors={downloadErrors}
            onReset={handleReset}
          />
        )}
      </div>
    </div>
  );
}
