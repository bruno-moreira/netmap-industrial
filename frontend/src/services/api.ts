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
import { useAuthStore } from '@/stores/useAuthStore';

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
});

api.interceptors.request.use(
  (config) => {
    const { accessToken } = useAuthStore.getState();
    if (accessToken && config.headers) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      useAuthStore.getState().logout();
    }
    return Promise.reject(error);
  }
);

export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterPayload {
  tenantName: string;
  tenantSlug: string;
  userName: string;
  userEmail: string;
  userPassword: string;
}

export interface AuthResponse {
  user: any;
  accessToken: string;
  refreshToken: string;
}

export const authApi = {
  login: (data: LoginPayload) =>
    api.post<AuthResponse>('/auth/login', data).then((r) => r.data),
  register: (data: RegisterPayload) =>
    api.post<AuthResponse>('/auth/register', data).then((r) => r.data),
};

export const dashboardApi = {
  getStats: () => api.get<DashboardStats>('/dashboard').then((r) => r.data),
};

export const switchesApi = {
  list: () => api.get<Switch[]>('/switches').then((r) => r.data),
  getById: (id: number) =>
    api.get<Switch>(`/switches/${id}`, { params: { ports: true } }).then((r) => r.data),
  create: (data: any) => api.post<Switch>('/switches', data).then((r) => r.data),
  update: (id: number, data: any) => api.put<Switch>(`/switches/${id}`, data).then((r) => r.data),
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
  update: (id: number, data: Partial<CreateVlanPayload>) => api.put<Vlan>(`/vlans/${id}`, data).then((r) => r.data),
  remove: (id: number) => api.delete(`/vlans/${id}`),
};

export interface Role {
  id: number;
  name: string;
  slug: string;
  description?: string;
}

export interface User {
  id: number;
  name: string;
  email: string;
  role_id: number;
  role_slug: string;
  role_name: string;
  is_active: boolean;
}

export interface CreateUserPayload {
  name: string;
  email: string;
  password: string;
  roleId: number;
}

export const rolesApi = {
  list: () => api.get<Role[]>('/roles').then((r) => r.data),
};

export const usersApi = {
  list: () => api.get<User[]>('/users').then((r) => r.data),
  getById: (id: number) => api.get<User>(`/users/${id}`).then((r) => r.data),
  create: (data: CreateUserPayload) => api.post<User>('/users', data).then((r) => r.data),
  update: (id: number, data: Partial<CreateUserPayload>) =>
    api.put<User>(`/users/${id}`, data).then((r) => r.data),
  remove: (id: number) => api.delete(`/users/${id}`),
};

export const deviceTypesApi = {
  list: () => api.get<DeviceType[]>('/device-types').then((r) => r.data),
};
