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

export function getPortInlineStyle(port: SwitchPort): CSSProperties | undefined {
  const isSpecial = port.port_type === 'trunk' || port.port_type === 'hybrid';
  if (isSpecial) return undefined;

  const color = port.display_color || port.untagged_vlan_color;
  if (!color) return undefined;

  if (port.status === 'free') {
    // Fundo transparente com borda e texto na cor da VLAN
    return {
      backgroundColor: `${color}20`, // 12% opacity
      borderColor: color,
      color: color,
    };
  }

  // Se estiver conectada, fundo sólido
  return { 
    backgroundColor: color,
    borderColor: color,
    color: '#fff' 
  };
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
