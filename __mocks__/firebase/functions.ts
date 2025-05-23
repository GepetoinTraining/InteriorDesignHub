// __mocks__/firebase/functions.ts

const mockCallable = jest.fn();

export const getFunctions = jest.fn(() => ({
  // Mock any functions specific to the functions instance if needed
}));

export const httpsCallable = jest.fn((functionsInstance?: any, functionName?: string) => {
  // Return a specific mock based on functionName, or a generic one
  // This allows different tests to set up different responses for different callable functions
  if (functionName === 'getUserData') {
    return mockCallableUserData;
  }
  if (functionName === 'initializeAdminAndTenant') {
    return mockCallableInitializeAdmin;
  }
  if (functionName === 'updateUserRole') {
      return mockCallableUpdateUserRole;
  }
  // Add other specific mocks as needed
  // e.g. if (functionName === 'someOtherFunction') return mockCallableSomeOther;
  return mockCallable; // Default mock
});

// Specific mocks for different callable functions
// This allows tests to provide specific implementations/return values per function
export const mockCallableUserData = jest.fn(async (data) => {
  // Default mock behavior for getUserData
  if (data && data.userId === 'test-uid') {
    return { 
      data: { 
        id: 'test-uid', 
        name: 'Mock Test User', 
        email: 'test@example.com', 
        role: 'USER', 
        tenantId: 'tenant-123',
        // other prisma user data
      } 
    };
  } else if (data && data.userId === 'new-uid-test-admin') {
     return {
      data: {
        id: 'new-uid-test-admin',
        name: 'New Admin',
        email: 'admin@example.com',
        role: 'ADMIN',
        tenantId: 'tenant-new',
      }
    };
  }
  return { data: null }; // Default if no specific match
});

export const mockCallableInitializeAdmin = jest.fn(async (data) => {
  // Default mock behavior for initializeAdminAndTenant
  if (data && data.email && data.tenantName && data.userName) {
    return { 
        data: { 
            success: true, 
            userId: 'new-uid-' + data.email, 
            tenantId: 'tenant-' + data.tenantName 
        } 
    };
  }
  // Simulate an error if, for example, tenant name already exists
  if (data && data.tenantName === 'existing-tenant') {
      const error: any = new Error('Tenant name already exists.');
      error.code = 'functions/already-exists'; // Match error codes used in RegisterPage
      throw error;
  }
  return { data: { success: false, message: 'Invalid data for initializeAdmin' } };
});

export const mockCallableUpdateUserRole = jest.fn(async (data) => {
    if (data && data.targetUserId && data.newRole && data.tenantId) {
        return { data: { success: true, updatedUser: { id: data.targetUserId, role: data.newRole, tenantId: data.tenantId } } };
    }
    return { data: { success: false, message: 'Failed to update role' } };
});


// Helper to reset all callable mocks (if needed globally, or manage per test suite)
export const __clearFunctionsMocks = () => {
  mockCallable.mockClear();
  mockCallableUserData.mockClear();
  mockCallableInitializeAdmin.mockClear();
  mockCallableUpdateUserRole.mockClear();
  // Clear other specific mocks
};

// Helper to set a specific return value for the default mockCallable
export const __setDefaultMockCallableResult = (result: any, error?: any) => {
  if (error) {
    mockCallable.mockRejectedValueOnce(error);
  } else {
    mockCallable.mockResolvedValueOnce({ data: result });
  }
};

// Helpers to set specific return values for named callable mocks
export const __setGetUserDataResult = (result: any, error?: any) => {
  if (error) {
    mockCallableUserData.mockImplementationOnce(async () => { throw error; });
  } else {
    mockCallableUserData.mockImplementationOnce(async () => ({ data: result }));
  }
};

export const __setInitializeAdminResult = (result: any, error?: any) => {
  if (error) {
    mockCallableInitializeAdmin.mockImplementationOnce(async () => { throw error; });
  } else {
    mockCallableInitializeAdmin.mockImplementationOnce(async () => ({ data: result }));
  }
};

export const __setUpdateUserRoleResult = (result: any, error?: any) => {
  if (error) {
    mockCallableUpdateUserRole.mockImplementationOnce(async () => { throw error; });
  } else {
    mockCallableUpdateUserRole.mockImplementationOnce(async () => ({ data: result }));
  }
};
