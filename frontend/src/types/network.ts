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

export interface DeviceMetadata {
  image_url?: string;
  snapshot_url?: string;
  camera_username?: string;
  camera_password?: string;
  last_snapshot_at?: string;
  [key: string]: unknown;
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
  metadata?: DeviceMetadata;
  connected_switch_id?: number;
  connected_switch_name?: string;
  connected_port_number?: number;
}

export interface Switch {
  id: number;
  name: string;
  ip_address?: string;
  brand?: string;
  model?: string;
  rack_id?: string;
  location?: string;
  snmp_community?: string;
  snmp_version?: 'v1' | 'v2c' | 'v3';
  snmp_user?: string;
  snmp_auth_protocol?: 'md5' | 'sha' | 'sha224' | 'sha256' | 'sha384' | 'sha512' | null;
  snmp_auth_password?: string;
  snmp_priv_protocol?: 'des' | 'aes' | 'aes256b' | 'aes256r' | null;
  snmp_priv_password?: string;
  port_count?: number;
  uplink_count?: number;
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
  port_type?: 'access' | 'hybrid' | 'trunk';
  untagged_vlan_id?: number;
  untagged_vlan_number?: number;
  untagged_vlan_name?: string;
  untagged_vlan_color?: string;
  tagged_vlan_ids?: number[];
  mac_address?: string;
  connected_device_id?: number;
  device_name?: string;
  device_ip?: string;
  device_mac?: string;
  device_location?: string;
  device_status?: DeviceStatus;
  device_type_name?: string;
  device_type_color?: string;
  connected_switch_id?: number;
  connected_switch_name?: string;
  connected_switch_ip?: string;
  connected_switch_location?: string;
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
  port_type?: 'access' | 'hybrid' | 'trunk';
  untagged_vlan_id?: number | null;
  tagged_vlan_ids?: number[];
  mac_address?: string | null;
  connected_device_id?: number | null;
  connected_switch_id?: number | null;
  label?: string | null;
}

export interface CreateDevicePayload {
  device_type_id: number;
  name: string;
  ip_address?: string;
  mac_address?: string;
  location?: string;
  status?: DeviceStatus;
  metadata?: DeviceMetadata;
}

export interface CreateVlanPayload {
  vlan_number: number;
  name: string;
  color?: string;
  description?: string;
}

export interface CreateSwitchPayload {
  name: string;
  ip_address?: string;
  brand?: string;
  model?: string;
  rack_id?: string;
  location?: string;
  snmp_community?: string;
  snmp_version?: 'v1' | 'v2c' | 'v3';
  snmp_user?: string;
  snmp_auth_protocol?: 'md5' | 'sha' | 'sha224' | 'sha256' | 'sha384' | 'sha512' | null;
  snmp_auth_password?: string;
  snmp_priv_protocol?: 'des' | 'aes' | 'aes256b' | 'aes256r' | null;
  snmp_priv_password?: string;
  port_count?: number;
  uplink_count?: number;
}
