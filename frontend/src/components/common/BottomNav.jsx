import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ChartIcon, HomeIcon } from './NavIcons';

const NAV_ITEMS = [
  { path: '/', label: 'Home', Icon: HomeIcon },
  { path: '/dashboard', label: 'Analysis', Icon: ChartIcon },
];

const BottomNav = () => {
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <nav className="app-bottom-nav" aria-label="Main navigation">
      {NAV_ITEMS.map((item) => {
        const isActive = location.pathname === item.path;
        const { Icon } = item;

        return (
          <button
            key={item.path}
            type="button"
            className={`app-bottom-nav-item${isActive ? ' active' : ''}`}
            onClick={() => navigate(item.path)}
            aria-current={isActive ? 'page' : undefined}
          >
            <Icon />
            <span className="app-bottom-nav-label">{item.label}</span>
          </button>
        );
      })}
    </nav>
  );
};

export default BottomNav;
