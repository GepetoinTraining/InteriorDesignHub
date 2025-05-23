import React from 'react';
import { render, screen, act, waitFor } from '@testing-library/react';
import { AuthProvider, useAuth, UserRole } from '../AuthContext';
import * as authService from '../../services/authService'; // Mocked via jest.mock
import { User as FirebaseUser } from 'firebase/auth'; // For typing mock FirebaseUser

// Mock the entire authService
jest.mock('../../services/authService', () => ({
  login: jest.fn(),
  logout: jest.fn(),
  updateUserProfile: jest.fn(),
  // Mock other functions from authService if AuthContext uses them directly
}));

// Mock Firebase Auth and Functions (they are used internally by AuthContext via onAuthStateChanged)
jest.mock('firebase/auth');
jest.mock('firebase/functions');

// Mock react-router-dom
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'), // import and retain default behavior
  useNavigate: () => jest.fn(), // Mock useNavigate
}));


// Helper component to consume and display context values
const TestConsumerComponent: React.FC = () => {
  const auth = useAuth();
  if (auth.isLoading) return <div>Loading...</div>;
  if (!auth.currentUser) return <div>No User</div>;
  return (
    <div>
      <div data-testid="user-id">{auth.currentUser.id}</div>
      <div data-testid="user-email">{auth.currentUser.email}</div>
      <div data-testid="user-name">{auth.currentUser.name}</div>
      <div data-testid="user-role">{auth.currentUser.role}</div>
      <div data-testid="user-tenant">{auth.currentUser.tenantId}</div>
      <button onClick={auth.logout}>Logout</button>
      <button onClick={auth.forceRefreshUserToken}>Refresh Token</button>
    </div>
  );
};

describe('AuthContext', () => {
  let mockOnAuthStateChangedCallback: (user: FirebaseUser | null) => Promise<void>;
  let mockGetIdTokenResult: jest.Mock;
  let mockHttpsCallable: jest.Mock;

  beforeEach(() => {
    // Reset all mocks before each test
    jest.clearAllMocks();

    // Setup mock for onAuthStateChanged
    const { getAuth, onAuthStateChanged } = require('firebase/auth');
    (getAuth as jest.Mock).mockReturnValue({}); // Mock getAuth() to return a basic object
    (onAuthStateChanged as jest.Mock).mockImplementation((auth, callback) => {
      mockOnAuthStateChangedCallback = callback; // Store the callback to trigger it manually
      return jest.fn(); // Return an unsubscribe function
    });

    // Setup mock for getIdTokenResult
    mockGetIdTokenResult = jest.fn();
    
    // Setup mock for httpsCallable (for getUserData)
    const { getFunctions, httpsCallable } = require('firebase/functions');
    mockHttpsCallable = jest.fn();
    (getFunctions as jest.Mock).mockReturnValue({});
    (httpsCallable as jest.Mock).mockImplementation(() => mockHttpsCallable);
  });

  test('initial state: isLoading is true, currentUser is null', async () => {
    render(
      <AuthProvider>
        <TestConsumerComponent />
      </AuthProvider>
    );
    // Initially, onAuthStateChanged might not have fired yet or is processing
    expect(screen.getByText('Loading...')).toBeInTheDocument();

    // Simulate onAuthStateChanged firing with no user
    await act(async () => {
      await mockOnAuthStateChangedCallback(null);
    });
    expect(screen.getByText('No User')).toBeInTheDocument();
  });

  test('state updates when onAuthStateChanged simulates user login', async () => {
    const mockFirebaseUser: FirebaseUser = {
      uid: 'test-uid-123',
      email: 'test@example.com',
      displayName: 'Firebase Test User',
      photoURL: 'http://example.com/photo.jpg',
      getIdTokenResult: mockGetIdTokenResult,
      // Add other required FirebaseUser properties as needed by your types/logic
    } as FirebaseUser;

    mockGetIdTokenResult.mockResolvedValue({
      claims: { role: UserRole.ADMIN, tenantId: 'tenant-xyz' },
      token: 'mock-id-token',
    });
    mockHttpsCallable.mockResolvedValue({ // Mock for getUserData
      data: {
        name: 'Prisma User Name',
        username: 'prismauser',
        phone: '123-456-7890',
        company: 'Prisma Inc.',
        jobTitle: 'Developer',
        // avatarUrl might come from Prisma or be overridden by Firebase photoURL
      },
    });

    render(
      <AuthProvider>
        <TestConsumerComponent />
      </AuthProvider>
    );

    await act(async () => {
      await mockOnAuthStateChangedCallback(mockFirebaseUser);
    });
    
    await waitFor(() => {
      expect(screen.getByTestId('user-id')).toHaveTextContent('test-uid-123');
    });

    expect(screen.getByTestId('user-email')).toHaveTextContent('test@example.com');
    expect(screen.getByTestId('user-name')).toHaveTextContent('Prisma User Name'); // Prefers Prisma name
    expect(screen.getByTestId('user-role')).toHaveTextContent(UserRole.ADMIN);
    expect(screen.getByTestId('user-tenant')).toHaveTextContent('tenant-xyz');
    expect(mockHttpsCallable).toHaveBeenCalledWith({ userId: 'test-uid-123' });
  });

  test('logout behavior: clears user state', async () => {
     const mockFirebaseUser = { uid: 'test-uid-logout', getIdTokenResult: mockGetIdTokenResult } as FirebaseUser;
    mockGetIdTokenResult.mockResolvedValue({ claims: { role: UserRole.USER, tenantId: 'tenant-logout' } });
    mockHttpsCallable.mockResolvedValue({ data: { name: 'Logout User' } }); // for getUserData

    render(
      <AuthProvider>
        <TestConsumerComponent />
      </AuthProvider>
    );

    // Simulate login
    await act(async () => {
      await mockOnAuthStateChangedCallback(mockFirebaseUser);
    });
    await waitFor(() => expect(screen.getByTestId('user-id')).toBeInTheDocument());

    // Simulate logout action (which internally calls Firebase signOut, then onAuthStateChanged(null))
    const logoutButton = screen.getByText('Logout');
    (authService.logout as jest.Mock).mockImplementation(async () => {
      // This mock simulates that authService.logout triggers onAuthStateChanged(null)
      await act(async () => {
        await mockOnAuthStateChangedCallback(null);
      });
    });
    
    await act(async () => {
      logoutButton.click();
    });

    await waitFor(() => {
        expect(screen.getByText('No User')).toBeInTheDocument();
    });
  });

  test('forceRefreshUserToken: re-fetches claims and Prisma data', async () => {
    const initialFirebaseUser = { 
        uid: 'test-uid-refresh', 
        email: 'initial@example.com',
        getIdTokenResult: mockGetIdTokenResult 
    } as FirebaseUser;

    // Initial claims and Prisma data
    mockGetIdTokenResult.mockResolvedValueOnce({
      claims: { role: UserRole.USER, tenantId: 'tenant-initial' }, token: 'token1'
    });
    mockHttpsCallable.mockResolvedValueOnce({ // for initial getUserData
      data: { name: 'Initial Prisma Name' }
    });

    render(
      <AuthProvider>
        <TestConsumerComponent />
      </AuthProvider>
    );

    // Simulate initial login
    await act(async () => {
      await mockOnAuthStateChangedCallback(initialFirebaseUser);
    });
    await waitFor(() => expect(screen.getByTestId('user-name')).toHaveTextContent('Initial Prisma Name'));
    expect(screen.getByTestId('user-role')).toHaveTextContent(UserRole.USER);

    // Setup for refreshed claims and Prisma data
    mockGetIdTokenResult.mockResolvedValueOnce({ // For forceRefreshUserToken call
      claims: { role: UserRole.ADMIN, tenantId: 'tenant-refreshed' }, token: 'token2'
    });
    mockHttpsCallable.mockResolvedValueOnce({ // For getUserData call within forceRefreshUserToken
      data: { name: 'Refreshed Prisma Name' }
    });
     // Mock getAuth().currentUser for forceRefreshUserToken
    const { getAuth } = require('firebase/auth');
    (getAuth as jest.Mock).mockReturnValue({ currentUser: initialFirebaseUser });


    const refreshTokenButton = screen.getByText('Refresh Token');
    await act(async () => {
      refreshTokenButton.click();
    });

    await waitFor(() => {
      expect(screen.getByTestId('user-name')).toHaveTextContent('Refreshed Prisma Name');
    });
    expect(screen.getByTestId('user-role')).toHaveTextContent(UserRole.ADMIN);
    expect(screen.getByTestId('user-tenant')).toHaveTextContent('tenant-refreshed');
    expect(mockGetIdTokenResult).toHaveBeenCalledTimes(2); // Initial + refresh
    expect(mockHttpsCallable).toHaveBeenCalledTimes(2); // Initial + refresh
  });
  
  test('handles error during user data or claims fetching by clearing user state', async () => {
    const mockFirebaseUserError = { uid: 'error-uid', getIdTokenResult: mockGetIdTokenResult } as FirebaseUser;
    mockGetIdTokenResult.mockRejectedValueOnce(new Error("Failed to get claims")); // Simulate error

    render(
      <AuthProvider>
        <TestConsumerComponent />
      </AuthProvider>
    );

    await act(async () => {
      await mockOnAuthStateChangedCallback(mockFirebaseUserError);
    });

    await waitFor(() => {
      expect(screen.getByText('No User')).toBeInTheDocument();
    });
  });
});
