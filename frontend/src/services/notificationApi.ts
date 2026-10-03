import api from './api';
import { NotificationItem } from '../types';

export const notificationApi = {
  getNotifications: async (): Promise<NotificationItem[]> => {
    const res = await api.get<NotificationItem[]>('/notifications');
    return res.data;
  },

  markAsRead: async (id: string): Promise<{ message: string }> => {
    const res = await api.put(`/notifications/${id}/read`);
    return res.data;
  },

  markAllAsRead: async (): Promise<{ marked_read: number }> => {
    const res = await api.put('/notifications/read-all');
    return res.data;
  },
};
