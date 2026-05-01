import { api } from './auth';
import type { Task, CreateTaskDto, UpdateTaskDto } from '../types/task';

export const fetchTasks   = () => api.get<Task[]>('/tasks').then(r => r.data.map(normalize));
export const fetchTrashed = () => api.get<Task[]>('/tasks/trash').then(r => r.data.map(normalize));
export const createTask   = (dto: CreateTaskDto) => api.post<Task>('/tasks', dto).then(r => normalize(r.data));
export const updateTask   = (id: string, dto: UpdateTaskDto) => api.patch<Task>(`/tasks/${id}`, dto).then(r => normalize(r.data));
export const softDeleteTask  = (id: string) => api.delete<Task>(`/tasks/${id}`).then(r => normalize(r.data));
export const restoreTask     = (id: string) => api.post<Task>(`/tasks/${id}/restore`, {}).then(r => normalize(r.data));
export const hardDeleteTask  = (id: string) => api.delete(`/tasks/${id}/permanent`);
export const addComment      = (id: string, text: string) => api.post(`/tasks/${id}/comments`, { text }).then(r => r.data);
export const deleteComment   = (id: string, commentId: string) => api.delete(`/tasks/${id}/comments/${commentId}`);
export const startTimer      = (id: string) => api.post<Task>(`/tasks/${id}/timer/start`, {}).then(r => normalize(r.data));
export const stopTimer       = (id: string) => api.post<Task>(`/tasks/${id}/timer/stop`, {}).then(r => normalize(r.data));

// MongoDB uses _id, normalize to add id field for dnd-kit
const normalize = (t: any): Task => ({ ...t, id: t._id });
