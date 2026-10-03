import api from './api';
import { AnalyticsData } from '../types';

export interface DeadlineCenterData {
  due_today: any[];
  due_this_week: any[];
  upcoming: any[];
  completed: any[];
  total_active_deadlines: number;
}

export const analyticsApi = {
  getDashboard: async (): Promise<AnalyticsData> => {
    const res = await api.get<AnalyticsData>('/analytics/dashboard');
    return res.data;
  },

  getDeadlineCenter: async (): Promise<DeadlineCenterData> => {
    const res = await api.get<DeadlineCenterData>('/deadlines');
    return res.data;
  },
};
