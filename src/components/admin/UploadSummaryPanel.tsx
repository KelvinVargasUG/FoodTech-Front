import type { UploadSummary } from '../../models/BulkUpload';

interface UploadSummaryProps {
  summary: UploadSummary;
  onDownloadErrors?: () => void;
  onReset?: () => void;
}

export function UploadSummaryPanel({ summary, onDownloadErrors, onReset }: UploadSummaryProps) {
  const hasErrors = summary.failedRecords > 0;

  return (
    <div className="bg-charcoal border border-white/10 rounded-xl p-6 space-y-5">
      <h3 data-testid="upload-summary-title" className="text-lg font-semibold text-white-text">Resultado de la carga</h3>

      {}
      <div className="grid grid-cols-3 gap-4">
        <StatCard
          label="Total procesados"
          value={summary.totalRecords}
          icon="table_rows"
          color="text-silver-text"
        />
        <StatCard
          label="Importados"
          value={summary.processedRecords}
          icon="check_circle"
          color="text-green-400"
        />
        <StatCard
          label="Con errores"
          value={summary.failedRecords}
          icon="error"
          color={hasErrors ? 'text-red-400' : 'text-silver-text'}
        />
      </div>

      {}
      <div className="flex gap-3 flex-wrap">
        {hasErrors && onDownloadErrors && (
          <button
            type="button"
            onClick={onDownloadErrors}
            className="px-4 py-2 rounded-lg border border-red-500/40 text-red-400 text-sm hover:bg-red-500/10 transition-colors flex items-center gap-2"
          >
            <span className="material-symbols-outlined text-base">download</span>
            Descargar reporte de errores
          </button>
        )}

        {onReset && (
          <button
            type="button"
            onClick={onReset}
            className="px-4 py-2 rounded-lg border border-white/10 text-silver-text text-sm hover:bg-white/5 transition-colors flex items-center gap-2"
          >
            <span className="material-symbols-outlined text-base">refresh</span>
            Nueva carga
          </button>
        )}
      </div>
    </div>
  );
}

interface StatCardProps {
  label: string;
  value: number;
  icon: string;
  color: string;
}

function StatCard({ label, value, icon, color }: StatCardProps) {
  return (
    <div className="bg-midnight/40 rounded-lg p-4 flex flex-col items-center gap-2">
      <span className={`material-symbols-outlined text-2xl ${color}`}>{icon}</span>
      <span className={`text-2xl font-bold ${color}`}>{value}</span>
      <span className="text-xs text-silver-text/70 text-center">{label}</span>
    </div>
  );
}
