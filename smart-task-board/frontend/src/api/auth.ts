import axios from 'axios';
import type { User } from '../types/task';

const getBaseURL = () => {
  const url = import.meta.env.VITE_API_URL || '';
  if (url && !url.startsWith('http')) {
    return `https://${url}`;
  }
  return url;
};

export const api = axios.create({ baseURL: getBaseURL() });

// Request interceptor: add token to headers
api.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Response interceptor: handle token refresh
api.interceptors.response.use(
  res => res,
  async error => {
    const originalRequest = error.config;
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      const rt = localStorage.getItem('refreshToken');
      if (rt) {
        try {
          const { token, refreshToken } = await refreshAccessToken(rt);
          localStorage.setItem('token', token);
          localStorage.setItem('refreshToken', refreshToken);
          originalRequest.headers.Authorization = `Bearer ${token}`;
          return api(originalRequest);
        } catch {
          // Refresh failed — could redirect to login here
        }
      }
    }
    return Promise.reject(error);
  }
);

export const login = (email: string, password: string) =>
  api.post<{ token: string; refreshToken: string; user: User }>('/auth/login', { email, password }).then(r => r.data);

export const register = (name: string, email: string, password: string) =>
  api.post<{ token: string; refreshToken: string; user: User }>('/auth/register', { name, email, password }).then(r => r.data);

export const getMe = (token: string) =>
  api.get<User>('/auth/me', { headers: { Authorization: `Bearer ${token}` } }).then(r => r.data);

export const refreshAccessToken = (refreshToken: string) =>
  axios.post<{ token: string; refreshToken: string }>(`${import.meta.env.VITE_API_URL}/auth/refresh`, { refreshToken }).then(r => r.data);

export const logout = (refreshToken: string) =>
  api.post('/auth/logout', { refreshToken });

export const forgotPassword = (email: string) =>
  api.post('/auth/forgot-password', { email });

export const resetPassword = (data: { token: string; password: string }) =>
  api.post('/auth/reset-password', data);

export const verifyEmail = (token: string) =>
  api.get(`/auth/verify-email?token=${token}`);
