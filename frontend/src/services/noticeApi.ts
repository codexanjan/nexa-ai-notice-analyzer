import api from './api';
import { Notice, AIAnalysisResult } from '../types';

export const noticeApi = {
  getNotices: async (params?: {
    category?: string;
    importance?: string;
    urgency?: string;
    search?: string;
    status?: string;
    limit?: number;
  }): Promise<Notice[]> => {
    const res = await api.get<Notice[]>('/notices', { params });
    return res.data;
  },

  getNoticeById: async (id: string): Promise<Notice> => {
    const res = await api.get<Notice>(`/notices/${id}`);
    return res.data;
  },

  uploadNoticeFile: async (file: File): Promise<{
    filename: string;
    extracted_text: string;
    analysis: AIAnalysisResult;
  }> => {
    const formData = new FormData();
    formData.append('file', file);
    const res = await api.post('/notices/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return res.data;
  },

  analyzeNotice: async (content: string, category?: string): Promise<AIAnalysisResult> => {
    const res = await api.post<AIAnalysisResult>('/notices/analyze', { content, category });
    return res.data;
  },

  createNotice: async (noticeData: {
    title: string;
    content: string;
    category?: string;
    department?: string;
    deadline?: string;
    event_date?: string;
    event_time?: string;
    location?: string;
    status?: string;
  }): Promise<Notice> => {
    const res = await api.post<Notice>('/notices', noticeData);
    return res.data;
  },

  updateNotice: async (id: string, updates: Partial<Notice>): Promise<Notice> => {
    const res = await api.put<Notice>(`/notices/${id}`, updates);
    return res.data;
  },

  deleteNotice: async (id: string): Promise<{ message: string }> => {
    const res = await api.delete(`/notices/${id}`);
    return res.data;
  },
};
