
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { getAuth, onAuthStateChanged, User as FirebaseUser, getIdTokenResult } from 'firebase/auth';
import * as authService from '../services/authService'; // authService now uses Firebase
import { getFunctions, httpsCallable, HttpsCallableResult } from 'firebase/functions';


// Define UserRole enum to match backend (ADMIN, DESIGNER, USER)
export enum UserRole {
  ADMIN = "ADMIN",
  DESIGNER = "DESIGNER",
  USER = "USER",
  // Add other roles if necessary, ensure they match Prisma's UserRole enum
}

export interface User {
  id: string; // Firebase UID
  email: string | null;
  name?: string | null;
  username?: string | null; // Consider if username is still needed or if email is primary identifier
  role: UserRole | null; // Role from custom claims or Prisma
  tenantId: string | null; // Tenant ID from custom claims or Prisma
  phone?: string;
  company?: string;
  jobTitle?: string;
  avatarUrl?: string;
  // Any other fields fetched from your Prisma `User` table via `getUserData`
}

// Tenant interface might be better in a separate types file or TenantContext
export interface Tenant {
  id: string;
  name: string;
  themePrimaryColor?: string;
  themePrimaryColorDark?: string;
  themePrimaryColorLight?: string;
  logoUrl?: string;
  defaultProductMarkup?: number;
}

interface AuthContextType {
  currentUser: User | null;
  currentFirebaseUser: FirebaseUser | null; // Store Firebase user object for token refreshes etc.
  isLoading: boolean;
  role: UserRole | null;
  tenantId: string | null;
  login: (email: string, password: string) => Promise<User>; // Changed from username to email
  logout: () => Promise<void>;
  updateCurrentUserProfile: (profileData: Partial<Omit<User, 'id' | 'role' | 'email' | 'username' | 'tenantId'>>) => Promise<User>;
  forceRefreshUserToken: () => Promise<void>; // For refreshing claims after role update
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);
const functions = getFunctions(); // Initialize Firebase Functions

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [currentFirebaseUser, setCurrentFirebaseUser] = useState<FirebaseUser | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [role, setRole] = useState<UserRole | null>(null);
  const [tenantId, setTenantId] = useState<string | null>(null);

  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setIsLoading(true);
      if (firebaseUser) {
        setCurrentFirebaseUser(firebaseUser);
        try {
          const idTokenResult = await firebaseUser.getIdTokenResult(true); // Force refresh to get latest claims
          const claimsRole = idTokenResult.claims.role as UserRole;
          const claimsTenantId = idTokenResult.claims.tenantId as string;

          setRole(claimsRole || null);
          setTenantId(claimsTenantId || null);

          // Fetch additional user data from Prisma via getUserData cloud function
          const getUserDataCallable = httpsCallable(functions, 'getUserData');
          const result: HttpsCallableResult<any> = await getUserDataCallable({ userId: firebaseUser.uid });
          const prismaUserData = result.data as Omit<User, 'id' | 'email' | 'role' | 'tenantId'>; // Prisma data excluding what we get from Firebase

          setCurrentUser({
            id: firebaseUser.uid,
            email: firebaseUser.email,
            name: prismaUserData?.name || firebaseUser.displayName,
            username: prismaUserData?.username || firebaseUser.email, // Use email as fallback for username
            role: claimsRole || (prismaUserData?.role as UserRole) || null, // Prioritize claims, then Prisma
            tenantId: claimsTenantId || (prismaUserData?.tenantId as string) || null, // Prioritize claims
            phone: prismaUserData?.phone,
            company: prismaUserData?.company,
            jobTitle: prismaUserData?.jobTitle,
            avatarUrl: prismaUserData?.avatarUrl || firebaseUser.photoURL,
          });
        } catch (error) {
          console.error("Error fetching user data or claims:", error);
          // Handle error, maybe sign out user if essential data is missing
          setCurrentUser(null);
          setRole(null);
          setTenantId(null);
          setCurrentFirebaseUser(null);
          // Optionally call authService.logout() here
        }
      } else {
        setCurrentUser(null);
        setCurrentFirebaseUser(null);
        setRole(null);
        setTenantId(null);
      }
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);
  
  const forceRefreshUserToken = async () => {
    const firebaseUser = getAuth().currentUser;
    if (firebaseUser) {
      try {
        setIsLoading(true);
        const idTokenResult = await firebaseUser.getIdTokenResult(true); // true forces refresh
        const claimsRole = idTokenResult.claims.role as UserRole;
        const claimsTenantId = idTokenResult.claims.tenantId as string;
        setRole(claimsRole || null);
        setTenantId(claimsTenantId || null);
        
        // Update currentUser state with new claims AND re-fetched Prisma data
        if (currentUser) { // Ensure currentUser and firebaseUser exist
          // Re-fetch Prisma data as it might be dependent on the new role/claims
          const getUserDataCallable = httpsCallable(functions, 'getUserData');
          const result: HttpsCallableResult<any> = await getUserDataCallable({ userId: firebaseUser.uid });
          const prismaUserData = result.data as Omit<User, 'id' | 'email' | 'role' | 'tenantId'>;

          setCurrentUser({
            id: firebaseUser.uid,
            email: firebaseUser.email,
            name: prismaUserData?.name || firebaseUser.displayName,
            username: prismaUserData?.username || firebaseUser.email,
            role: claimsRole || (prismaUserData?.role as UserRole) || null,
            tenantId: claimsTenantId || (prismaUserData?.tenantId as string) || null,
            phone: prismaUserData?.phone,
            company: prismaUserData?.company,
            jobTitle: prismaUserData?.jobTitle,
            avatarUrl: prismaUserData?.avatarUrl || firebaseUser.photoURL,
          });
        }
        console.log("User token, claims, and profile data refreshed.");
      } catch (error) {
        console.error("Error forcing token refresh and profile reload:", error);
        // Potentially sign out if critical error
        if (error instanceof Error && (error.message.includes("User record incomplete") || error.message.includes("User configuration incomplete"))) {
            await authService.logout(); // Use the service for consistency
        }
      } finally {
        setIsLoading(false);
      }
    } else {
      // No user, ensure loading is false if somehow called
      setIsLoading(false);
    }
  };


  const login = async (email: string, password: string): Promise<User> => {
    // authService.login now handles Firebase Auth and fetching Prisma data + claims.
    // The onAuthStateChanged listener will then pick up the new user state.
    setIsLoading(true);
    try {
      // authService.login returns a User object that includes merged data
      // from Firebase Auth, Prisma, and claims.
      // The onAuthStateChanged listener will also set the state, but this gives immediate feedback.
      const user = await authService.login(email, password);
      setCurrentUser(user); // Set immediately for faster UI update
      setRole(user.role);
      setTenantId(user.tenantId);
      // currentFirebaseUser will be set by onAuthStateChanged
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
      await authService.logout(); // This just calls signOut(auth)
      // onAuthStateChanged will handle clearing currentUser, role, tenantId, currentFirebaseUser
    } catch (error) {
      // setIsLoading(false); // onAuthStateChanged will set loading to false
      throw error;
    } finally {
       // Ensure loading is set to false even if logout fails or onAuthStateChanged takes time
       setIsLoading(false); 
    }
  };

  const updateCurrentUserProfile = async (profileData: Partial<Omit<User, 'id' | 'role' | 'email' | 'username' | 'tenantId'>>): Promise<User> => {
    if (!currentUser) throw new Error("No user currently logged in.");
    setIsLoading(true);
    try {
      // This should call a backend function to update Prisma user data.
      // For now, using the existing mock service structure.
      const updatedUserFromService = await authService.updateUserProfile(currentUser.id, profileData);
      setCurrentUser(prevUser => ({ ...prevUser!, ...updatedUserFromService }));
      setIsLoading(false);
      return { ...currentUser, ...updatedUserFromService };
    } catch (error) {
      setIsLoading(false);
      console.error("Failed to update profile:", error);
      throw error;
    }
  };

  return (
    <AuthContext.Provider value={{ currentUser, currentFirebaseUser, isLoading, role, tenantId, login, logout, updateCurrentUserProfile, forceRefreshUserToken }}>
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
