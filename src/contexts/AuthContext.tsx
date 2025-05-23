
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import * as authService from '../services/authService'; 

export type UserRole = 'admin' | 'salesperson' | 'buyer' | 'financial' | 'professional' | 'consumer';

export interface User {
  id: string;
  email: string;
  name: string;
  username: string;
  role: UserRole; 
  phone?: string;
  company?: string;
  jobTitle?: string;
  avatarUrl?: string;
}

export interface Tenant {
  id: string;
  name: string;
  themePrimaryColor?: string; 
  themePrimaryColorDark?: string;
  themePrimaryColorLight?: string;
  logoUrl?: string; 
  defaultProductMarkup?: number; // Added for general product markup
}

interface AuthContextType {
  currentUser: User | null;
  isLoading: boolean;
  login: (username: string, password: string) => Promise<User>;
  logout: () => Promise<void>;
  updateCurrentUserProfile: (profileData: Partial<Omit<User, 'id' | 'role' | 'email' | 'username'>>) => Promise<User>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true); 

  useEffect(() => {
    const checkAuthState = async () => {
      // const storedUser = authService.getCurrentUser(); 
      // if (storedUser) {
      //   setCurrentUser(storedUser);
      // }
      setIsLoading(false);
    };
    checkAuthState();
  }, []);

  const login = async (username: string, password: string): Promise<User> => {
    setIsLoading(true);
    try {
      const user = await authService.login(username, password); 
      setCurrentUser(user);
      setIsLoading(false);
      return user;
    } catch (error) {
      setIsLoading(false);
      throw error;
    }
  };

  const logout = async (): Promise<void> => {
    setIsLoading(true);
    try {
      await authService.logout();
      setCurrentUser(null);
      setIsLoading(false);
    } catch (error) {
      setIsLoading(false);
      throw error;
    }
  };

  const updateCurrentUserProfile = async (profileData: Partial<Omit<User, 'id' | 'role' | 'email' | 'username'>>): Promise<User> => {
    if (!currentUser) {
      throw new Error("No user currently logged in.");
    }
    setIsLoading(true);
    try {
      // In a real app, this would call an API to update the backend.
      // For mock, we update authService's MOCK_USERS and then the local state.
      const updatedUserFromService = await authService.updateUserProfile(currentUser.id, profileData);
      setCurrentUser(updatedUserFromService); 
      setIsLoading(false);
      return updatedUserFromService;
    } catch (error) {
      setIsLoading(false);
      console.error("Failed to update profile:", error);
      throw error;
    }
  };


  return (
    <AuthContext.Provider value={{ currentUser, isLoading, login, logout, updateCurrentUserProfile }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
