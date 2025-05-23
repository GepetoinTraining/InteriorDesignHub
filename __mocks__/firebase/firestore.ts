// __mocks__/firebase/firestore.ts

const mockGetDoc = jest.fn();
const mockSetDoc = jest.fn(); // If RegisterPage still tries to write, though it should use a function
const mockDoc = jest.fn((db, collectionPath, documentPath) => ({
  path: `${collectionPath}/${documentPath}`, // Store path for debugging or verification
  id: documentPath,
}));

export const getFirestore = jest.fn(() => ({
  // Mock other Firestore instance methods if needed
}));

export const doc = mockDoc;
export const getDoc = mockGetDoc;
export const setDoc = mockSetDoc; // For completeness, though direct client writes should be minimal

// --- Helper functions for tests ---

// Simulate data for getDoc
export const __setMockDocData = (data: any, exists: boolean = true) => {
  mockGetDoc.mockImplementation(async (docRef) => {
    // You could add logic here to return different data based on docRef.path if needed
    // For RegisterPage, it's likely always 'app_config/admin_settings'
    if (docRef.path === 'app_config/admin_settings') {
      return Promise.resolve({
        exists: () => exists,
        data: () => data,
        id: docRef.id,
      });
    }
    // Default for other paths if any test uses them
    return Promise.resolve({
      exists: () => false,
      data: () => undefined,
      id: docRef.id,
    });
  });
};

export const __clearFirestoreMocks = () => {
  mockGetDoc.mockClear();
  mockSetDoc.mockClear();
  mockDoc.mockClear();
};

// Add other Firestore functions (collection, query, onSnapshot, etc.) if your components use them directly.
// For this auth flow, direct Firestore usage should be minimal.
