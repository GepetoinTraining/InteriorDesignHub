import React, { useEffect, useState } from "react";
import { createUserWithEmailAndPassword, User as FirebaseUser } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { getFunctions, httpsCallable, HttpsCallableResult } from 'firebase/functions';
import { useNavigate } from 'react-router-dom';
import { auth, db } from "../firebase";
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Logo from '../components/ui/Logo';
import { useAuth } from "../contexts/AuthContext"; // To potentially refresh claims or user state

const functions = getFunctions();

export default function RegisterPage() {
  const [isAdminRegistered, setIsAdminRegistered] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(true); // For initial flag check
  const [isSubmitting, setIsSubmitting] = useState(false); // For registration process
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [userName, setUserName] = useState(''); // Admin's name
  const [tenantName, setTenantName] = useState(''); // Desired tenant name
  
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  
  const navigate = useNavigate();
  const { forceRefreshUserToken } = useAuth(); // Get forceRefreshUserToken from AuthContext


  useEffect(() => {
    const checkAdminFlag = async () => {
      setIsLoading(true);
      try {
        const docRef = doc(db, "app_config", "admin_settings");
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setIsAdminRegistered(docSnap.data().isAdminRegistered === true);
        } else {
          setIsAdminRegistered(false);
        }
      } catch (e) {
        console.error("Error checking admin flag:", e);
        setError("Could not verify application status. Please try again later.");
        setIsAdminRegistered(true); // Default to disabled if error
      } finally {
        setIsLoading(false);
      }
    };
    checkAdminFlag();
  }, []);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setMessage('');

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    if (password.length < 6) {
        setError("Password should be at least 6 characters.");
        return;
    }
    if (!userName.trim()) {
        setError("Your name is required.");
        return;
    }
    if (!tenantName.trim()) {
        setError("Company/Tenant name is required.");
        return;
    }

    setIsSubmitting(true);
    try {
      // 1. Create Firebase Auth user
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const firebaseUser = userCredential.user;
      console.log("Firebase Auth user registered:", firebaseUser.uid);

      // 2. Call initializeAdminAndTenant to create Prisma User, Tenant, set claims, and flag
      const initializeAdminCallable = httpsCallable(functions, 'initializeAdminAndTenant');
      await initializeAdminCallable({
        email: firebaseUser.email, // Pass email from created user
        tenantName: tenantName,
        userName: userName,
        // UID is taken from context.auth.uid in the backend function
      });
      
      // It's crucial that the onAuthStateChanged listener in AuthContext
      // correctly fetches the new claims and Prisma data.
      // Forcing a token refresh here can help ensure claims are up-to-date immediately.
      await forceRefreshUserToken();
      
      setMessage("Admin registration successful! Redirecting to login...");
      
      // Redirect to login page after a short delay
      setTimeout(() => {
        navigate('/login');
      }, 3000);

    } catch (error: any) {
      console.error("Registration process error", error);
      if (error.code && error.message) { // Firebase error
        switch (error.code) {
            case 'auth/email-already-in-use':
                setError('This email address is already registered.');
                break;
            case 'auth/invalid-email':
                setError('Please enter a valid email address.');
                break;
            case 'auth/weak-password':
                setError('Password is too weak. Please choose a stronger password.');
                break;
            // Handle errors from initializeAdminAndTenant callable function
            case 'functions/already-exists':
                 setError(error.message || 'Tenant name might already exist or setup already run.');
                 break;
            case 'functions/internal':
                setError(error.message || 'An internal error occurred during setup. Please contact support.');
                break;
            default:
                setError(`Registration failed: ${error.message}`);
        }
      } else {
        setError("An unknown error occurred during registration.");
      }
      setIsSubmitting(false); // Ensure form is re-enabled on error
    }
    // Do not set isSubmitting to false here if successful, as we are navigating away
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <p className="text-lg text-slate-700">Loading application status...</p>
      </div>
    );
  }

  if (isAdminRegistered) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen px-4 py-12 bg-slate-100">
         <div className="w-full max-w-md text-center">
            <Logo />
            <h1 className="text-2xl font-bold text-slate-800 mt-6 mb-4">Registration Disabled</h1>
            <p className="text-slate-600 mb-8">
              An administrator account has already been registered for this application.
              If you need to access the system, please log in or contact your administrator.
            </p>
            <Button onClick={() => navigate('/login')} variant="primary">
              Go to Login
            </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-4 py-8 bg-slate-50">
      <div className="w-full max-w-lg">
        <div className="flex flex-col items-center mb-6">
          <Logo />
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight mt-3">Admin Registration</h1>
          <p className="text-slate-600 mt-1">Set up the first administrator account and your company tenant.</p>
        </div>
        <div className="bg-white p-8 rounded-xl shadow-xl border border-slate-200">
          <form onSubmit={handleRegister} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5" htmlFor="userName">
                Your Full Name
              </label>
              <Input
                id="userName" type="text" placeholder="e.g., Jane Doe"
                value={userName} onChange={e => setUserName(e.target.value)}
                disabled={isSubmitting} required
              />
            </div>
             <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5" htmlFor="tenantName">
                Company / Tenant Name
              </label>
              <Input
                id="tenantName" type="text" placeholder="e.g., Acme Innovations"
                value={tenantName} onChange={e => setTenantName(e.target.value)}
                disabled={isSubmitting} required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5" htmlFor="email">
                Admin Email Address
              </label>
              <Input
                id="email" type="email" placeholder="admin@example.com"
                value={email} onChange={e => setEmail(e.target.value)}
                disabled={isSubmitting} required autoComplete="email"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5" htmlFor="password">
                Password
              </label>
              <Input
                id="password" type="password" placeholder="Min. 6 characters"
                value={password} onChange={e => setPassword(e.target.value)}
                disabled={isSubmitting} required autoComplete="new-password"
              />
            </div>
             <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5" htmlFor="confirmPassword">
                Confirm Password
              </label>
              <Input
                id="confirmPassword" type="password" placeholder="Re-enter your password"
                value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)}
                disabled={isSubmitting} required autoComplete="new-password"
              />
            </div>
            {error && (
              <p className="text-sm text-red-600 bg-red-50 p-3 rounded-md" role="alert">
                {error}
              </p>
            )}
            {message && (
              <p className="text-sm text-green-600 bg-green-50 p-3 rounded-md" role="status">
                {message}
              </p>
            )}
            <Button type="submit" fullWidth isLoading={isSubmitting} disabled={isSubmitting}>
              {isSubmitting ? 'Registering...' : 'Register Admin & Create Tenant'}
            </Button>
             <p className="mt-4 text-center text-sm">
                Already have an account?{' '}
                <button type="button" onClick={() => navigate('/login')} className="font-medium text-[#0b80ee] hover:text-[#0069cc]">
                    Login here
                </button>
            </p>
          </form>
        </div>
         <p className="mt-6 text-center text-xs text-slate-500">
          © {new Date().getFullYear()} Stitch Design. All rights reserved.
        </p>
      </div>
    </div>
  );
}
