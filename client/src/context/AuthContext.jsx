import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../api/axios';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedToken = localStorage.getItem('pawcare_token');
    const savedUser = localStorage.getItem('pawcare_user');
    if (savedToken && savedUser) {
      setToken(savedToken);
      setUser(JSON.parse(savedUser));
    }
    setLoading(false);
  }, []);

  const persist = (token, user) => {
    localStorage.setItem('pawcare_token', token);
    localStorage.setItem('pawcare_user', JSON.stringify(user));
    setToken(token);
    setUser(user);
  };

  const register = async (name, email, password, role = 'pet_owner') => {
    const res = await api.post('/auth/register', { name, email, password, role });
    const { token, user } = res.data.data;
    persist(token, user);
    return user;
  };

  const login = async (email, password) => {
    const res = await api.post('/auth/login', { email, password });
    const { token, user } = res.data.data;
    persist(token, user);
    return user;
  };

  const logout = () => {
    localStorage.removeItem('pawcare_token');
    localStorage.removeItem('pawcare_user');
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, register, login, logout }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};

export { AuthContext };
export default AuthContext;
