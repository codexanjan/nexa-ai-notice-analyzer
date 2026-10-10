import api from './api';
import { User } from '../types';

export interface AuthResponse {
  access_token: string;
  token_type: string;
  user: User;
}

export const authApi = {
  googleLogin: async (data: { credential: string; challenge: string; password: string }): Promise<AuthResponse> => {
    return (await api.post<AuthResponse>('/auth/google', data)).data;
  },
  login: async (credentials: { email: string; password: string }): Promise<AuthResponse> => {
    const res = await api.post<AuthResponse>('/auth/login', credentials);
    return res.data;
  },

  register: async (userData: {
    name: string;
    email: string;
    password: string;
    student_id?: string;
    role?: string;
  }): Promise<AuthResponse> => {
    const res = await api.post<AuthResponse>('/auth/register', userData);
    return res.data;
  },

  getMe: async (): Promise<User> => {
    const res = await api.get<User>('/auth/me');
    return res.data;
  },
};
