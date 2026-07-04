import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { useLocation, useNavigate } from 'react-router-dom';
import { ChartIcon, HomeIcon } from './NavIcons';

const NAV_ITEMS = [
  { path: '/', label: 'Home', Icon: HomeIcon },
  { path: '/analysis', label: 'Analysis', Icon: ChartIcon },
];

const BottomNav = () => {
  const [mounted, setMounted] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return createPortal(
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
    </nav>,
    document.body,
  );
};

export default BottomNav;
