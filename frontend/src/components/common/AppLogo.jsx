import React from 'react';

const AppLogo = ({ subtitle }) => (
  <div className="app-logo">
    <div className="app-logo-mark">ET</div>
    <div>
      <div className="app-logo-text">Expense Tracker</div>
      {subtitle && <div className="app-logo-sub">{subtitle}</div>}
    </div>
  </div>
);

export default AppLogo;
