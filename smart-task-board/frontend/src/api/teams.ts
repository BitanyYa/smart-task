import { api } from './auth';
import type { User } from '../types/task';

export type TeamRole = 'admin' | 'member' | 'guest';

export type TeamMember = {
  user: User;
  role: TeamRole;
  joinedAt: string;
};

export type Team = {
  _id: string;
  name: string;
  owner: string;
  members: TeamMember[];
  invites: { email: string; role: TeamRole; token: string; projectId?: { _id: string; name: string } }[];
};

export type TeamData = {
  team: Team;
  taskStats: { userId: string; active: number; completed: number }[];
  totalTasks: number;
  overdueTasks: number;
  avgCompletionTime: number;
};

export const getMyTeam    = () => api.get<TeamData>('/teams/my').then(r => r.data);
export const inviteMember = (email: string, role: TeamRole, projectId?: string) => 
  api.post('/teams/my/invite', { email, role, projectId }).then(r => r.data);
export const removeMember = (userId: string) => api.delete(`/teams/my/members/${userId}`).then(r => r.data);
export const changeRole   = (userId: string, role: TeamRole) => api.patch(`/teams/my/members/${userId}/role`, { role }).then(r => r.data);
export const renameTeam   = (name: string) => api.patch('/teams/my', { name }).then(r => r.data);
export const cancelInvite = (inviteToken: string) => api.delete(`/teams/my/invites/${inviteToken}`).then(r => r.data);
export const addMemberToProject = (userId: string, projectId: string) => 
  api.post(`/teams/my/members/${userId}/projects/${projectId}`, {}).then(r => r.data);
export const removeMemberFromProject = (userId: string, projectId: string) => 
  api.delete(`/teams/my/members/${userId}/projects/${projectId}`).then(r => r.data);
