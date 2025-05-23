import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { BrowserRouter as Router } from 'react-router-dom';
import RegisterPage from '../RegisterPage';
import { AuthProvider } from '../../contexts/AuthContext'; // To use useAuth for forceRefreshUserToken
import { User as FirebaseUser, createUserWithEmailAndPassword } from 'firebase/auth'; // Mocked
import { getDoc } from 'firebase/firestore'; // Mocked
import { httpsCallable } from 'firebase/functions'; // Mocked

// Mock Firebase services
jest.mock('firebase/auth');
jest.mock('firebase/firestore');
jest.mock('firebase/functions');

// Mock react-router-dom's useNavigate
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

// Mock authService if any of its functions were directly used (not in this case for RegisterPage)
// jest.mock('../../services/authService');

const renderWithAuthProvider = (ui: React.ReactElement) => {
  return render(
    <Router>
      <AuthProvider>{ui}</AuthProvider>
    </Router>
  );
};

describe('RegisterPage', () => {
  let mockCreateUserWithEmailAndPassword: jest.Mock;
  let mockGetDocFirestore: jest.Mock;
  let mockInitializeAdminCallable: jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Setup mocks from firebase/auth
    const authMock = require('firebase/auth');
    mockCreateUserWithEmailAndPassword = authMock.createUserWithEmailAndPassword;
     // Also mock onAuthStateChanged and getAuth from firebase/auth for AuthProvider
    authMock.getAuth.mockReturnValue({});
    authMock.onAuthStateChanged.mockImplementation((auth, callback) => {
      Promise.resolve().then(() => callback(null)); // Start with no user
      return jest.fn(); // Unsubscribe
    });


    // Setup mocks from firebase/firestore
    const firestoreMock = require('firebase/firestore');
    mockGetDocFirestore = firestoreMock.getDoc;

    // Setup mocks from firebase/functions
    const functionsMock = require('firebase/functions');
    mockInitializeAdminCallable = jest.fn();
    functionsMock.getFunctions.mockReturnValue({}); // Mock getFunctions()
    functionsMock.httpsCallable.mockImplementation((fnInstance, functionName) => {
      if (functionName === 'initializeAdminAndTenant') {
        return mockInitializeAdminCallable;
      }
      return jest.fn(); // Default mock for other callables
    });
  });

  test('renders loading state initially', () => {
    mockGetDocFirestore.mockReturnValue(new Promise(() => {})); // Keep it pending
    renderWithAuthProvider(<RegisterPage />);
    expect(screen.getByText(/loading application status.../i)).toBeInTheDocument();
  });

  test('renders registration form if admin is not registered', async () => {
    mockGetDocFirestore.mockResolvedValue({ exists: () => true, data: () => ({ isAdminRegistered: false }) });
    renderWithAuthProvider(<RegisterPage />);
    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /admin registration/i })).toBeInTheDocument();
    });
    expect(screen.getByLabelText(/your full name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/company \/ tenant name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/admin email address/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^password$/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/confirm password/i)).toBeInTheDocument();
  });

  test('renders disabled message if admin is already registered', async () => {
    mockGetDocFirestore.mockResolvedValue({ exists: () => true, data: () => ({ isAdminRegistered: true }) });
    renderWithAuthProvider(<RegisterPage />);
    await waitFor(() => {
      expect(screen.getByText(/registration disabled/i)).toBeInTheDocument();
    });
    expect(screen.getByText(/an administrator account has already been registered/i)).toBeInTheDocument();
  });
  
  test('shows error if firestore check fails', async () => {
    mockGetDocFirestore.mockRejectedValue(new Error("Firestore error"));
    renderWithAuthProvider(<RegisterPage />);
    await waitFor(() => {
      expect(screen.getByText(/could not verify application status/i)).toBeInTheDocument();
    });
     // Also check that it defaults to "disabled" state
    await waitFor(() => {
      expect(screen.getByText(/registration disabled/i)).toBeInTheDocument();
    });
  });


  test('successful registration flow', async () => {
    mockGetDocFirestore.mockResolvedValue({ exists: () => true, data: () => ({ isAdminRegistered: false }) });
    const mockFirebaseUser = { uid: 'new-admin-uid', email: 'admin@example.com' } as FirebaseUser;
    mockCreateUserWithEmailAndPassword.mockResolvedValue({ user: mockFirebaseUser });
    mockInitializeAdminCallable.mockResolvedValue({ data: { success: true, userId: 'new-admin-uid', tenantId: 'new-tenant-id' } });

    renderWithAuthProvider(<RegisterPage />);
    await waitFor(() => expect(screen.getByRole('heading', { name: /admin registration/i })).toBeInTheDocument());

    fireEvent.change(screen.getByLabelText(/your full name/i), { target: { value: 'Test Admin' } });
    fireEvent.change(screen.getByLabelText(/company \/ tenant name/i), { target: { value: 'Test Tenant' } });
    fireEvent.change(screen.getByLabelText(/admin email address/i), { target: { value: 'admin@example.com' } });
    fireEvent.change(screen.getByLabelText(/^password$/i), { target: { value: 'password123' } });
    fireEvent.change(screen.getByLabelText(/confirm password/i), { target: { value: 'password123' } });

    await act(async () => {
      fireEvent.submit(screen.getByRole('button', { name: /register admin & create tenant/i }));
    });
    
    await waitFor(() => {
      expect(mockCreateUserWithEmailAndPassword).toHaveBeenCalledWith(expect.anything(), 'admin@example.com', 'password123');
    });
    await waitFor(() => {
      expect(mockInitializeAdminCallable).toHaveBeenCalledWith({
        email: 'admin@example.com',
        tenantName: 'Test Tenant',
        userName: 'Test Admin',
      });
    });
    await waitFor(() => {
      expect(screen.getByText(/admin registration successful! redirecting to login.../i)).toBeInTheDocument();
    });

    // Check for navigation (mocked) after delay
    await new Promise(r => setTimeout(r, 3100)); // Wait for timeout in component
    expect(mockNavigate).toHaveBeenCalledWith('/login');
  });

  test('shows error on password mismatch', async () => {
    mockGetDocFirestore.mockResolvedValue({ exists: () => true, data: () => ({ isAdminRegistered: false }) });
    renderWithAuthProvider(<RegisterPage />);
    await waitFor(() => expect(screen.getByRole('heading', { name: /admin registration/i })).toBeInTheDocument());

    fireEvent.change(screen.getByLabelText(/admin email address/i), { target: { value: 'admin@example.com' } });
    fireEvent.change(screen.getByLabelText(/^password$/i), { target: { value: 'password123' } });
    fireEvent.change(screen.getByLabelText(/confirm password/i), { target: { value: 'password321' } });
    fireEvent.submit(screen.getByRole('button', { name: /register admin & create tenant/i }));

    await waitFor(() => {
      expect(screen.getByText(/passwords do not match/i)).toBeInTheDocument();
    });
  });
  
  test('shows error if createUserWithEmailAndPassword fails', async () => {
    mockGetDocFirestore.mockResolvedValue({ exists: () => true, data: () => ({ isAdminRegistered: false }) });
    const authError: any = new Error("Firebase: Error (auth/email-already-in-use).");
    authError.code = "auth/email-already-in-use";
    mockCreateUserWithEmailAndPassword.mockRejectedValue(authError);

    renderWithAuthProvider(<RegisterPage />);
    await waitFor(() => expect(screen.getByRole('heading', { name: /admin registration/i })).toBeInTheDocument());
    
    fireEvent.change(screen.getByLabelText(/your full name/i), { target: { value: 'Test Admin' } });
    fireEvent.change(screen.getByLabelText(/company \/ tenant name/i), { target: { value: 'Test Tenant' } });
    fireEvent.change(screen.getByLabelText(/admin email address/i), { target: { value: 'existing@example.com' } });
    fireEvent.change(screen.getByLabelText(/^password$/i), { target: { value: 'password123' } });
    fireEvent.change(screen.getByLabelText(/confirm password/i), { target: { value: 'password123' } });

    await act(async () => {
      fireEvent.submit(screen.getByRole('button', { name: /register admin & create tenant/i }));
    });

    await waitFor(() => {
      expect(screen.getByText(/this email address is already registered/i)).toBeInTheDocument();
    });
  });

  test('shows error if initializeAdminAndTenant callable fails', async () => {
    mockGetDocFirestore.mockResolvedValue({ exists: () => true, data: () => ({ isAdminRegistered: false }) });
    const mockFirebaseUser = { uid: 'new-admin-uid', email: 'admin@example.com' } as FirebaseUser;
    mockCreateUserWithEmailAndPassword.mockResolvedValue({ user: mockFirebaseUser });
    
    const callableError: any = new Error("Tenant name already exists.");
    callableError.code = "functions/already-exists"; // Simulate HttpsError from callable
    mockInitializeAdminCallable.mockRejectedValue(callableError);

    renderWithAuthProvider(<RegisterPage />);
    await waitFor(() => expect(screen.getByRole('heading', { name: /admin registration/i })).toBeInTheDocument());

    fireEvent.change(screen.getByLabelText(/your full name/i), { target: { value: 'Test Admin' } });
    fireEvent.change(screen.getByLabelText(/company \/ tenant name/i), { target: { value: 'Existing Tenant' } });
    fireEvent.change(screen.getByLabelText(/admin email address/i), { target: { value: 'admin@example.com' } });
    fireEvent.change(screen.getByLabelText(/^password$/i), { target: { value: 'password123' } });
    fireEvent.change(screen.getByLabelText(/confirm password/i), { target: { value: 'password123' } });

    await act(async () => {
      fireEvent.submit(screen.getByRole('button', { name: /register admin & create tenant/i }));
    });

    await waitFor(() => {
      expect(screen.getByText(/tenant name might already exist or setup already run/i)).toBeInTheDocument();
    });
  });
});
