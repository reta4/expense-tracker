import React from 'react';

const AuthForm = ({ onSubmit, children, className = '' }) => (
  <form onSubmit={onSubmit} className={`auth-form ${className}`.trim()}>
    {children}
  </form>
);

export default AuthForm;
