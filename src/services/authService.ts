
import { getAuth, signInWithEmailAndPassword, signOut, onAuthStateChanged, getIdTokenResult } from 'firebase/auth';
import { getFunctions, httpsCallable } from 'firebase/functions';
import { User, UserRole } from '../contexts/AuthContext'; // Assuming UserRole is defined here or in types
import { Role } from '@prisma/client';

// Initialize Firebase Auth and Functions
const auth = getAuth();
const functions = getFunctions();

// TODO: The User type in AuthContext might need to be updated to include tenantId from claims.
// For now, we'll work with the existing User type and log claims separately.

export interface MockUser {
  id: string;
  email: string;
  name: string;
  role: Role;
  tenantId: string;
  createdAt: Date;
}


export const login = async (emailInput: string, passwordInput: string): Promise<User> => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, emailInput, passwordInput);
    const firebaseUser = userCredential.user;

    // Fetch user data from your backend (Prisma) using the new getUserData function
    const getUserDataCallable = httpsCallable(functions, 'getUserData');
    const result: any = await getUserDataCallable({ userId: firebaseUser.uid });
    // It's possible prismaUserData is null if the user exists in Firebase Auth but not in Prisma DB
    // This can happen if user creation in Prisma failed after Firebase Auth creation.
    const prismaUserData = result.data as User | null; 

    if (!prismaUserData) {
      // If user is not in Prisma, this is a critical issue.
      // Log out the Firebase user to prevent partial login state.
      await signOut(auth);
      console.error(`User ${firebaseUser.uid} exists in Firebase Auth but not in Prisma DB. Logging out.`);
      throw new functions.https.HttpsError("internal", "User record incomplete. Please contact support.");
    }
    
    // Get custom claims
    const idTokenResult = await getIdTokenResult(firebaseUser, true); // true forces refresh of token and claims
    console.log("User claims:", idTokenResult.claims);
    
    const finalRole = (idTokenResult.claims.role as UserRole) || prismaUserData.role;
    const finalTenantId = (idTokenResult.claims.tenantId as string) || prismaUserData.tenantId;

    if (!finalRole || !finalTenantId) {
        // If role or tenantId is still missing after checking claims and Prisma,
        // this indicates an incomplete user setup.
        await signOut(auth);
        console.error(`User ${firebaseUser.uid} is missing role or tenantId. Logging out. Role: ${finalRole}, TenantId: ${finalTenantId}`);
        throw new functions.https.HttpsError("internal", "User configuration incomplete (missing role or tenant). Please contact support.");
    }

    const loggedInUser: User = {
      id: firebaseUser.uid,
      email: firebaseUser.email || prismaUserData.email,
      name: prismaUserData.name,
      username: prismaUserData.username || firebaseUser.email,
      role: finalRole,
      tenantId: finalTenantId,
      phone: prismaUserData.phone,
      company: prismaUserData.company,
      jobTitle: prismaUserData.jobTitle,
      avatarUrl: prismaUserData.avatarUrl,
    };
    
    console.log(`User ${loggedInUser.name} (Role: ${loggedInUser.role}, Tenant: ${loggedInUser.tenantId}) logged in successfully.`);
    return loggedInUser;

  } catch (error: any) {
    // Log the specific Firebase error code for better debugging
    if (error.code) {
      console.error("Firebase login error code:", error.code, "Message:", error.message);
    } else {
      console.error("Login error:", error);
    }
    throw error; // Re-throw the error to be handled by the calling component (LoginPage)
  }
};

export const logout = async (): Promise<void> => {
  try {
    await signOut(auth);
    console.log('User logged out.');
    // AuthContext will handle clearing user state.
  } catch (error) {
    console.error("Logout error: ", error);
    throw error;
  }
};

export const updateUserProfile = (
  userId: string,
  profileData: Partial<Omit<User, 'id' | 'role' | 'email' | 'username' | 'tenantId'>>
): Promise<User> => {
  // This function would now likely call a backend function to update Prisma
  // and potentially Firebase Auth profile if email/name needs to be synced there.
  // For now, it remains a mock for local data.
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const userIndex = MOCK_USERS.findIndex(u => u.id === userId);
      if (userIndex !== -1) {
        MOCK_USERS[userIndex] = { ...MOCK_USERS[userIndex], ...profileData };
        const { password, ...updatedUser } = MOCK_USERS[userIndex];
        resolve(updatedUser);
      } else {
        reject(new Error("User not found for profile update."));
      }
    }, 500);
  });
};

// Placeholder - actual implementation will get from AuthContext
export const getCurrentUserRole = (): string | null => {
  // const user = auth.currentUser;
  // if (user) {
  //   // This would ideally come from AuthContext which gets it from claims
  //   // For now, returning null or a mock value
  // }
  console.warn("getCurrentUserRole is a placeholder and should be implemented via AuthContext.");
  return null;
};

// Placeholder - actual implementation will get from AuthContext
export const getCurrentTenantId = (): string | null => {
  // const user = auth.currentUser;
  // if (user) {
  //   // This would ideally come from AuthContext which gets it from claims
  // }
  console.warn("getCurrentTenantId is a placeholder and should be implemented via AuthContext.");
  return null;
};

export const updateUserRoleOnServer = async (targetUserId: string, newRole: UserRole, tenantId: string): Promise<void> => {
  const updateUserRoleCallable = httpsCallable(functions, 'updateUserRole');
  try {
    await updateUserRoleCallable({ targetUserId, newRole, tenantId });
    console.log(`Role for user ${targetUserId} updated to ${newRole} on server.`);
    // Optionally, force refresh token on the target user if they are currently logged in elsewhere
    // admin.auth().revokeRefreshTokens(targetUserId) - this is a backend operation though.
    // Client side, if the current user is the target user, they might need to re-authenticate or refresh token.
  } catch (error) {
    console.error('Error updating user role on server:', error);
    throw error;
  }
};


// --- The following user management functions are still MOCK and need backend integration ---
// They are not the primary focus of this subtask but are noted for future work.

export const getCurrentUser = (): User | null => {
  // This should be replaced by onAuthStateChanged listener logic that sets user state in AuthContext.
  // For now, it's a simple mock.
  const fbUser = auth.currentUser;
  if (fbUser) {
    // This is a very basic mapping. AuthContext would have richer data.
    return {
      id: fbUser.uid,
      email: fbUser.email || '',
      name: fbUser.displayName || 'Firebase User',
      role: UserRole.USER, // Placeholder, should come from claims/AuthContext
      username: fbUser.email || '', // Placeholder
      // tenantId will come from claims via AuthContext
    };
  }
  return null;
};

const API_DELAY_USER_MGMT = 300;

// Mock fetchUsers - eventually this should call getUsersByTenant
export const fetchUsers = (): Promise<User[]> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const usersToReturn = MOCK_USERS.map(u => {
        const { password, ...user } = u;
        return user;
      });
      resolve(usersToReturn);
    }, API_DELAY_USER_MGMT);
  });
};

// Mock createUser - needs to be refactored for Firebase Auth & Prisma
export const createUser = (userData: Omit<User, 'id'> & {password?: string}): Promise<User> => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (MOCK_USERS.some(u => u.username === userData.username || u.email === userData.email)) {
        reject(new Error("Username or email already exists."));
        return;
      }
      const newUser: MockUser = {
        id: `user-${Date.now()}`,
        ...userData,
        password: userData.password, // Store mock password
      };
      MOCK_USERS.push(newUser);
      const { password, ...userToReturn } = newUser;
      resolve(userToReturn);
    }, API_DELAY_USER_MGMT);
  });
};

// Mock updateUser - needs to be refactored for Firebase Auth & Prisma
export const updateUser = (userId: string, userData: Partial<Omit<User, 'id'>>): Promise<User> => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const userIndex = MOCK_USERS.findIndex(u => u.id === userId);
      if (userIndex !== -1) {
        if (userData.username && MOCK_USERS.some(u => u.id !== userId && u.username === userData.username)) {
          reject(new Error("Username already exists."));
          return;
        }
        if (userData.email && MOCK_USERS.some(u => u.id !== userId && u.email === userData.email)) {
          reject(new Error("Email already exists."));
          return;
        }
        MOCK_USERS[userIndex] = { ...MOCK_USERS[userIndex], ...userData };
        const { password, ...updatedUser } = MOCK_USERS[userIndex];
        resolve(updatedUser);
      } else {
        reject(new Error("User not found for update."));
      }
    }, API_DELAY_USER_MGMT);
  });
};

// Mock deleteUser - needs to be refactored for Firebase Auth & Prisma
export const deleteUser = (userId: string): Promise<{ success: boolean; id: string }> => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const initialLength = MOCK_USERS.length;
      MOCK_USERS = MOCK_USERS.filter(u => u.id !== userId);
      if (MOCK_USERS.length < initialLength) {
        resolve({ success: true, id: userId });
      } else {
        reject(new Error("User not found for deletion."));
      }
    }, API_DELAY_USER_MGMT);
  });
};