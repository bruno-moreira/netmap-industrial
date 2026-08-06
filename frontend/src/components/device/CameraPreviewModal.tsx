import { Camera, RefreshCw, X } from 'lucide-react';
import type { Device } from '@/types/network';

interface CameraPreviewModalProps {
  device: Device;
  onClose: () => void;
  onRefresh: (id: number) => void;
  isRefreshing: boolean;
  refreshError?: string | null;
}

export function CameraPreviewModal({
  device,
  onClose,
  onRefresh,
  isRefreshing,
  refreshError,
}: CameraPreviewModalProps) {
  const meta = (device.metadata as any) || {};

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 dark:bg-black/80 p-4 backdrop-blur-sm">
      <div className="relative max-w-3xl w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-2xl space-y-4 transition-colors">
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
          <div>
            <h3 className="font-semibold text-slate-900 dark:text-white text-lg flex items-center gap-2">
              <Camera className="h-5 w-5 text-cyan-600 dark:text-cyan-400" />
              {device.name}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              IP: {device.ip_address || 'N/A'} | Local: {device.location || 'N/A'}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-950 overflow-hidden flex items-center justify-center min-h-[300px]">
          {meta.image_url ? (
            <img
              src={meta.image_url}
              alt={device.name}
              className="w-full max-h-[500px] object-contain"
            />
          ) : (
            <p className="text-slate-500 text-sm">Sem snapshot capturado.</p>
          )}
        </div>

        <div className="flex items-center justify-between text-xs text-slate-600 dark:text-slate-400">
          <span>
            Última captura:{' '}
            {meta.last_snapshot_at
              ? new Date(meta.last_snapshot_at).toLocaleString()
              : 'N/A'}
          </span>

          <button
            type="button"
            onClick={() => onRefresh(device.id)}
            disabled={isRefreshing || !device.ip_address}
            className="flex items-center gap-2 rounded-lg bg-cyan-600 px-3 py-2 text-xs font-medium text-white hover:bg-cyan-500 disabled:opacity-50 transition-colors"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
            {isRefreshing ? 'Buscando snapshot...' : 'Atualizar Snapshot ao Vivo'}
          </button>
        </div>

        {refreshError && (
          <p className="text-xs text-red-600 dark:text-red-400 border border-red-200 dark:border-red-900/50 bg-red-50 dark:bg-red-950/30 p-2 rounded">
            {refreshError}
          </p>
        )}
      </div>
    </div>
  );
}
