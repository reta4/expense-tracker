import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth, db } from '../../services/firebaseConfig';
import { doc, getDoc } from 'firebase/firestore';
import AuthCard from '../../components/auth/AuthCard';
import AuthAlert from '../../components/auth/AuthAlert';
import AuthForm from '../../components/auth/AuthForm';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const cleanedEmail = email.trim();

    try {
      const userCredential = await signInWithEmailAndPassword(auth, cleanedEmail, password);
      const firebaseUser = userCredential.user;
      const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));

      if (userDoc.exists()) {
        navigate('/');
      } else {
        setError('Invalid email or password.');
      }
    } catch {
      setError('Invalid email or password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthCard title="Sign In" subtitle="Access your expense dashboard">
      <AuthAlert type="error" message={error} />

      <AuthForm onSubmit={handleLogin}>
        <input
          type="email"
          className="auth-input"
          placeholder="Email address"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          autoComplete="username"
        />
        <input
          type="password"
          className="auth-input"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          autoComplete="current-password"
        />
        <div className="auth-row-link">
          <Link to="/forgot-password" className="auth-link">Forgot password?</Link>
        </div>
        <button type="submit" className="auth-btn" disabled={loading}>
          {loading ? 'Signing in...' : 'Sign In'}
        </button>
      </AuthForm>

      <p className="auth-footer">
        Don&apos;t have an account? <Link to="/register">Create one</Link>
      </p>
    </AuthCard>
  );
};

export default Login;
