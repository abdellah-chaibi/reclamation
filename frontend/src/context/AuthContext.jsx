import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authService } from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // ─── Internal logout (no API call) ────────────────────────────────────────
  const clearAuth = useCallback(() => {
    localStorage.removeItem('token');
    setUser(null);
  }, []);

  // ─── Re-hydrate on mount only (not on every token change) ─────────────────
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      authService.getCurrentUser()
        .then((res) => setUser(res.data))
        .catch(() => clearAuth())
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // ← run once on mount only

  // ─── Listen for 401 events fired by the Axios interceptor ─────────────────
  useEffect(() => {
    const handle = () => clearAuth();
    window.addEventListener('auth:logout', handle);
    return () => window.removeEventListener('auth:logout', handle);
  }, [clearAuth]);

  // ─── Auth actions ──────────────────────────────────────────────────────────
  const login = async (credentials) => {
    const res = await authService.login(credentials);
    const { token: newToken, user: newUser } = res.data;
    localStorage.setItem('token', newToken);
    setUser(newUser);
    return newUser;
  };

  const register = async (data) => {
    const res = await authService.register(data);
    const { token: newToken, user: newUser } = res.data;
    localStorage.setItem('token', newToken);
    setUser(newUser);
    return newUser;
  };

  const logout = async () => {
    try { await authService.logout(); } catch (_) {}
    clearAuth();
  };

  // ─── Role helpers ──────────────────────────────────────────────────────────
  const isAdmin    = () => user?.role === 'admin';
  const isChefDep  = () => user?.role === 'chef_dep';
  const isEmploye  = () => user?.role === 'employe';
  const isCitoyen  = () => user?.role === 'citoyen';

  return (
    <AuthContext.Provider value={{
      user,
      token: localStorage.getItem('token'),
      loading,
      login,
      register,
      logout,
      isAdmin,
      isChefDep,
      isEmploye,
      isCitoyen,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
