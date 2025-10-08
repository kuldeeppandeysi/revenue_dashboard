import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Session expiry (24 hours)
  const SESSION_DURATION = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

  // Check for existing session on mount
  useEffect(() => {
    const savedUser = localStorage.getItem('dashboard_user');
    const loginTime = localStorage.getItem('dashboard_login_time');
    
    if (savedUser && loginTime) {
      const now = Date.now();
      const sessionAge = now - parseInt(loginTime);
      
      if (sessionAge < SESSION_DURATION) {
        setUser(savedUser);
        setIsAuthenticated(true);
      } else {
        // Session expired - clear storage
        localStorage.removeItem('dashboard_user');
        localStorage.removeItem('dashboard_login_time');
      }
    }
    setIsLoading(false);
  }, []);

  // Auto logout when session expires
  useEffect(() => {
    if (isAuthenticated) {
      const loginTime = localStorage.getItem('dashboard_login_time');
      if (loginTime) {
        const timeRemaining = SESSION_DURATION - (Date.now() - parseInt(loginTime));
        
        if (timeRemaining > 0) {
          const timeoutId = setTimeout(() => {
            logout();
          }, timeRemaining);
          
          return () => clearTimeout(timeoutId);
        } else {
          logout();
        }
      }
    }
  }, [isAuthenticated]);

  const login = (username) => {
    const now = Date.now();
    setUser(username);
    setIsAuthenticated(true);
    localStorage.setItem('dashboard_user', username);
    localStorage.setItem('dashboard_login_time', now.toString());
  };

  const logout = () => {
    setUser(null);
    setIsAuthenticated(false);
    localStorage.removeItem('dashboard_user');
    localStorage.removeItem('dashboard_login_time');
    // Force page reload to ensure clean state
    window.location.href = '/';
  };

  const value = {
    isAuthenticated,
    user,
    isLoading,
    login,
    logout
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};