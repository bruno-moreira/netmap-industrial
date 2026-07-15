import { useState } from 'react';
import { X, Search, CheckCircle, AlertTriangle, Loader2 } from 'lucide-react';
import { scanApi } from '@/services/api';
import { useQueryClient } from '@tanstack/react-query';

interface Props {
  switchId: number;
  onClose: () => void;
}

export function SwitchSnmpScanModal({ switchId, onClose }: Props) {
  const queryClient = useQueryClient();
  const [loading, setLoading] = useState(false);
  const [applying, setApplying] = useState(false);
  const [error, setError] = useState('');
  const [scanResult, setScanResult] = useState<any>(null);

  async function handleScan(applyToDb = false) {
    if (applyToDb) {
      setApplying(true);
    } else {
      setLoading(true);
    }
    setError('');

    try {
      const data = await scanApi.scanSwitch(switchId, applyToDb);
      setScanResult(data);
      if (applyToDb) {
        // Invalidate switch query to refresh ports on screen
        queryClient.invalidateQueries({ queryKey: ['switch', String(switchId)] });
      }
    } catch (err: any) {
      setError(err.response?.data?.error || err.message || 'Erro ao comunicar com o switch');
    } finally {
      setLoading(false);
      setApplying(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
      <div className="w-full max-w-2xl rounded-2xl border border-slate-700 bg-slate-900 shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-800 p-5">
          <h2 className="text-lg font-semibold text-white flex items-center gap-2">
            <Search className="w-5 h-5 text-cyan-400" />
            Descoberta SNMP (VLANs)
          </h2>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-6">
          {!scanResult && !loading && !error && (
            <div className="text-center py-8">
              <p className="text-slate-400 mb-6">
                Este processo conectará no switch via SNMP (utilizando a versão e credenciais configuradas no equipamento) e lerá a configuração atual de Portas e VLANs Nativas (PVID).
              </p>
              <button
                onClick={() => handleScan(false)}
                className="inline-flex items-center gap-2 rounded-lg bg-cyan-600 px-6 py-2.5 text-sm font-medium text-white hover:bg-cyan-500 transition-colors"
              >
                <Search className="h-4 w-4" />
                Iniciar Verificação
              </button>
            </div>
          )}

          {loading && (
            <div className="flex flex-col items-center justify-center py-12 gap-4">
              <Loader2 className="w-10 h-10 text-cyan-500 animate-spin" />
              <p className="text-slate-400">Comunicando com o equipamento...</p>
            </div>
          )}

          {error && (
            <div className="rounded-lg bg-red-950/50 p-4 border border-red-900/50 flex gap-3">
              <AlertTriangle className="w-5 h-5 text-red-500 flex-shrink-0" />
              <p className="text-red-300 text-sm">{error}</p>
            </div>
          )}

          {scanResult && !loading && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-sm text-emerald-400 flex items-center gap-2">
                  <CheckCircle className="w-4 h-4" />
                  {scanResult.message}
                </p>
                
                {!scanResult.applied && scanResult.ports?.length > 0 && (
                  <button
                    onClick={() => handleScan(true)}
                    disabled={applying}
                    className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-500 disabled:opacity-50 transition-colors"
                  >
                    {applying ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
                    Aplicar/Sincronizar no Banco
                  </button>
                )}
              </div>

              {scanResult.ports?.length > 0 ? (
                <div className="max-h-96 overflow-y-auto rounded-lg border border-slate-800 bg-slate-950">
                  <table className="w-full text-left text-sm text-slate-300">
                    <thead className="sticky top-0 bg-slate-900 text-xs font-semibold uppercase text-slate-400 shadow">
                      <tr>
                        <th className="px-4 py-3">Índice (SNMP)</th>
                        <th className="px-4 py-3">Nome da Porta (ifDescr)</th>
                        <th className="px-4 py-3">VLAN (PVID)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/50">
                      {scanResult.ports.map((port: any) => (
                        <tr key={port.portIndex} className="hover:bg-slate-800/30 transition-colors">
                          <td className="px-4 py-2 text-slate-500 font-mono">{port.portIndex}</td>
                          <td className="px-4 py-2 font-medium text-slate-200">{port.portName}</td>
                          <td className="px-4 py-2">
                            <span 
                              className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium border"
                              style={{
                                backgroundColor: port.vlanColor ? `${port.vlanColor}1A` : '#1e293b', // 1A is 10% opacity in hex
                                borderColor: port.vlanColor || '#334155',
                                color: port.vlanColor || '#22d3ee'
                              }}
                            >
                              {port.vlanName ? `VLAN ${port.vlan} (${port.vlanName})` : `VLAN ${port.vlan}`}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-slate-500 text-sm text-center py-4">
                  Nenhuma porta descoberta. Verifique se as OIDs do equipamento conferem.
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
