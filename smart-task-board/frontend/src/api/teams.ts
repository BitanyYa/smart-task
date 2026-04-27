import axios from 'axios';

const base = axios.create({ baseURL: import.meta.env.VITE_API_URL });
const auth = (token: string) => ({ headers: { Authorization: `Bearer ${token}` } });

export type TeamRole = 'admin' | 'member' | 'guest';

export type TeamMember = {
  user: { _id: string; name: string; email: string; avatar?: string };
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

export const getMyTeam    = (token: string) => base.get<TeamData>('/teams/my', auth(token)).then(r => r.data);
export const inviteMember = (token: string, email: string, role: TeamRole, projectId?: string) => 
  base.post('/teams/my/invite', { email, role, projectId }, auth(token)).then(r => r.data);
export const removeMember = (token: string, userId: string) => base.delete(`/teams/my/members/${userId}`, auth(token)).then(r => r.data);
export const changeRole   = (token: string, userId: string, role: TeamRole) => base.patch(`/teams/my/members/${userId}/role`, { role }, auth(token)).then(r => r.data);
export const renameTeam   = (token: string, name: string) => base.patch('/teams/my', { name }, auth(token)).then(r => r.data);
export const cancelInvite = (token: string, inviteToken: string) => base.delete(`/teams/my/invites/${inviteToken}`, auth(token)).then(r => r.data);
export const addMemberToProject = (token: string, userId: string, projectId: string) => 
  base.post(`/teams/my/members/${userId}/projects/${projectId}`, {}, auth(token)).then(r => r.data);
export const removeMemberFromProject = (token: string, userId: string, projectId: string) => 
  base.delete(`/teams/my/members/${userId}/projects/${projectId}`, auth(token)).then(r => r.data);
