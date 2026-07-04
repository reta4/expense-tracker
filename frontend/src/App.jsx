import React, { useState, useEffect, lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from './services/firebaseConfig';
import LoadingScreen from './components/common/LoadingScreen';
import Home from './pages/Home/Home.jsx';
import Login from './pages/Login/Login.jsx';
import Register from './pages/Register/Register.jsx';
import AnalysisView from './pages/AnalysisView/AnalysisView.jsx';
import ForgotPassword from './pages/ForgotPassword/ForgotPassword.jsx';
import './App.css';

const DevScreenshots = import.meta.env.DEV
  ? lazy(() => import('./pages/DevScreenshots/DevScreenshots.jsx'))
  : null;

const ProtectedRoute = ({ children, user, loading }) => {
  if (loading) {
    return <LoadingScreen message="Loading application..." />;
  }
  return user ? children : <Navigate to="/login" replace />;
};

const PublicRoute = ({ children, user, loading }) => {
  if (loading) return <LoadingScreen message="Loading application..." />;
  return !user ? children : <Navigate to="/" replace />;
};

const App = () => {
  const [dark, setDark] = useState(() => {
    const saved = localStorage.getItem('theme');
    if (saved) return saved === 'dark';
    return false;
  });

  const [user, setUser] = useState(null);
  const [initializing, setInitializing] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
      setInitializing(false);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', dark ? 'dark' : 'light');
    localStorage.setItem('theme', dark ? 'dark' : 'light');
  }, [dark]);

  const toggleDark = () => setDark((prev) => !prev);

  const sharedProps = { dark, toggleDark, currentUser: user };

  return (
    <Router>
      <Routes>
        <Route path="/login" element={<PublicRoute loading={initializing} user={user}><Login /></PublicRoute>} />
        <Route path="/register" element={<PublicRoute loading={initializing} user={user}><Register /></PublicRoute>} />
        <Route path="/forgot-password" element={<PublicRoute loading={initializing} user={user}><ForgotPassword /></PublicRoute>} />
        <Route path="/" element={<ProtectedRoute loading={initializing} user={user}><Home {...sharedProps} /></ProtectedRoute>} />
        <Route path="/analysis" element={<ProtectedRoute loading={initializing} user={user}><AnalysisView {...sharedProps} /></ProtectedRoute>} />
        <Route path="/dashboard" element={<Navigate to="/analysis" replace />} />
        {import.meta.env.DEV && DevScreenshots && (
          <Route
            path="/dev/screenshot"
            element={(
              <Suspense fallback={<LoadingScreen message="Loading preview..." />}>
                <DevScreenshots {...sharedProps} />
              </Suspense>
            )}
          />
        )}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
};

export default App;
