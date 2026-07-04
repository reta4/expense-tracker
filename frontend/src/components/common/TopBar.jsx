import React from 'react';
import { useLocation } from 'react-router-dom';
import AppLogo from './AppLogo';
import { MoonIcon, SunIcon } from './NavIcons';

const TopBar = ({
  user,
  dark,
  toggleDark,
  onLogout,
  onNavigateAnalysis,
  onNavigateHome,
  subtitle,
}) => {
  const location = useLocation();

  return (
    <div className="et-topbar-wrap">
      <div className="et-topbar">
        <AppLogo subtitle={subtitle || (user ? `Hey, ${user.firstName}` : undefined)} />

        <div className="et-actions">
          {onNavigateHome && (
            <button
              type="button"
              className={`et-btn et-btn-nav${location.pathname === '/' ? ' active' : ''}`}
              onClick={onNavigateHome}
            >
              Home
            </button>
          )}
          {onNavigateAnalysis && (
            <button
              type="button"
              className={`et-btn et-btn-nav${location.pathname === '/dashboard' ? ' active' : ''}`}
              onClick={onNavigateAnalysis}
            >
              Analysis
            </button>
          )}
          <button
            type="button"
            className="et-btn et-btn-ghost et-btn-icon et-btn-theme"
            onClick={toggleDark}
            title={dark ? 'Switch to light mode' : 'Switch to dark mode'}
            aria-label={dark ? 'Switch to light mode' : 'Switch to dark mode'}
          >
            {dark ? <SunIcon /> : <MoonIcon />}
          </button>
          <button
            type="button"
            className="et-btn et-btn-danger et-btn-logout"
            onClick={onLogout}
            aria-label="Logout"
            title="Logout"
          >
            Logout
          </button>
        </div>
      </div>
    </div>
  );
};

export default TopBar;
