import React, { createContext, useState, useEffect, useCallback, useRef } from 'react';
import { User } from '../types';
import { setAccessToken } from '../api/client';
import axios from 'axios';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (token: string, user: User) => void;
  logout: () => void;
  isAdmin: boolean;
  isStaff: boolean;
  isVolunteer: boolean;
  isDonor: boolean;
  canAccessChildren: boolean;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

/** Silent-refresh interval: 14 minutes (access token lives 15 min) */
const REFRESH_INTERVAL_MS = 14 * 60 * 1000;

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const refreshTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // ── Silent Refresh ──────────────────────────────────────────────────
  const silentRefresh = useCallback(async (): Promise<boolean> => {
    try {
      const res = await axios.post('/api/auth/refresh', {}, { withCredentials: true });
      const { access_token, user: userData } = res.data;
      setAccessToken(access_token);
      setToken(access_token);
      setUser(userData);
      return true;
    } catch {
      return false;
    }
  }, []);

  const startRefreshTimer = useCallback(() => {
    if (refreshTimerRef.current) clearInterval(refreshTimerRef.current);
    refreshTimerRef.current = setInterval(async () => {
      const ok = await silentRefresh();
      if (!ok) {
        // Refresh failed — session expired
        setToken(null);
        setUser(null);
        setAccessToken('');
        if (refreshTimerRef.current) clearInterval(refreshTimerRef.current);
      }
    }, REFRESH_INTERVAL_MS);
  }, [silentRefresh]);

  // ── Init: try silent refresh on mount ──────────────────────────────
  useEffect(() => {
    const initAuth = async () => {
      // First, check if we have a token stored in localStorage (migration support)
      const storedToken = localStorage.getItem('benetrack_token');
      if (storedToken) {
        // Migrate: set the in-memory token, remove from localStorage
        setAccessToken(storedToken);
        setToken(storedToken);
        const storedUser = localStorage.getItem('benetrack_user');
        if (storedUser) {
          try { setUser(JSON.parse(storedUser)); } catch { /* ignore */ }
        }
        localStorage.removeItem('benetrack_token');
        localStorage.removeItem('benetrack_user');
        startRefreshTimer();
        setIsLoading(false);
        return;
      }

      // No stored token — try silent refresh via httpOnly cookie
      const ok = await silentRefresh();
      if (ok) {
        startRefreshTimer();
      }
      setIsLoading(false);
    };
    initAuth();

    return () => {
      if (refreshTimerRef.current) clearInterval(refreshTimerRef.current);
    };
  }, [silentRefresh, startRefreshTimer]);

  // ── Login (called from LoginPage after successful /api/auth/login) ─
  const login = (accessToken: string, userData: User) => {
    setAccessToken(accessToken);
    setToken(accessToken);
    setUser(userData);
    startRefreshTimer();
  };

  // ── Logout ─────────────────────────────────────────────────────────
  const logout = async () => {
    try {
      await axios.post('/api/auth/logout', {}, { withCredentials: true });
    } catch { /* ignore */ }
    setAccessToken('');
    setToken(null);
    setUser(null);
    if (refreshTimerRef.current) clearInterval(refreshTimerRef.current);
  };

  const isAdmin = user?.role === 'ADMIN';
  const isStaff = user?.role === 'NGO_STAFF';
  const isVolunteer = user?.role === 'VOLUNTEER';
  const isDonor = user?.role === 'DONOR';
  const canAccessChildren = isAdmin || isStaff;

  return (
    <AuthContext.Provider value={{ user, token, isLoading, login, logout, isAdmin, isStaff, isVolunteer, isDonor, canAccessChildren }}>
      {children}
    </AuthContext.Provider>
  );
};
