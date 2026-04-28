import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import type { User } from '../types/task';
import * as api from '../api/auth';

type AuthCtx = {
  user: User | null;
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  updateUser: (updatedUser: User) => void;
  loading: boolean;
};

const AuthContext = createContext<AuthCtx>({} as AuthCtx);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser]   = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);

  // Attempt silent refresh using stored refresh token
  const tryRefresh = async (): Promise<string | null> => {
    const rt = localStorage.getItem('refreshToken');
    if (!rt) return null;
    try {
      const data = await api.refreshAccessToken(rt);
      localStorage.setItem('token', data.token);
      localStorage.setItem('refreshToken', data.refreshToken);
      setToken(data.token);
      return data.token;
    } catch {
      localStorage.removeItem('token');
      localStorage.removeItem('refreshToken');
      setToken(null);
      return null;
    }
  };

  useEffect(() => {
    const init = async () => {
      let t = localStorage.getItem('token');
      if (!t) {
        // Try refresh even without access token
        t = await tryRefresh();
      }
      if (t) {
        try {
          const u = await api.getMe(t);
          setUser(u);
          setToken(t);
        } catch {
          // Access token expired — try refresh
          const newToken = await tryRefresh();
          if (newToken) {
            try {
              const u = await api.getMe(newToken);
              setUser(u);
            } catch {
              setUser(null);
            }
          } else {
            setUser(null);
          }
        }
      }
      setLoading(false);
    };
    init();
  }, []);

  const login = async (email: string, password: string) => {
    const data = await api.login(email, password);
    localStorage.setItem('token', data.token);
    localStorage.setItem('refreshToken', data.refreshToken);
    setToken(data.token);
    setUser(data.user);
  };

  const register = async (name: string, email: string, password: string) => {
    const data = await api.register(name, email, password);
    localStorage.setItem('token', data.token);
    localStorage.setItem('refreshToken', data.refreshToken);
    setToken(data.token);
    setUser(data.user);
  };

  const logout = () => {
    const rt = localStorage.getItem('refreshToken');
    if (rt) api.logout(rt).catch(() => {});
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    setToken(null);
    setUser(null);
  };

  const updateUser = (updatedUser: User) => {
    setUser(updatedUser);
  };

  return (
    <AuthContext.Provider value={{ user, token, login, register, logout, updateUser, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
