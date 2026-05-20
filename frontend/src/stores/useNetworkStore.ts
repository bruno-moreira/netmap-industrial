import { create } from 'zustand';
import type { SwitchPort } from '@/types/network';

interface NetworkState {
  selectedPort: SwitchPort | null;
  deviceSearch: string;
  vlanFilter: number | null;
  setSelectedPort: (port: SwitchPort | null) => void;
  setDeviceSearch: (q: string) => void;
  setVlanFilter: (id: number | null) => void;
}

export const useNetworkStore = create<NetworkState>((set) => ({
  selectedPort: null,
  deviceSearch: '',
  vlanFilter: null,
  setSelectedPort: (port) => set({ selectedPort: port }),
  setDeviceSearch: (q) => set({ deviceSearch: q }),
  setVlanFilter: (id) => set({ vlanFilter: id }),
}));
