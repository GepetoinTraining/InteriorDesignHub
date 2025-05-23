import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Logo from '../components/ui/Logo';
import { useAuth } from '../contexts/AuthContext';

const LoginPage: React.FC = () => {
  const [email, setEmail] = useState(''); // Changed from username to email
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const { login, isLoading } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    try {
      await login(email, password); // Pass email instead of username
      navigate('/'); // Redirect to dashboard on successful login
    } catch (err: any) {
      // Improved error handling for Firebase Auth errors
      if (err.code) {
        switch (err.code) {
          case 'auth/user-not-found':
          case 'auth/wrong-password':
          case 'auth/invalid-credential': // Generic error for invalid email/password combination
            setError('Invalid email or password. Please try again.');
            break;
          case 'auth/invalid-email':
            setError('Please enter a valid email address.');
            break;
          case 'auth/user-disabled':
            setError('This account has been disabled. Please contact support.');
            break;
          case 'auth/too-many-requests':
            setError('Too many login attempts. Please try again later or reset your password.');
            break;
          default:
            setError('An unexpected error occurred. Please try again.');
            console.error("Login error:", err); // Log the original error for debugging
            break;
        }
      } else if (err.message && err.message.includes("User record incomplete") ) {
        setError("Login failed: User account is not fully set up. Please contact support.");
      } else if (err.message && err.message.includes("User configuration incomplete")) {
        setError("Login failed: Your user account is missing critical configuration (role or tenant). Please contact support.");
      }
       else {
        setError(err instanceof Error ? err.message : 'An unknown error occurred during login.');
      }
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-4 py-12 bg-slate-50">
      <div className="w-full max-w-md">
        <div className="flex flex-col items-center mb-8">
          <Logo />
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight mt-4">Stitch Design CRM</h1>
          <p className="text-slate-600 mt-1">Access your design projects and leads.</p>
        </div>
        <div className="bg-white p-8 rounded-xl shadow-xl border border-slate-200">
          <h2 className="text-2xl font-semibold text-center text-slate-900 mb-6">Welcome Back</h2>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5" htmlFor="email">
                Email Address
              </label>
              <Input
                id="email"
                type="email" // Changed type to email
                placeholder="e.g., john.doe@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isLoading}
                aria-describedby={error ? "error-message" : undefined}
                aria-invalid={!!error}
                autoComplete="email"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5" htmlFor="password">
                Password
              </label>
              <Input
                id="password"
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isLoading}
                aria-describedby={error ? "error-message" : undefined}
                aria-invalid={!!error}
                autoComplete="current-password"
              />
            </div>
            {error && (
              <p id="error-message" className="text-sm text-red-600 bg-red-50 p-3 rounded-md" role="alert">
                {error}
              </p>
            )}
            <Button type="submit" fullWidth isLoading={isLoading} disabled={isLoading || !email || !password}>
              {isLoading ? 'Logging in...' : 'Login'}
            </Button>
            {/* <div className="mt-6 text-center">
              <a href="/forgottenpassword.html" className="text-sm text-[#0b80ee] hover:text-[#0069cc] hover:underline font-medium">
                Forgot Password?
              </a>
            </div> */}
          </form>
        </div>
        <p className="mt-8 text-center text-xs text-slate-500">
          © 2024 Stitch Design. All rights reserved.
        </p>
      </div>
    </div>
  );
};

export default LoginPage;