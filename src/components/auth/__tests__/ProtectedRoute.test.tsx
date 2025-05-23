import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from '../ProtectedRoute';
import { AuthProvider, useAuth } from '../../../contexts/AuthContext'; // Actual AuthContext
import { UserRole } from '../../../contexts/AuthContext'; // Import UserRole

// Mock Firebase Auth for AuthProvider's onAuthStateChanged
jest.mock('firebase/auth');
jest.mock('firebase/functions'); // For getUserData callable in AuthContext

// Mock component to be rendered by ProtectedRoute
const MockProtectedComponent: React.FC = () => <div data-testid="protected-content">Protected Content</div>;
const MockLoginPage: React.FC = () => <div data-testid="login-page">Login Page</div>;

// Helper to set up onAuthStateChanged mock behavior
let mockOnAuthStateChangedCallback: (user: any) => Promise<void>;
const setupAuthMocks = () => {
  const { getAuth, onAuthStateChanged } = require('firebase/auth');
  (getAuth as jest.Mock).mockReturnValue({});
  (onAuthStateChanged as jest.Mock).mockImplementation((auth, callback) => {
    mockOnAuthStateChangedCallback = callback;
    return jest.fn(); // Unsubscribe
  });

  const { getFunctions, httpsCallable } = require('firebase/functions');
  const mockCallable = jest.fn();
  (getFunctions as jest.Mock).mockReturnValue({});
  (httpsCallable as jest.Mock).mockImplementation(() => mockCallable);
  return mockCallable; // Return mockCallable for further configuration if needed for getUserData
};


describe('ProtectedRoute', () => {
  let mockGetUserDataCallable: jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
    mockGetUserDataCallable = setupAuthMocks(); // Sets up onAuthStateChanged and returns mock for getUserData
  });

  const renderWithRouterAndAuthProvider = (
    initialUser: any, // Can be FirebaseUser, null, or 'loading' state
    initialClaims?: { role: UserRole | null, tenantId: string | null },
    initialPrismaData?: any
  ) => {
    // Simulate initial state of AuthProvider more directly
    // This bypasses waiting for onAuthStateChanged if we want to test specific states
    const TestComponentWithInitialState: React.FC<{children: React.ReactNode}> = ({ children }) => {
        const auth = useAuth();
        // This is a bit of a hack to set initial state for testing
        // In a real app, onAuthStateChanged would handle this.
        React.useEffect(() => {
            if (initialUser === 'loading') {
                // @ts-ignore
                auth.isLoading = true; 
                // @ts-ignore
                auth.currentUser = null;
            } else if (initialUser) {
                 // @ts-ignore
                auth.isLoading = false;
                // @ts-ignore
                auth.currentUser = { 
                    id: initialUser.uid, 
                    email: initialUser.email,
                    role: initialClaims?.role || null,
                    tenantId: initialClaims?.tenantId || null,
                    ...initialPrismaData
                };
                 // @ts-ignore
                auth.currentFirebaseUser = initialUser;
                 // @ts-ignore
                auth.role = initialClaims?.role || null;
                 // @ts-ignore
                auth.tenantId = initialClaims?.tenantId || null;
            } else {
                 // @ts-ignore
                auth.isLoading = false;
                 // @ts-ignore
                auth.currentUser = null;
            }
        }, []);
        return <>{children}</>;
    };


    return render(
      <Router>
        <AuthProvider> 
          {/* The TestComponentWithInitialState is problematic because AuthProvider's own useEffect will run.
              Instead, we'll rely on triggering onAuthStateChanged. */}
          <Routes>
            <Route 
              path="/protected" 
              element={
                <ProtectedRoute>
                  <MockProtectedComponent />
                </ProtectedRoute>
              } 
            />
            <Route path="/login" element={<MockLoginPage />} />
          </Routes>
        </AuthProvider>
      </Router>
    );
  };


  test('renders child component if user is authenticated', async () => {
    const mockFirebaseUser = { 
        uid: 'authed-user', 
        email: 'authed@example.com',
        getIdTokenResult: jest.fn().mockResolvedValue({ claims: { role: UserRole.USER, tenantId: 't1' }})
    };
    mockGetUserDataCallable.mockResolvedValue({ data: { name: 'Authed User' }}); // Mock for getUserData

    renderWithRouterAndAuthProvider(null); // Start with no user
    // Navigate to protected route to trigger ProtectedRoute logic
    // In a real app, this would be history.push('/protected') or initialEntries in MemoryRouter
    // For this setup, we rely on ProtectedRoute being the initial effective route for testing its logic.
    // This means we need to ensure that window.location.pathname is /protected.
    Object.defineProperty(window, 'location', {
        value: { pathname: '/protected' },
        writable: true,
    });


    await act(async () => {
      await mockOnAuthStateChangedCallback(mockFirebaseUser);
    });

    await waitFor(() => {
      expect(screen.getByTestId('protected-content')).toBeInTheDocument();
    });
  });

  test('redirects to /login if user is not authenticated and not loading', async () => {
    renderWithRouterAndAuthProvider(null);
     Object.defineProperty(window, 'location', {
        value: { pathname: '/protected' },
        writable: true,
    });

    await act(async () => {
      await mockOnAuthStateChangedCallback(null); // Simulate no user logged in
    });
    
    await waitFor(() => {
      // ProtectedRoute uses Navigate component which changes the URL.
      // We check if the login page content is rendered as a result of redirection.
      expect(screen.getByTestId('login-page')).toBeInTheDocument();
    });
     // Or check that navigate was called if we mock useNavigation for ProtectedRoute's Navigate
  });

  test('shows loading indicator when auth state is loading', async () => {
    renderWithRouterAndAuthProvider(null);
    Object.defineProperty(window, 'location', {
        value: { pathname: '/protected' }, // Ensure we are "on" the protected route
        writable: true,
    });

    // AuthProvider starts with isLoading = true.
    // onAuthStateChanged will be called, and if it's still processing (e.g. fetching claims/prisma data),
    // isLoading should remain true.
    // The ProtectedRoute itself shows its own "Loading..." text.
    
    // We don't need to call mockOnAuthStateChangedCallback here if we want to test the initial loading state.
    // AuthProvider's useEffect sets isLoading(true) initially and then to false after onAuthStateChanged.
    // ProtectedRoute's own <p>Loading...</p> should be visible.
    
    // To properly test this, we need AuthProvider to expose its isLoading state,
    // and ProtectedRoute should use it.
    // The current ProtectedRoute has its own "Loading..." <p> tag.
    // Let's assume AuthProvider's isLoading is true and see if ProtectedRoute shows its loading state.
    
    // This test is a bit tricky because AuthProvider's isLoading is managed internally by onAuthStateChanged.
    // For ProtectedRoute to show its own loading message, AuthContext.isLoading needs to be true.
    // The current setup of renderWithRouterAndAuthProvider doesn't easily allow setting AuthContext.isLoading directly
    // *before* ProtectedRoute renders based on it.

    // A more direct way: provide a custom AuthContext value for this specific test.
    const MockAuthContextValueLoading = {
        currentUser: null,
        currentFirebaseUser: null,
        isLoading: true, // Explicitly set isLoading to true
        role: null,
        tenantId: null,
        login: jest.fn(),
        logout: jest.fn(),
        updateCurrentUserProfile: jest.fn(),
        forceRefreshUserToken: jest.fn(),
    };

    render(
        <Router>
            <AuthContext.Provider value={MockAuthContextValueLoading}>
                <Routes>
                    <Route 
                        path="/protected" 
                        element={
                            <ProtectedRoute>
                                <MockProtectedComponent />
                            </ProtectedRoute>
                        } 
                    />
                    <Route path="/login" element={<MockLoginPage />} />
                </Routes>
            </AuthContext.Provider>
        </Router>
    );
     Object.defineProperty(window, 'location', {
        value: { pathname: '/protected' },
        writable: true,
    });


    expect(screen.getByText('Loading user session...')).toBeInTheDocument();
  });
});
