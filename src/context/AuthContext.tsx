import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UserRole } from '../types';
import { StorageService } from '../services/storageService';
import { initialUsers } from '../data/seedData';

interface AuthContextType {
  currentUser: User | null;
  isAuthenticated: boolean;
  login: (email: string, pass: string) => { success: boolean; message: string; user?: User };
  switchUser: (role: UserRole) => void;
  logout: () => void;
  canManagePrisoners: boolean;
  canManageCells: boolean;
  canManageVisitors: boolean;
  canManageCases: boolean;
  canManageReleases: boolean;
  canManageUsers: boolean;
  canViewReports: boolean;
  canViewAuditLogs: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    return StorageService.getCurrentUser();
  });

  useEffect(() => {
    StorageService.setCurrentUser(currentUser);
  }, [currentUser]);

  const login = (email: string, pass: string) => {
    const cleanEmail = email.trim().toLowerCase();
    const foundUser = initialUsers.find((u) => u.email.toLowerCase() === cleanEmail);

    if (!foundUser) {
      return { success: false, message: 'Invalid credentials. User email not found in prison registry.' };
    }

    // Standard demo password checking
    if (pass.length < 4) {
      return { success: false, message: 'Password is too short. Please enter a valid security password.' };
    }

    setCurrentUser(foundUser);
    return { success: true, message: `Welcome back, ${foundUser.name}`, user: foundUser };
  };

  const switchUser = (role: UserRole) => {
    const found = initialUsers.find((u) => u.role === role);
    if (found) {
      setCurrentUser(found);
    }
  };

  const logout = () => {
    setCurrentUser(null);
  };

  const role = currentUser?.role;

  const value: AuthContextType = {
    currentUser,
    isAuthenticated: !!currentUser,
    login,
    switchUser,
    logout,
    canManagePrisoners: role === 'admin' || role === 'officer',
    canManageCells: role === 'admin' || role === 'officer',
    canManageVisitors: role === 'admin' || role === 'officer',
    canManageCases: role === 'admin' || role === 'officer',
    canManageReleases: role === 'admin' || role === 'officer',
    canManageUsers: role === 'admin',
    canViewReports: role === 'admin' || role === 'officer',
    canViewAuditLogs: role === 'admin',
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
