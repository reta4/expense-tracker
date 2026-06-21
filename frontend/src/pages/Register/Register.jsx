import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { createUserWithEmailAndPassword, signOut, deleteUser } from 'firebase/auth';
import { auth, db } from '../../services/firebaseConfig';
import { doc, setDoc } from 'firebase/firestore';
import { createSalesforceContact } from '../../services/salesforceApi';
import AuthCard from '../../components/auth/AuthCard';
import AuthAlert from '../../components/auth/AuthAlert';
import AuthForm from '../../components/auth/AuthForm';

const Register = () => {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');

    const cleanedEmail = email.trim();
    const cleanedFirstName = firstName.trim();
    const cleanedLastName = lastName.trim();

    if (password.length < 6) {
      setError('Password must contain at least 6 characters.');
      return;
    }

    setLoading(true);
    let firebaseUser = null;

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, cleanedEmail, password);
      firebaseUser = userCredential.user;
      const token = await firebaseUser.getIdToken();

      const sfData = await createSalesforceContact(
        { firstName: cleanedFirstName, lastName: cleanedLastName },
        token,
      );

      if (!sfData?.success || !sfData.contactId) {
        throw new Error('Invalid response from integration server');
      }

      await setDoc(doc(db, 'users', firebaseUser.uid), {
        firstName: cleanedFirstName,
        lastName: cleanedLastName,
        email: cleanedEmail,
        salesforceContactId: sfData.contactId,
        createdAt: new Date().toISOString(),
      });

      await signOut(auth);
      setSuccessMsg('Registration complete. Redirecting to sign in...');
      setTimeout(() => navigate('/login'), 2000);
    } catch (err) {
      if (firebaseUser) {
        try {
          await deleteUser(firebaseUser);
        } catch {
          // Best-effort cleanup if Salesforce/Firestore sync fails.
        }
      }

      if (err.code === 'auth/email-already-in-use') {
        setError('This email address is already registered.');
      } else if (err.message?.includes('409') || err.response?.status === 409) {
        setError('This account is already linked to Salesforce.');
      } else {
        setError(err.message || 'Registration failed. Please try again later.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthCard title="Create Account" subtitle="Start tracking your expenses in one place">
      <AuthAlert type="error" message={error} />
      <AuthAlert type="success" message={successMsg} />

      <AuthForm onSubmit={handleRegister}>
        <input
          type="text"
          className="auth-input"
          placeholder="First name"
          value={firstName}
          onChange={(e) => setFirstName(e.target.value)}
          required
          disabled={loading || successMsg}
        />
        <input
          type="text"
          className="auth-input"
          placeholder="Last name"
          value={lastName}
          onChange={(e) => setLastName(e.target.value)}
          required
          disabled={loading || successMsg}
        />
        <input
          type="email"
          className="auth-input"
          placeholder="Email address"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          disabled={loading || successMsg}
          autoComplete="username"
        />
        <input
          type="password"
          className="auth-input"
          placeholder="Password (min. 6 characters)"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          disabled={loading || successMsg}
          autoComplete="new-password"
        />
        <button type="submit" className="auth-btn" disabled={loading || successMsg}>
          {loading ? 'Creating account...' : 'Create account'}
        </button>
      </AuthForm>

      <p className="auth-footer">
        Already have an account? <Link to="/login">Sign in</Link>
      </p>
    </AuthCard>
  );
};

export default Register;
