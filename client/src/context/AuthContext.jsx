import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

const tokenKey = 'odc_token';
const userKey = 'odc_user';

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem(tokenKey));
  const [loading, setLoading] = useState(!!token);

  useEffect(() => {
    if (!token) {
      setUser(null);
      setLoading(false);
      return;
    }
    fetch('/api/auth/me', { headers: { Authorization: `Bearer ${token}` } })
      .then((res) => (res.ok ? res.json() : Promise.reject()))
      .then((json) => {
        setUser(json.data);
        localStorage.setItem(userKey, JSON.stringify(json.data));
      })
      .catch(() => {
        setToken(null);
        setUser(null);
        localStorage.removeItem(tokenKey);
        localStorage.removeItem(userKey);
      })
      .finally(() => setLoading(false));
  }, [token]);

  const login = (userData, newToken) => {
    setUser(userData);
    setToken(newToken);
    localStorage.setItem(tokenKey, newToken);
    localStorage.setItem(userKey, JSON.stringify(userData));
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem(tokenKey);
    localStorage.removeItem(userKey);
  };

  const value = { user, token, loading, login, logout, isAuthenticated: !!user };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}

export function getAuthHeaders() {
  const t = localStorage.getItem(tokenKey);
  return t ? { Authorization: `Bearer ${t}` } : {};
}
