interface UploadProgressProps {
  progress: number;
  status: 'idle' | 'validating' | 'uploading' | 'processing' | 'completed' | 'error';
  fileName?: string;
}

const STATUS_LABELS: Record<string, string> = {
  idle: 'En espera',
  validating: 'Validando cabeceras…',
  uploading: 'Cargando chunks…',
  processing: 'Procesando en el servidor…',
  completed: 'Proceso completado',
  error: 'Se produjo un error',
};

export function UploadProgress({ progress, status, fileName }: UploadProgressProps) {
  const isActive = status !== 'idle' && status !== 'completed' && status !== 'error';
  const isCompleted = status === 'completed';
  const isError = status === 'error';

  const barColor = isError
    ? 'bg-red-500'
    : isCompleted
    ? 'bg-green-500'
    : 'gold-gradient';

  return (
    <div className="space-y-3" role="status" aria-live="polite">
      {fileName && (
        <p className="text-sm text-silver-text truncate">
          <span className="material-symbols-outlined text-base align-middle mr-1">description</span>
          {fileName}
        </p>
      )}

      {}
      <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-500 ${barColor}`}
          style={{ width: `${progress}%` }}
          aria-valuenow={progress}
          aria-valuemin={0}
          aria-valuemax={100}
          role="progressbar"
        />
      </div>

      <div className="flex items-center justify-between text-sm">
        <span className={`flex items-center gap-1 ${isError ? 'text-red-400' : isCompleted ? 'text-green-400' : 'text-silver-text'}`}>
          {isActive && (
            <span className="material-symbols-outlined text-base animate-spin">autorenew</span>
          )}
          {isCompleted && (
            <span className="material-symbols-outlined text-base">check_circle</span>
          )}
          {isError && (
            <span className="material-symbols-outlined text-base">error</span>
          )}
          {STATUS_LABELS[status] ?? status}
        </span>
        <span className="text-silver-text/60">{progress}%</span>
      </div>
    </div>
  );
}
