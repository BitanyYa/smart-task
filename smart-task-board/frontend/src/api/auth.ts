import axios from 'axios';
import type { User } from '../types/task';

const api = axios.create({ baseURL: import.meta.env.VITE_API_URL });

export const login = (email: string, password: string) =>
  api.post<{ token: string; refreshToken: string; user: User }>('/auth/login', { email, password }).then(r => r.data);

export const register = (name: string, email: string, password: string) =>
  api.post<{ token: string; refreshToken: string; user: User }>('/auth/register', { name, email, password }).then(r => r.data);

export const getMe = (token: string) =>
  api.get<User>('/auth/me', { headers: { Authorization: `Bearer ${token}` } }).then(r => r.data);

export const refreshAccessToken = (refreshToken: string) =>
  api.post<{ token: string; refreshToken: string }>('/auth/refresh', { refreshToken }).then(r => r.data);

export const logout = (refreshToken: string) =>
  api.post('/auth/logout', { refreshToken });
