export type PortStatus = 'free' | 'connected' | 'error' | 'disabled';
export type DeviceStatus = 'online' | 'offline' | 'unknown' | 'maintenance';
export type UserRole = 'admin' | 'technical';

export interface DashboardStats {
  total_switches: number;
  total_ports: number;
  ports_connected: number;
  ports_free: number;
  ports_error: number;
  devices_online: number;
  devices_offline: number;
  total_vlans: number;
  total_devices: number;
}

export interface Vlan {
  id: number;
  vlan_number: number;
  name: string;
  color: string;
  description?: string;
}

export interface DeviceType {
  id: number;
  slug: string;
  name: string;
  icon?: string;
  color?: string;
}

export interface Device {
  id: number;
  name: string;
  device_type_id: number;
  type_slug?: string;
  type_name?: string;
  type_color?: string;
  ip_address?: string;
  mac_address?: string;
  location?: string;
  status: DeviceStatus;
  metadata?: Record<string, unknown>;
}

export interface Switch {
  id: number;
  name: string;
  ip_address?: string;
  brand?: string;
  model?: string;
  rack_id?: string;
  location?: string;
  port_count?: number;
  ports_total?: number;
  ports_connected?: number;
  ports_free?: number;
  ports?: SwitchPort[];
}

export interface SwitchPort {
  id: number;
  switch_id: number;
  port_number: number;
  status: PortStatus;
  vlan_id?: number;
  vlan_number?: number;
  vlan_name?: string;
  vlan_color?: string;
  mac_address?: string;
  connected_device_id?: number;
  device_name?: string;
  device_ip?: string;
  device_mac?: string;
  device_location?: string;
  device_status?: DeviceStatus;
  device_type_name?: string;
  device_type_color?: string;
  is_trunk?: boolean;
  label?: string;
  display_color?: string;
  switch_name?: string;
  history?: PortHistoryEntry[];
}

export interface PortHistoryEntry {
  id: number;
  action: string;
  old_value: Record<string, unknown>;
  new_value: Record<string, unknown>;
  created_at: string;
}

export interface UpdatePortPayload {
  status?: PortStatus;
  vlan_id?: number | null;
  connected_device_id?: number | null;
  label?: string | null;
  is_trunk?: boolean;
}

export interface CreateDevicePayload {
  device_type_id: number;
  name: string;
  ip_address?: string;
  mac_address?: string;
  location?: string;
  status?: DeviceStatus;
}

export interface CreateVlanPayload {
  vlan_number: number;
  name: string;
  color?: string;
  description?: string;
}
