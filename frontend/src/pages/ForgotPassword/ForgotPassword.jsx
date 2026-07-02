import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { resetUserPassword } from '../../services/firebaseConfig.js';
import AuthCard from '../../components/auth/AuthCard';
import AuthAlert from '../../components/auth/AuthAlert';
import AuthForm from '../../components/auth/AuthForm';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');
    setLoading(true);

    const trimmedEmail = email.trim();

    if (!trimmedEmail) {
      setError('Please enter your email address.');
      setLoading(false);
      return;
    }

    const result = await resetUserPassword(trimmedEmail);

    if (result.success) {
      setMessage('Password reset email sent. Check your inbox (and spam folder).');
      setEmail('');
    } else {
      const errorString = typeof result.error === 'string' ? result.error : JSON.stringify(result.error);

      if (errorString.includes('user-not-found') || errorString.includes('auth/user-not-found')) {
        setError('No account found with this email.');
      } else if (errorString.includes('invalid-email') || errorString.includes('auth/invalid-email')) {
        setError('Invalid email address.');
      } else {
        setError('Could not send reset email. Please try again later.');
      }
    }
    setLoading(false);
  };

  return (
    <AuthCard title="Reset Password" subtitle="Enter your email and we will send you a secure reset link">
      <AuthAlert type="success" message={message} />
      <AuthAlert type="error" message={error} />

      <AuthForm onSubmit={handleSubmit}>
        <input
          type="email"
          placeholder="Email address"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          className="auth-input"
          disabled={loading}
          autoComplete="email"
          required
        />
        <button type="submit" className="auth-btn" disabled={loading}>
          {loading ? 'Sending...' : 'Send reset link'}
        </button>
      </AuthForm>

      <button type="button" className="auth-back" onClick={() => navigate('/login')}>
        Back to sign in
      </button>
    </AuthCard>
  );
}
