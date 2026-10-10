import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UserRole } from '../types';
import { authApi } from '../services/authApi';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAdmin: boolean;
  isStudent: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: { name: string; email: string; password: string; student_id?: string; role?: UserRole }) => Promise<void>;
  googleLogin: (credential: string, challenge: string, password?: string) => Promise<User>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    try {
      const saved = localStorage.getItem('nexa_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });
  const [token, setToken] = useState<string | null>(() => {
    return localStorage.getItem('nexa_token');
  });
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('nexa_token');
    localStorage.removeItem('nexa_user');
  };

  useEffect(() => {
    const initAuth = async () => {
      const savedToken = localStorage.getItem('nexa_token');
      if (savedToken) {
        try {
          const freshUser = await authApi.getMe();
          setUser(freshUser);
          localStorage.setItem('nexa_user', JSON.stringify(freshUser));
        } catch (err) {
          console.error("Token verification failed, logging out:", err);
          logout();
        }
      }
      setIsLoading(false);
    };
    initAuth();
  }, []);

  const login = async (email: string, password: string) => {
    const res = await authApi.login({ email, password });
    setToken(res.access_token);
    setUser(res.user);
    localStorage.setItem('nexa_token', res.access_token);
    localStorage.setItem('nexa_user', JSON.stringify(res.user));
  };

  const register = async (data: { name: string; email: string; password: string; student_id?: string; role?: UserRole }) => {
    const res = await authApi.register(data);
    setToken(res.access_token);
    setUser(res.user);
    localStorage.setItem('nexa_token', res.access_token);
    localStorage.setItem('nexa_user', JSON.stringify(res.user));
  };

  const googleLogin = async (credential: string, challenge: string, password = '') => {
    const res = await authApi.googleLogin({ credential, challenge, password });
    setToken(res.access_token);
    setUser(res.user);
    localStorage.setItem('nexa_token', res.access_token);
    localStorage.setItem('nexa_user', JSON.stringify(res.user));
    return res.user;
  };

  const isAdmin = user?.role === 'ADMIN';
  const isStudent = user?.role === 'STUDENT' || !user?.role;

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        isAdmin,
        isStudent,
        login,
        googleLogin,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
