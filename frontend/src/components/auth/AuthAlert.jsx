import React from 'react';

const AuthAlert = ({ type = 'error', message }) => {
  if (!message) return null;
  return (
    <div className={`auth-alert auth-alert--${type}`} role="alert">
      {message}
    </div>
  );
};

export default AuthAlert;
