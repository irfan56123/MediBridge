import { createContext, useContext, useState, useEffect } from 'react';
import { authApi } from '@/api/services';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem('hms_user');
    return stored ? JSON.parse(stored) : null;
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('hms_token');
    if (!token) {
      setLoading(false);
      return;
    }
    // Verify token is still valid and refresh user data
    authApi
      .getMe()
      .then((res) => {
        setUser(res.data.data);
        localStorage.setItem('hms_user', JSON.stringify(res.data.data));
      })
      .catch(() => {
        localStorage.removeItem('hms_token');
        localStorage.removeItem('hms_user');
        setUser(null);
      })
      .finally(() => setLoading(false));
  }, []);

  const login = async (email, password) => {
    const res = await authApi.login({ email, password });
    const data = res.data.data;
    localStorage.setItem('hms_token', data.token);
    localStorage.setItem('hms_user', JSON.stringify(data));
    setUser(data);
    return data;
  };

  const register = async (payload) => {
    const res = await authApi.register(payload);
    const data = res.data.data;
    localStorage.setItem('hms_token', data.token);
    localStorage.setItem('hms_user', JSON.stringify(data));
    setUser(data);
    return data;
  };

  const logout = () => {
    localStorage.removeItem('hms_token');
    localStorage.removeItem('hms_user');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, setUser, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
