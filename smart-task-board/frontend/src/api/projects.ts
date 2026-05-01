import { api } from './auth';

export type ProjectStatus = 'active' | 'on-hold' | 'completed';

export type Project = {
  _id: string;
  name: string;
  description: string;
  status: ProjectStatus;
  progress: number;
  owner: string;
  members: { _id: string; name: string; email: string }[];
  dueDate?: string;
  pinned: boolean;
  iconBg: string;
  accentColor: string;
  createdAt: string;
  updatedAt: string;
};

export const fetchProjects  = () => api.get<Project[]>('/projects').then(r => r.data);
export const createProject  = (data: { name: string; description?: string; status?: ProjectStatus; dueDate?: string }) =>
  api.post<Project>('/projects', data).then(r => r.data);
export const updateProject  = (id: string, data: Partial<Project>) =>
  api.patch<Project>(`/projects/${id}`, data).then(r => r.data);
export const deleteProject  = (id: string) => api.delete(`/projects/${id}`);
export const togglePin      = (id: string) => api.patch<Project>(`/projects/${id}/pin`, {}).then(r => r.data);
