import React from 'react';
import AppLogo from '../common/AppLogo';

const AuthCard = ({ title, subtitle, children }) => (
  <div className="auth-shell">
    <div className="auth-card">
      <div className="auth-brand">
        <AppLogo />
      </div>
      <h1 className="auth-title">{title}</h1>
      {subtitle && <p className="auth-subtitle">{subtitle}</p>}
      {children}
    </div>
  </div>
);

export default AuthCard;
