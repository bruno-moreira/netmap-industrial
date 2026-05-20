import type { SwitchPort } from '@/types/network';
import { SwitchPortButton } from './SwitchPortButton';

interface SwitchPortGridProps {
  ports: SwitchPort[];
  columns?: number;
  onPortClick: (port: SwitchPort) => void;
}

export function SwitchPortGrid({ ports, columns = 6, onPortClick }: SwitchPortGridProps) {
  const rows: SwitchPort[][] = [];
  for (let i = 0; i < ports.length; i += columns) {
    rows.push(ports.slice(i, i + columns));
  }

  return (
    <div className="space-y-2">
      {rows.map((row, ri) => (
        <div key={ri} className="grid gap-2" style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }}>
          {row.map((port) => (
            <SwitchPortButton key={port.id} port={port} onClick={onPortClick} />
          ))}
        </div>
      ))}
    </div>
  );
}
