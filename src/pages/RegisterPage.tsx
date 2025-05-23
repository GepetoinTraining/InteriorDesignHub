import { useEffect, useState } from "react";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "../firebase";

export default function RegisterPage() {
  const [isAdminRegistered, setIsAdminRegistered] = useState<boolean | null>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const checkAdminFlag = async () => {
      const docRef = doc(db, "app_config", "admin_settings");
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const data = docSnap.data();
        setIsAdminRegistered(data.isAdminRegistered);
      } else {
        setIsAdminRegistered(false);
      }
    };
    checkAdminFlag();
  }, []);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      console.log("User registered:", userCredential.user);
      setMessage("Registration successful!");
    } catch (error: any) {
      console.error("Registration error", error);
      setMessage(error.message);
    }
  };

  if (isAdminRegistered === null) {
    return <p>Loading...</p>;
  }

  if (isAdminRegistered) {
    return <p>Admin already registered. Registration is disabled.</p>;
  }

  return (
    <div>
      <h2>Admin Registration</h2>
      <form onSubmit={handleRegister}>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          required
        />
        <button type="submit">Register</button>
      </form>
      {message && <p>{message}</p>}
    </div>
  );
}
