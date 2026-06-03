import axios from 'axios';
import type {
  CreateDevicePayload,
  CreateVlanPayload,
  DashboardStats,
  Device,
  DeviceType,
  Switch,
  SwitchPort,
  UpdatePortPayload,
  Vlan,
} from '@/types/network';

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
});

export const dashboardApi = {
  getStats: () => api.get<DashboardStats>('/dashboard').then((r) => r.data),
};

export const switchesApi = {
  list: () => api.get<Switch[]>('/switches').then((r) => r.data),
  getById: (id: number) =>
    api.get<Switch>(`/switches/${id}`, { params: { ports: true } }).then((r) => r.data),
  create: (data: CreateDevicePayload) => api.post<Switch>('/switches', data).then((r) => r.data),
  update: (id: number, data: Partial<CreateDevicePayload>) => api.put<Switch>(`/switches/${id}`, data).then((r) => r.data),
  remove: (id: number) => api.delete(`/switches/${id}`),
};

export const portsApi = {
  getById: (id: number) => api.get<SwitchPort>(`/ports/${id}`).then((r) => r.data),
  update: (id: number, data: UpdatePortPayload) =>
    api.put<SwitchPort>(`/ports/${id}`, data).then((r) => r.data),
};

export const devicesApi = {
  list: (params?: { q?: string; type?: string; status?: string }) =>
    api.get<Device[]>('/devices', { params }).then((r) => r.data),
  create: (data: CreateDevicePayload) => api.post<Device>('/devices', data).then((r) => r.data),
  update: (id: number, data: Partial<CreateDevicePayload>) =>
    api.put<Device>(`/devices/${id}`, data).then((r) => r.data),
  remove: (id: number) => api.delete(`/devices/${id}`),
};

export const vlansApi = {
  list: () => api.get<Vlan[]>('/vlans').then((r) => r.data),
  create: (data: CreateVlanPayload) => api.post<Vlan>('/vlans', data).then((r) => r.data),
};

export const deviceTypesApi = {
  list: () => api.get<DeviceType[]>('/device-types').then((r) => r.data),
};
