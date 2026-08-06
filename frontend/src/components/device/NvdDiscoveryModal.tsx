import { useState, useEffect } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { HardDrive, RefreshCw, X, Check, Camera, AlertCircle } from 'lucide-react';
import { devicesApi } from '@/services/api';
import type { Device } from '@/types/network';

interface DiscoveredCamera {
  channel: number;
  name: string;
  ip_address: string;
  mac_address: string;
  enable: boolean;
}

interface NvdDiscoveryModalProps {
  nvdDevice: Device;
  onClose: () => void;
  onSuccess: () => void;
}

export function NvdDiscoveryModal({ nvdDevice, onClose, onSuccess }: NvdDiscoveryModalProps) {
  const [cameras, setCameras] = useState<DiscoveredCamera[]>([]);
  const [selectedChannels, setSelectedChannels] = useState<Set<number>>(new Set());
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [showDebug, setShowDebug] = useState(false);

  const queryClient = useQueryClient();

  const discoverMutation = useMutation({
    mutationFn: () => devicesApi.discoverNvdCameras(nvdDevice.id),
    onSuccess: (data) => {
      setCameras(data.cameras);
      // Seleciona todas ativas por padrão
      const activeChannels = new Set(data.cameras.map((c) => c.channel));
      setSelectedChannels(activeChannels);
      setErrorMsg(null);
    },
    onError: (err: any) => {
      setErrorMsg(err.response?.data?.error || err.response?.data?.message || err.message || 'Falha ao conectar ao NVD.');
    },
  });

  const importMutation = useMutation({
    mutationFn: (selected: DiscoveredCamera[]) =>
      devicesApi.importNvdCameras(nvdDevice.id, selected),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['devices'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      setSuccessMsg(`Sucesso! ${data.imported_count} câmeras importadas e vinculadas ao NVD.`);
      setTimeout(() => {
        onSuccess();
      }, 1500);
    },
    onError: (err: any) => {
      setErrorMsg(err.response?.data?.error || err.response?.data?.message || err.message || 'Erro ao importar câmeras.');
    },
  });

  useEffect(() => {
    discoverMutation.mutate();
  }, [nvdDevice.id]);

  function toggleChannel(channel: number) {
    const next = new Set(selectedChannels);
    if (next.has(channel)) {
      next.delete(channel);
    } else {
      next.add(channel);
    }
    setSelectedChannels(next);
  }

  function toggleAll() {
    if (selectedChannels.size === cameras.length) {
      setSelectedChannels(new Set());
    } else {
      setSelectedChannels(new Set(cameras.map((c) => c.channel)));
    }
  }

  function handleImport() {
    const selected = cameras.filter((c) => selectedChannels.has(c.channel));
    if (selected.length === 0) return;
    importMutation.mutate(selected);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
      <div className="relative max-w-2xl w-full rounded-xl border border-slate-800 bg-slate-900 p-6 shadow-2xl space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div>
            <h3 className="font-semibold text-white text-lg flex items-center gap-2">
              <HardDrive className="h-5 w-5 text-indigo-400" />
              Descoberta Automática de Câmeras
              {discoverMutation.data?.detected_model && (
                <span className="rounded bg-indigo-950 px-2 py-0.5 text-xs text-indigo-300 border border-indigo-800">
                  {discoverMutation.data.detected_model}
                </span>
              )}
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Gravador: <strong className="text-slate-200">{nvdDevice.name}</strong> ({nvdDevice.ip_address || 'IP N/A'})
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1 text-slate-400 hover:bg-slate-800 hover:text-white"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {discoverMutation.isPending ? (
          <div className="py-12 text-center space-y-3">
            <RefreshCw className="h-8 w-8 text-indigo-400 animate-spin mx-auto" />
            <p className="text-slate-300 font-medium text-sm">
              Conectando ao NVD e buscando câmeras configuradas...
            </p>
            <p className="text-xs text-slate-500">
              Consultando API Intelbras Digest Auth em <code className="text-slate-400">/cgi-bin/configManager.cgi</code>
            </p>
          </div>
        ) : errorMsg ? (
          <div className="rounded-lg border border-red-900/60 bg-red-950/30 p-4 space-y-2">
            <div className="flex items-center gap-2 text-red-400 font-medium text-sm">
              <AlertCircle className="h-4 w-4" />
              Não foi possível obter a lista de câmeras do NVD
            </div>
            <p className="text-xs text-slate-300">{errorMsg}</p>
            <div className="pt-2 flex justify-end">
              <button
                type="button"
                onClick={() => discoverMutation.mutate()}
                className="flex items-center gap-2 rounded-lg bg-slate-800 px-3 py-1.5 text-xs text-slate-200 hover:bg-slate-700"
              >
                <RefreshCw className="h-3.5 w-3.5" /> Tentar Novamente
              </button>
            </div>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span>{cameras.length} câmeras encontradas no NVD.</span>
              <button
                type="button"
                onClick={toggleAll}
                className="text-cyan-400 hover:underline"
              >
                {selectedChannels.size === cameras.length ? 'Desmarcar todas' : 'Marcar todas'}
              </button>
            </div>

            <div className="max-h-72 overflow-y-auto rounded-lg border border-slate-800 bg-slate-950">
              <table className="w-full text-xs">
                <thead className="bg-slate-900 text-left text-slate-400 sticky top-0">
                  <tr>
                    <th className="p-2.5 w-10 text-center">
                      <input
                        type="checkbox"
                        checked={cameras.length > 0 && selectedChannels.size === cameras.length}
                        onChange={toggleAll}
                        className="rounded border-slate-700 bg-slate-900 text-cyan-600 focus:ring-0"
                      />
                    </th>
                    <th className="p-2.5">Canal</th>
                    <th className="p-2.5">Nome da Câmera</th>
                    <th className="p-2.5">IP</th>
                    <th className="p-2.5">MAC</th>
                  </tr>
                </thead>
                <tbody>
                  {cameras.map((c) => (
                    <tr
                      key={c.channel}
                      className={`border-t border-slate-800/60 hover:bg-slate-900/40 cursor-pointer ${
                        selectedChannels.has(c.channel) ? 'bg-indigo-950/20' : ''
                      }`}
                      onClick={() => toggleChannel(c.channel)}
                    >
                      <td className="p-2.5 text-center" onClick={(e) => e.stopPropagation()}>
                        <input
                          type="checkbox"
                          checked={selectedChannels.has(c.channel)}
                          onChange={() => toggleChannel(c.channel)}
                          className="rounded border-slate-700 bg-slate-900 text-cyan-600 focus:ring-0"
                        />
                      </td>
                      <td className="p-2.5 font-medium">
                        <span className="inline-flex items-center gap-1 rounded bg-indigo-950/80 px-2 py-0.5 text-indigo-300 border border-indigo-800/40">
                          <Camera className="h-3 w-3" /> CH{c.channel}
                        </span>
                      </td>
                      <td className="p-2 text-slate-200" onClick={(e) => e.stopPropagation()}>
                        <input
                          type="text"
                          value={c.name}
                          onChange={(e) => {
                            const val = e.target.value;
                            setCameras((prev) =>
                              prev.map((item) => (item.channel === c.channel ? { ...item, name: val } : item))
                            );
                          }}
                          className="w-full rounded border border-slate-800 bg-slate-900 px-2 py-1 text-xs text-white focus:border-cyan-500 focus:outline-none"
                        />
                      </td>
                      <td className="p-2 font-mono text-slate-300" onClick={(e) => e.stopPropagation()}>
                        <input
                          type="text"
                          value={c.ip_address}
                          onChange={(e) => {
                            const val = e.target.value;
                            setCameras((prev) =>
                              prev.map((item) => (item.channel === c.channel ? { ...item, ip_address: val } : item))
                            );
                          }}
                          placeholder="10.107.70.x"
                          className="w-full rounded border border-slate-800 bg-slate-900 px-2 py-1 text-xs text-white focus:border-cyan-500 focus:outline-none font-mono"
                        />
                      </td>
                      <td className="p-2 font-mono text-slate-300" onClick={(e) => e.stopPropagation()}>
                        <input
                          type="text"
                          value={c.mac_address}
                          onChange={(e) => {
                            const val = e.target.value;
                            setCameras((prev) =>
                              prev.map((item) => (item.channel === c.channel ? { ...item, mac_address: val } : item))
                            );
                          }}
                          placeholder="AA:BB:CC:DD:EE:FF"
                          className="w-full rounded border border-slate-800 bg-slate-900 px-2 py-1 text-xs text-white focus:border-cyan-500 focus:outline-none font-mono"
                        />
                      </td>
                    </tr>
                  ))}
                  {cameras.length === 0 && (
                    <tr>
                      <td colSpan={5} className="p-6 text-center text-slate-500">
                        Nenhuma câmera encontrada nas configurações deste NVD.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {successMsg && (
              <div className="flex items-center gap-2 rounded-lg bg-emerald-950/40 border border-emerald-800 p-3 text-xs text-emerald-300">
                <Check className="h-4 w-4" /> {successMsg}
              </div>
            )}

            <div className="flex items-center justify-between pt-2">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => discoverMutation.mutate()}
                  className="flex items-center gap-2 rounded-lg border border-slate-800 bg-slate-900 px-3 py-2 text-xs font-medium text-slate-300 hover:bg-slate-800"
                >
                  <RefreshCw className={`h-3.5 w-3.5 ${discoverMutation.isPending ? 'animate-spin' : ''}`} />
                  Recarregar Busca
                </button>
                <button
                  type="button"
                  onClick={() => setShowDebug(!showDebug)}
                  className="text-xs text-slate-400 hover:text-slate-200 underline"
                >
                  {showDebug ? 'Ocultar Diagnóstico' : 'Ver Diagnóstico NVD'}
                </button>
              </div>

              <button
                type="button"
                onClick={handleImport}
                disabled={selectedChannels.size === 0 || importMutation.isPending}
                className="flex items-center gap-2 rounded-lg bg-cyan-600 px-4 py-2 text-xs font-medium text-white hover:bg-cyan-500 disabled:opacity-50"
              >
                {importMutation.isPending ? 'Importando...' : `Importar ${selectedChannels.size} Câmera(s)`}
              </button>
            </div>

            {showDebug && discoverMutation.data?.debug_info && (
              <div className="mt-3 rounded-lg border border-slate-800 bg-slate-950 p-3 max-h-48 overflow-y-auto font-mono text-[10px] text-slate-300">
                <p className="font-bold text-cyan-400 mb-1">Diagnóstico de Resposta CGI Intelbras:</p>
                <pre>{JSON.stringify(discoverMutation.data.debug_info, null, 2)}</pre>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
