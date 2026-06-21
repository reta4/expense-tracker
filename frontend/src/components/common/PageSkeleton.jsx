import React from 'react';

const PageSkeleton = ({ variant = 'home' }) => (
  <div className={`app-page-shell app-skeleton app-skeleton--${variant}`} aria-busy="true" aria-label="Loading">
    <div className="app-skeleton-topbar app-skeleton-shimmer" />
    <div className="app-skeleton-hero app-skeleton-shimmer" />
    <div className="app-skeleton-metrics">
      {[0, 1, 2, 3].map((i) => (
        <div key={i} className="app-skeleton-metric app-skeleton-shimmer" />
      ))}
    </div>
    <div className="app-skeleton-search app-skeleton-shimmer" />
    {variant === 'home' ? (
      <div className="app-skeleton-columns">
        <div className="app-skeleton-panel app-skeleton-shimmer" />
        <div className="app-skeleton-panel app-skeleton-shimmer" />
      </div>
    ) : (
      <>
        <div className="app-skeleton-chart app-skeleton-shimmer" />
        <div className="app-skeleton-panel app-skeleton-shimmer" />
      </>
    )}
  </div>
);

export default PageSkeleton;
