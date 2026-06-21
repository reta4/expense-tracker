import React from 'react';

const Toast = ({ message, visible, type = 'success' }) => (
  <div
    className={`app-toast app-toast--${type}${visible ? ' show' : ''}`}
    role="status"
    aria-live="polite"
  >
    <span className="app-toast-icon" aria-hidden="true">
      {type === 'error' ? '!' : '✓'}
    </span>
    {message}
  </div>
);

export default Toast;
