import type { SwitchPort } from '@/types/network';
import { getPortColorClass, getPortInlineStyle } from '@/utils/colorRules';

interface SwitchPortButtonProps {
  port: SwitchPort;
  onClick: (port: SwitchPort) => void;
}

export function SwitchPortButton({ port, onClick }: SwitchPortButtonProps) {
  const inlineStyle = getPortInlineStyle(port);
  const colorClass = inlineStyle ? 'border-2' : getPortColorClass(port);

  return (
    <button
      type="button"
      onClick={() => onClick(port)}
      title={port.label || `Porta ${port.port_number}`}
      className={`flex aspect-square flex-col items-center justify-center rounded-lg text-xs font-mono shadow-md transition hover:scale-105 hover:ring-2 hover:ring-cyan-400 ${colorClass}`}
      style={inlineStyle}
    >
      <span className="font-bold">{String(port.port_number).padStart(2, '0')}</span>
      {port.vlan_number != null && (
        <span className="mt-0.5 text-[10px] opacity-90">V{port.vlan_number}</span>
      )}
    </button>
  );
}
