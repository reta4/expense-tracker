import React from 'react';

const EMPTY_ICONS = {
  wallet: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden="true">
      <path d="M3 7.5A2.5 2.5 0 0 1 5.5 5H18a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H5.5A2.5 2.5 0 0 1 3 16.5v-9Z" />
      <path d="M16 12h3" strokeLinecap="round" />
    </svg>
  ),
  calendar: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden="true">
      <path d="M7 3v3M17 3v3M4.5 9h15" strokeLinecap="round" />
      <path d="M6 6h12a2 2 0 0 1 2 2v11a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2Z" />
    </svg>
  ),
  search: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden="true">
      <circle cx="11" cy="11" r="6" />
      <path d="m16 16 4.5 4.5" strokeLinecap="round" />
    </svg>
  ),
  chart: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden="true">
      <path d="M4 19V5M4 19h16M8 17V11M12 17V7M16 17v-4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
};

const EmptyState = ({ title, description, actionLabel, onAction, icon = 'wallet' }) => (
  <div className="app-empty">
    <div className="app-empty-icon-wrap" aria-hidden="true">
      {EMPTY_ICONS[icon] || EMPTY_ICONS.wallet}
    </div>
    <p className="app-empty-title">{title}</p>
    {description && <p className="app-empty-desc">{description}</p>}
    {actionLabel && onAction && (
      <button type="button" className="et-btn et-btn-accent app-empty-action" onClick={onAction}>
        {actionLabel}
      </button>
    )}
  </div>
);

export default EmptyState;
