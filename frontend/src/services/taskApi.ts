import api from './api';
import { Task } from '../types';

export const taskApi = {
  getTasks: async (status?: string): Promise<Task[]> => {
    const res = await api.get<Task[]>('/tasks', { params: { status } });
    return res.data;
  },

  createTask: async (taskData: {
    title: string;
    notice_id?: string;
    deadline?: string;
    priority?: string;
    status?: string;
  }): Promise<Task> => {
    const res = await api.post<Task>('/tasks', taskData);
    return res.data;
  },

  updateTask: async (id: string, updates: Partial<Task>): Promise<Task> => {
    const res = await api.put<Task>(`/tasks/${id}`, updates);
    return res.data;
  },

  deleteTask: async (id: string): Promise<{ message: string }> => {
    const res = await api.delete(`/tasks/${id}`);
    return res.data;
  },
};
