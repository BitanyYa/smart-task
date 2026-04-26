import axios from 'axios';

const base = axios.create({ baseURL: import.meta.env.VITE_API_URL });
const auth = (token: string) => ({ headers: { Authorization: `Bearer ${token}` } });

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

export const fetchProjects  = (token: string) => base.get<Project[]>('/projects', auth(token)).then(r => r.data);
export const createProject  = (token: string, data: { name: string; description?: string; status?: ProjectStatus; dueDate?: string }) =>
  base.post<Project>('/projects', data, auth(token)).then(r => r.data);
export const updateProject  = (token: string, id: string, data: Partial<Project>) =>
  base.patch<Project>(`/projects/${id}`, data, auth(token)).then(r => r.data);
export const deleteProject  = (token: string, id: string) => base.delete(`/projects/${id}`, auth(token));
export const togglePin      = (token: string, id: string) => base.patch<Project>(`/projects/${id}/pin`, {}, auth(token)).then(r => r.data);
