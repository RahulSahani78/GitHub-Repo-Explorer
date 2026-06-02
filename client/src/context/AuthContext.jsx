import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { api, setUnauthorizedHandler, TOKEN_KEY } from '../api/client';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  // 'checking' while we validate an existing token on first load.
  const [status, setStatus] = useState('checking');

  const clearSession = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    setUser(null);
    setStatus('unauthenticated');
  }, []);

  // If any request 401s (e.g. token expired), drop the session globally.
  useEffect(() => {
    setUnauthorizedHandler(() => clearSession());
    return () => setUnauthorizedHandler(null);
  }, [clearSession]);

  // On first mount, restore the session from a stored token if it's still valid.
  useEffect(() => {
    const token = localStorage.getItem(TOKEN_KEY);
    if (!token) {
      setStatus('unauthenticated');
      return;
    }
    api
      .me()
      .then(({ user }) => {
        setUser(user);
        setStatus('authenticated');
      })
      .catch(() => clearSession());
  }, [clearSession]);

  const persist = useCallback(({ user, token }) => {
    localStorage.setItem(TOKEN_KEY, token);
    setUser(user);
    setStatus('authenticated');
  }, []);

  const login = useCallback((data) => api.login(data).then(persist), [persist]);
  const signup = useCallback((data) => api.signup(data).then(persist), [persist]);
  const logout = useCallback(() => clearSession(), [clearSession]);

  return (
    <AuthContext.Provider value={{ user, status, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
}
