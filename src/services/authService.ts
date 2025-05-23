
// Mock authentication service
import { User, UserRole } from '../contexts/AuthContext'; 

interface MockUser extends User {
  password?: string; 
}

// Fix: Changed MOCK_USERS from const to let to allow modification for deleteUser functionality.
let MOCK_USERS: MockUser[] = [
  { 
    id: '1', 
    email: 'user@example.com', 
    name: 'Test User', 
    username: 'user', 
    password: 'password123', 
    role: 'professional',
    phone: '555-1234',
    company: 'Design Pros Inc.',
    jobTitle: 'Lead Designer',
    avatarUrl: 'https://lh3.googleusercontent.com/a/ACg8ocL3pBwD2wXAD_0XSLnWe276C5oi5Wvs_xHqhx-LrSbrnjAf3=s96-c' // Placeholder
  },
  { 
    id: '2', 
    email: 'admin@example.com', 
    name: 'Admin User', 
    username: 'admin', 
    password: 'adminpassword', 
    role: 'admin',
    phone: '555-0000',
    company: 'Stitch Design HQ',
    jobTitle: 'System Administrator',
    avatarUrl: 'https://lh3.googleusercontent.com/a/ACg8ocL_2J_jD5dndpsVcClUMucn8EhC_BgA1oQylLSSHPJi2=s96-c' // Placeholder
  },
  { 
    id: '3', 
    email: 'sales@example.com', 
    name: 'Sales Person', 
    username: 'sales', 
    password: 'salespassword', 
    role: 'salesperson',
    phone: '555-5678',
    company: 'Sales Solutions Ltd.',
    jobTitle: 'Sales Executive'
  },
  { 
    id: '4', 
    email: 'client@example.com', 
    name: 'Client User', 
    username: 'client', 
    password: 'clientpassword', 
    role: 'consumer',
    company: 'Home Sweet Home',
  },
];


export const login = (usernameInput: string, passwordInput: string): Promise<User> => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const userFound = MOCK_USERS.find(
        (u: MockUser) => u.username === usernameInput && u.password === passwordInput
      );

      if (userFound) {
        const { password, ...userToReturn } = userFound;
        console.log(`User ${userToReturn.name} (Role: ${userToReturn.role}) logged in successfully.`);
        resolve(userToReturn);
      } else {
        reject(new Error('Invalid username or password.'));
      }
    }, 1000); 
  });
};

export const logout = (): Promise<void> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      console.log('User logged out.');
      resolve();
    }, 500);
  });
};

export const updateUserProfile = (
  userId: string,
  profileData: Partial<Omit<User, 'id' | 'role' | 'email' | 'username'>>
): Promise<User> => {
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
    }, 500); // Simulate network delay
  });
};


export const getCurrentUser = (): User | null => {
  return null; 
};

// User Management Functions
const API_DELAY_USER_MGMT = 300;

export const fetchUsers = (): Promise<User[]> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      // Return users without passwords
      const usersToReturn = MOCK_USERS.map(u => {
        const { password, ...user } = u;
        return user;
      });
      resolve(usersToReturn);
    }, API_DELAY_USER_MGMT);
  });
};

export const createUser = (userData: Omit<User, 'id'> & {password: string}): Promise<User> => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (MOCK_USERS.some(u => u.username === userData.username || u.email === userData.email)) {
        reject(new Error("Username or email already exists."));
        return;
      }
      const newUser: MockUser = {
        id: `user-${Date.now()}`,
        ...userData,
      };
      MOCK_USERS.push(newUser);
      const { password, ...userToReturn } = newUser;
      resolve(userToReturn);
    }, API_DELAY_USER_MGMT);
  });
};

export const updateUser = (userId: string, userData: Partial<Omit<User, 'id'>>): Promise<User> => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const userIndex = MOCK_USERS.findIndex(u => u.id === userId);
      if (userIndex !== -1) {
        // Prevent username/email collision if being changed
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