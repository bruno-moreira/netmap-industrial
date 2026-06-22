import type { CSSProperties } from 'react';
import type { SwitchPort } from '@/types/network';

/** Classes Tailwind para o botão da porta no grid */
export function getPortColorClass(port: SwitchPort): string {
  if (port.port_type === 'trunk') return 'bg-neutral-900 border-neutral-700 text-white';
  if (port.port_type === 'hybrid') return 'bg-indigo-700 border-indigo-600 text-white';
  if (port.status === 'error') return 'bg-red-500 border-red-600 text-white';
  if (port.status === 'disabled') return 'bg-slate-600 border-slate-500 text-slate-300';
  if (port.status === 'free') return 'bg-slate-400 border-slate-500 text-slate-900';
  if (port.status === 'connected' && !port.connected_device_id && !port.connected_switch_id) {
    return 'bg-amber-400 border-amber-500 text-slate-900';
  }
  if (port.untagged_vlan_color) return 'text-white border-white/30';
  return 'bg-emerald-500 border-emerald-600 text-white';
}

/** Cor inline (hex da VLAN ou regra de status) */
export function getPortInlineStyle(port: SwitchPort): CSSProperties | undefined {
  const isSpecial = port.port_type === 'trunk' || port.port_type === 'hybrid';
  if (port.display_color && port.status === 'connected' && !isSpecial) {
    return { backgroundColor: port.display_color };
  }
  if (port.untagged_vlan_color && port.status === 'connected' && !isSpecial) {
    return { backgroundColor: port.untagged_vlan_color };
  }
  return undefined;
}

export const PORT_STATUS_LABELS: Record<string, string> = {
  free: 'Livre',
  connected: 'Conectada',
  error: 'Erro',
  disabled: 'Desabilitada',
};

export const DEVICE_STATUS_LABELS: Record<string, string> = {
  online: 'Online',
  offline: 'Offline',
  unknown: 'Desconhecido',
  maintenance: 'Manutenção',
};
