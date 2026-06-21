import React from 'react';

const LoadingScreen = ({ message = 'Loading...' }) => (
  <div className="app-loading">
    <div className="app-loading-mark" aria-hidden="true">ET</div>
    <div className="app-spinner" aria-hidden="true" />
    <span className="app-loading-text">{message}</span>
  </div>
);

export default LoadingScreen;
