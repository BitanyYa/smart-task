import axios from 'axios';

const base = axios.create({ baseURL: import.meta.env.VITE_API_URL });
const auth = (token: string) => ({ headers: { Authorization: `Bearer ${token}` } });

export type AppNotification = {
  _id: string;
  type: 'invite_accepted' | 'invite_received' | 'general';
  message: string;
  read: boolean;
  createdAt: string;
};

export const getNotifications = (token: string) =>
  base.get<AppNotification[]>('/notifications', auth(token)).then(r => r.data);

export const markAllRead = (token: string) =>
  base.patch('/notifications/read-all', {}, auth(token)).then(r => r.data);

export const markAsRead = (token: string, id: string) =>
  base.patch(`/notifications/${id}/read`, {}, auth(token)).then(r => r.data);

export const deleteNotification = (token: string, id: string) =>
  base.delete(`/notifications/${id}`, auth(token)).then(r => r.data);
