import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { BrowserRouter as Router } from 'react-router-dom'; // To provide context for useNavigate
import LoginPage from '../LoginPage';
import { AuthProvider, useAuth } from '../../contexts/AuthContext'; // Actual AuthContext for integration
import * as authService from '../../services/authService'; // Mocked

// Mock the authService used by AuthContext's login
jest.mock('../../services/authService', () => ({
  login: jest.fn(),
  // Mock other functions if they were to be called directly by LoginPage (they are not)
}));

// Mock react-router-dom's useNavigate
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

// Mock Firebase Auth (if AuthContext directly uses it for onAuthStateChanged)
// For LoginPage tests, primarily concerned with login function via useAuth
jest.mock('firebase/auth');
jest.mock('firebase/functions'); // If authService.login calls callable functions (it does)

const renderWithAuthProvider = (ui: React.ReactElement) => {
  return render(
    <Router> {/* Router needed for useNavigate */}
      <AuthProvider>
        {ui}
      </AuthProvider>
    </Router>
  );
};


describe('LoginPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Reset mock user state for onAuthStateChanged if needed, though not directly tested here
    // This might be relevant if AuthProvider's useEffect for onAuthStateChanged affects the test
    const { __clearAuthMocks } = require('firebase/auth'); // Assuming this helper exists in your mock
    if (__clearAuthMocks) __clearAuthMocks(); 
  });

  test('renders login form correctly', () => {
    renderWithAuthProvider(<LoginPage />);
    expect(screen.getByLabelText(/email address/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /login/i })).toBeInTheDocument();
  });

  test('allows user to input email and password', () => {
    renderWithAuthProvider(<LoginPage />);
    fireEvent.change(screen.getByLabelText(/email address/i), { target: { value: 'test@example.com' } });
    fireEvent.change(screen.getByLabelText(/password/i), { target: { value: 'password123' } });
    expect(screen.getByLabelText(/email address/i)).toHaveValue('test@example.com');
    expect(screen.getByLabelText(/password/i)).toHaveValue('password123');
  });

  test('calls login function from AuthContext on submit and navigates on success', async () => {
    (authService.login as jest.Mock).mockResolvedValueOnce({ 
      id: 'test-user', 
      email: 'test@example.com', 
      role: 'USER', 
      tenantId: 'tenant-1' 
    });
    
    renderWithAuthProvider(<LoginPage />);
    
    fireEvent.change(screen.getByLabelText(/email address/i), { target: { value: 'test@example.com' } });
    fireEvent.change(screen.getByLabelText(/password/i), { target: { value: 'password123' } });
    
    await act(async () => {
      fireEvent.submit(screen.getByRole('button', { name: /login/i }));
    });

    await waitFor(() => {
      expect(authService.login).toHaveBeenCalledWith('test@example.com', 'password123');
    });
    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/');
    });
  });

  test('displays generic error message on failed login (auth/invalid-credential)', async () => {
    const error: any = new Error('Firebase: Error (auth/invalid-credential).');
    error.code = 'auth/invalid-credential';
    (authService.login as jest.Mock).mockRejectedValueOnce(error);
    
    renderWithAuthProvider(<LoginPage />);
    
    fireEvent.change(screen.getByLabelText(/email address/i), { target: { value: 'wrong@example.com' } });
    fireEvent.change(screen.getByLabelText(/password/i), { target: { value: 'wrongpassword' } });
    
    await act(async () => {
      fireEvent.submit(screen.getByRole('button', { name: /login/i }));
    });

    await waitFor(() => {
      expect(screen.getByText('Invalid email or password. Please try again.')).toBeInTheDocument();
    });
    expect(mockNavigate).not.toHaveBeenCalled();
  });

  test('displays specific error for user-not-found', async () => {
    const error: any = new Error('Firebase: Error (auth/user-not-found).');
    error.code = 'auth/user-not-found';
    (authService.login as jest.Mock).mockRejectedValueOnce(error);

    renderWithAuthProvider(<LoginPage />);
    fireEvent.change(screen.getByLabelText(/email address/i), { target: { value: 'nonexistent@example.com' } });
    fireEvent.change(screen.getByLabelText(/password/i), { target: { value: 'password123' } });
    fireEvent.submit(screen.getByRole('button', { name: /login/i }));

    await waitFor(() => {
      expect(screen.getByText('Invalid email or password. Please try again.')).toBeInTheDocument();
    });
  });
  
  test('displays specific error for "User record incomplete"', async () => {
    const error = new Error("User record incomplete. Please contact support.");
    // Simulate how this error might be thrown from authService.login (e.g. if it's a custom HttpsError)
    // For simplicity, we'll assume it's a generic error with a specific message.
    // In a real scenario, authService.login might throw an HttpsError from a callable function.
    (authService.login as jest.Mock).mockRejectedValueOnce(error);

    renderWithAuthProvider(<LoginPage />);
    fireEvent.change(screen.getByLabelText(/email address/i), { target: { value: 'incomplete@example.com' } });
    fireEvent.change(screen.getByLabelText(/password/i), { target: { value: 'password123' } });
    
    await act(async () => {
        fireEvent.submit(screen.getByRole('button', { name: /login/i }));
    });
    
    await waitFor(() => {
        expect(screen.getByText("Login failed: User account is not fully set up. Please contact support.")).toBeInTheDocument();
    });
  });

  test('shows loading state on button when submitting', async () => {
    (authService.login as jest.Mock).mockImplementation(() => {
      return new Promise(resolve => setTimeout(() => resolve({ id: 'test-user' }), 100)); // Simulate delay
    });
    
    renderWithAuthProvider(<LoginPage />);
    
    fireEvent.change(screen.getByLabelText(/email address/i), { target: { value: 'test@example.com' } });
    fireEvent.change(screen.getByLabelText(/password/i), { target: { value: 'password123' } });
    
    fireEvent.submit(screen.getByRole('button', { name: /login/i }));

    // Check for "Logging in..." text or disabled state
    // AuthProvider's isLoading state will be true, which LoginPage uses
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /logging in.../i })).toBeDisabled();
    });

    // Wait for login to resolve and navigation to occur
    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/');
    });
  });
});
