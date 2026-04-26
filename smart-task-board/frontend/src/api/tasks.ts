import axios from 'axios';
import type { Task, CreateTaskDto, UpdateTaskDto } from '../types/task';
import { refreshAccessToken } from './auth';

const base = axios.create({ baseURL: import.meta.env.VITE_API_URL });

const auth = (token: string) => ({ headers: { Authorization: `Bearer ${token}` } });

// Auto-refresh on 401
base.interceptors.response.use(
  res => res,
  async (err) => {
    const original = err.config;
    if (err.response?.status === 401 && !original._retry) {
      original._retry = true;
      const rt = localStorage.getItem('refreshToken');
      if (rt) {
        try {
          const data = await refreshAccessToken(rt);
          localStorage.setItem('token', data.token);
          localStorage.setItem('refreshToken', data.refreshToken);
          original.headers['Authorization'] = `Bearer ${data.token}`;
          return base(original);
        } catch {
          localStorage.removeItem('token');
          localStorage.removeItem('refreshToken');
          window.location.href = '/login';
        }
      }
    }
    return Promise.reject(err);
  }
);

export const fetchTasks   = (token: string) => base.get<Task[]>('/tasks', auth(token)).then(r => r.data.map(normalize));
export const fetchTrashed = (token: string) => base.get<Task[]>('/tasks/trash', auth(token)).then(r => r.data.map(normalize));
export const createTask   = (token: string, dto: CreateTaskDto) => base.post<Task>('/tasks', dto, auth(token)).then(r => normalize(r.data));
export const updateTask   = (token: string, id: string, dto: UpdateTaskDto) => base.patch<Task>(`/tasks/${id}`, dto, auth(token)).then(r => normalize(r.data));
export const softDeleteTask  = (token: string, id: string) => base.delete<Task>(`/tasks/${id}`, auth(token)).then(r => normalize(r.data));
export const restoreTask     = (token: string, id: string) => base.post<Task>(`/tasks/${id}/restore`, {}, auth(token)).then(r => normalize(r.data));
export const hardDeleteTask  = (token: string, id: string) => base.delete(`/tasks/${id}/permanent`, auth(token));
export const addComment      = (token: string, id: string, text: string) => base.post(`/tasks/${id}/comments`, { text }, auth(token)).then(r => r.data);
export const deleteComment   = (token: string, id: string, commentId: string) => base.delete(`/tasks/${id}/comments/${commentId}`, auth(token));
export const startTimer      = (token: string, id: string) => base.post<Task>(`/tasks/${id}/timer/start`, {}, auth(token)).then(r => normalize(r.data));
export const stopTimer       = (token: string, id: string) => base.post<Task>(`/tasks/${id}/timer/stop`, {}, auth(token)).then(r => normalize(r.data));

// MongoDB uses _id, normalize to add id field for dnd-kit
const normalize = (t: any): Task => ({ ...t, id: t._id });
