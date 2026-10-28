import React, { createContext, useContext, useState, useEffect } from 'react';
import { apiRequest } from '../api/client';

export interface User {
  id: string;
  fullName: string;
  email: string;
  role: 'farmer' | 'buyer';
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<User>;
  register: (payload: { fullName: string; email: string; phone?: string; password: string; role: 'farmer' | 'buyer' }) => Promise<User>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  token: null,
  loading: true,
  login: async () => { throw new Error('Not implemented'); },
  register: async () => { throw new Error('Not implemented'); },
  logout: async () => {},
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(() => {
    try {
      return localStorage.getItem('croprescue_token');
    } catch {
      return null;
    }
  });
  const [loading, setLoading] = useState(true);

  // Restore session
  useEffect(() => {
    async function loadUser() {
      if (!token) {
        setLoading(false);
        return;
      }
      try {
        const data = await apiRequest<{ user: User }>('/api/auth/me');
        setUser(data.user);
      } catch {
        // Token expired or invalid
        localStorage.removeItem('croprescue_token');
        setToken(null);
        setUser(null);
      } finally {
        setLoading(false);
      }
    }
    loadUser();
  }, [token]);

  const login = async (email: string, password: string): Promise<User> => {
    const data = await apiRequest<{ user: User; token: string }>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    localStorage.setItem('croprescue_token', data.token);
    setToken(data.token);
    setUser(data.user);
    return data.user;
  };

  const register = async (payload: {
    fullName: string;
    email: string;
    phone?: string;
    password: string;
    role: 'farmer' | 'buyer';
  }): Promise<User> => {
    const data = await apiRequest<{ user: User; token: string }>('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    localStorage.setItem('croprescue_token', data.token);
    setToken(data.token);
    setUser(data.user);
    return data.user;
  };

  const logout = async () => {
    try {
      await apiRequest('/api/auth/logout', { method: 'POST' });
    } catch {
      // ignore
    } finally {
      localStorage.removeItem('croprescue_token');
      setToken(null);
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth() {
  return useContext(AuthContext);
}
