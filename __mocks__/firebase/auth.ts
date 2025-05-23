// __mocks__/firebase/auth.ts

// Default mock user state
let mockCurrentUser: any = null;
let mockIdTokenResult: any = {
  claims: { role: null, tenantId: null },
  token: 'mock-token',
  // Add other IdTokenResult properties if needed
};

// Mock for onAuthStateChanged listeners
let authStateListeners: Array<(user: any) => void> = [];

export const getAuth = jest.fn(() => ({
  // You can add other auth properties or methods if your components use them
  currentUser: mockCurrentUser,
  onAuthStateChanged: jest.fn((listener) => {
    authStateListeners.push(listener);
    // Immediately call listener with current state
    Promise.resolve().then(() => listener(mockCurrentUser)); 
    // Return an unsubscribe function
    return () => {
      authStateListeners = authStateListeners.filter(l => l !== listener);
    };
  }),
}));

export const signInWithEmailAndPassword = jest.fn((auth, email, password) => {
  return new Promise((resolve, reject) => {
    if (password === 'correctpassword') {
      mockCurrentUser = { 
        uid: 'test-uid', 
        email: email,
        // Add other FirebaseUser properties if needed
        getIdTokenResult: jest.fn(() => Promise.resolve(mockIdTokenResult)),
      };
      resolve({ user: mockCurrentUser });
      // Notify listeners after state change
      authStateListeners.forEach(listener => listener(mockCurrentUser));
    } else if (password === 'throwsError') {
        reject(new Error('Firebase error for testing'));
    } else if (email === 'user-not-found@example.com') {
        const error: any = new Error('User not found.');
        error.code = 'auth/user-not-found';
        reject(error);
    } else {
      const error: any = new Error('Invalid credentials.');
      error.code = 'auth/invalid-credential';
      reject(error);
    }
  });
});

export const createUserWithEmailAndPassword = jest.fn((auth, email, password) => {
  return new Promise((resolve, reject) => {
    if (email === 'existing@example.com') {
      const error: any = new Error('Email already in use.');
      error.code = 'auth/email-already-in-use';
      reject(error);
    } else {
      mockCurrentUser = { 
        uid: 'new-uid-' + Math.random().toString(36).substr(2, 9), 
        email: email,
        getIdTokenResult: jest.fn(() => Promise.resolve(mockIdTokenResult)),
      };
      resolve({ user: mockCurrentUser });
      authStateListeners.forEach(listener => listener(mockCurrentUser));
    }
  });
});

export const signOut = jest.fn(() => {
  return new Promise<void>((resolve) => {
    mockCurrentUser = null;
    resolve();
    authStateListeners.forEach(listener => listener(null));
  });
});

export const getIdTokenResult = jest.fn((user, forceRefresh?: boolean) => {
  if (user) {
    return Promise.resolve(mockIdTokenResult);
  }
  return Promise.reject(new Error("No user provided to getIdTokenResult mock."));
});

// Helper for tests to simulate auth state change
export const __setMockUser = (user: any, claims?: { role?: string, tenantId?: string }) => {
  mockCurrentUser = user ? { 
    ...user, 
    getIdTokenResult: jest.fn(() => Promise.resolve(claims ? { ...mockIdTokenResult, claims } : mockIdTokenResult)) 
  } : null;
  
  if (claims) {
    mockIdTokenResult = { ...mockIdTokenResult, claims };
  }
  // Ensure listeners are called asynchronously to mimic real behavior
  Promise.resolve().then(() => authStateListeners.forEach(listener => listener(mockCurrentUser)));
};

export const __setMockIdTokenResult = (claims: any) => {
  mockIdTokenResult = {
    ...mockIdTokenResult,
    claims: { ...mockIdTokenResult.claims, ...claims },
  };
   // If user exists, update their getIdTokenResult mock
  if (mockCurrentUser) {
    mockCurrentUser.getIdTokenResult = jest.fn(() => Promise.resolve(mockIdTokenResult));
  }
};

export const __clearAuthMocks = () => {
  mockCurrentUser = null;
  mockIdTokenResult = { claims: { role: null, tenantId: null }, token: 'mock-token' };
  authStateListeners = [];
  jest.clearAllMocks(); // Clear Jest's internal mock call counters
};

// Add any other auth functions you use, like sendPasswordResetEmail, updateProfile, etc.
// For onIdTokenChanged, if needed:
// let idTokenListeners: Array<(user: any) => void> = [];
// export const onIdTokenChanged = jest.fn((auth, listener) => {
//   idTokenListeners.push(listener);
//   listener(mockCurrentUser); // Call immediately
//   return () => {
//     idTokenListeners = idTokenListeners.filter(l => l !== listener);
//   };
// });
// And __setMockUser would need to call idTokenListeners too.
