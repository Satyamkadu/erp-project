import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authApi, usersApi } from '../api';

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

const normalizeRole = (role) => {
  if (!role) return null;
  // Handle role as object { role_name: "System Admin" } or string "System Admin"
  if (typeof role === 'object' && role.role_name) {
    return { role_name: role.role_name };
  }
  if (typeof role === 'string') {
    return { role_name: role };
  }
  return null;
};

const normalizeEmployeeData = (data) => {
  // Handle both regular employee response (has user_details) and superuser fallback (has user)
  const userData = data.user_details || data.user;
  if (!userData) return null;

  const role = normalizeRole(userData.role);
  
  return {
    public_id: data.public_id,
    user: {
      public_id: userData.public_id,
      username: userData.username,
      email: userData.email,
      role: role,
    },
    first_name: data.first_name || userData.first_name || 'System',
    last_name: data.last_name || userData.last_name || 'Admin',
    email: data.email || userData.email || '',
    phone: data.phone || '',
    hire_date: data.hire_date,
    employment_status: data.employment_status || 'Active',
    job_title: data.job_title || 'System Administrator',
    department: data.department || null,
    manager: data.manager || null,
    user_details: userData, // Keep original for compatibility
  };
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null);
  const [employee, setEmployee] = useState(null);
  const [loading, setLoading] = useState(true);
  const [initialized, setInitialized] = useState(false);

  const fetchProfile = useCallback(async () => {
    const accessToken = localStorage.getItem('access_token');
    if (!accessToken) {
      setLoading(false);
      setInitialized(true);
      return;
    }

    try {
      const response = await authApi.me();
      const normalized = normalizeEmployeeData(response.data);
      
      if (normalized) {
        setEmployee(normalized);
        setUser(normalized.user);
        setRole(normalized.user?.role);
      } else {
        throw new Error('Invalid profile data');
      }
    } catch (error) {
      console.error('Failed to fetch profile:', error);
      localStorage.clear();
      setUser(null);
      setRole(null);
      setEmployee(null);
    } finally {
      setLoading(false);
      setInitialized(true);
    }
  }, []);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  const login = async (credentials) => {
    const response = await authApi.login(credentials);
    const { access, refresh } = response.data;
    
    localStorage.setItem('access_token', access);
    localStorage.setItem('refresh_token', refresh);
    
    await fetchProfile();
    return response.data;
  };

  const logout = () => {
    localStorage.clear();
    setUser(null);
    setRole(null);
    setEmployee(null);
  };

  const refreshProfile = fetchProfile;

  const hasRole = (allowedRoles) => {
    if (!role) return false;
    const roleName = role.role_name;
    return allowedRoles.includes(roleName);
  };

  const isSystemAdmin = () => hasRole(['System Admin']);
  const isHRManager = () => hasRole(['HR Manager', 'System Admin']);
  const isProjectManager = () => hasRole(['Department / Project Manager', 'System Admin']);
  const isEmployee = () => hasRole(['Employee', 'Department / Project Manager', 'HR Manager', 'System Admin']);

  const value = {
    user,
    role,
    employee,
    loading,
    initialized,
    login,
    logout,
    refreshProfile,
    hasRole,
    isSystemAdmin,
    isHRManager,
    isProjectManager,
    isEmployee,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};