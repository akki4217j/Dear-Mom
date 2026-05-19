import { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '../api/api';

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Check for existing session on mount
  useEffect(() => {
    const loadUser = async () => {
      const token = localStorage.getItem('dearMomToken');
      if (token) {
        try {
          const res = await authAPI.getMe();
          setUser(res.data.user);
        } catch (error) {
          // Token invalid or expired
          localStorage.removeItem('dearMomToken');
          localStorage.removeItem('dearMomUser');
        }
      }
      setLoading(false);
    };
    loadUser();
  }, []);

  const login = async (email, password) => {
    const res = await authAPI.login({ email, password });
    const { token, user: userData } = res.data;
    
    localStorage.setItem('dearMomToken', token);
    localStorage.setItem('dearMomUser', JSON.stringify(userData));
    setUser(userData);
    
    return userData;
  };

  const register = async (formData) => {
    const res = await authAPI.register(formData);
    const { token, user: userData } = res.data;
    
    localStorage.setItem('dearMomToken', token);
    localStorage.setItem('dearMomUser', JSON.stringify(userData));
    setUser(userData);
    
    return userData;
  };

  const logout = () => {
    localStorage.removeItem('dearMomToken');
    localStorage.removeItem('dearMomUser');
    setUser(null);
  };

  const linkPartner = async (partnerCode) => {
    const res = await authAPI.linkPartner(partnerCode);
    // Refresh user data
    const meRes = await authAPI.getMe();
    setUser(meRes.data.user);
    return res.data;
  };

  const value = {
    user,
    loading,
    login,
    register,
    logout,
    linkPartner,
    isAuthenticated: !!user,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
