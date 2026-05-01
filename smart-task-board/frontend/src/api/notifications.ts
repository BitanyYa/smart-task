import { api } from './auth';

export type AppNotification = {
  _id: string;
  type: 'invite_accepted' | 'invite_received' | 'general';
  message: string;
  read: boolean;
  createdAt: string;
};

export const getNotifications = () =>
  api.get<AppNotification[]>('/notifications').then(r => r.data);

export const markAllRead = () =>
  api.patch('/notifications/read-all', {}).then(r => r.data);

export const markAsRead = (id: string) =>
  api.patch(`/notifications/${id}/read`, {}).then(r => r.data);

export const deleteNotification = (id: string) =>
  api.delete(`/notifications/${id}`).then(r => r.data);
