import React from 'react';

const MetricCard = ({ metric, index }) => {
  const content = (
    <>
      <div className="app-metric-stripe" style={{ background: metric.color }} />
      <div className="app-metric-label">{metric.label}</div>
      <div className="app-metric-value">{metric.value}</div>
      <div className={`app-metric-sub${metric.subTone ? ` app-metric-sub--${metric.subTone}` : ''}`}>
        {metric.sub}
      </div>
      <div className="app-metric-bar">
        <div
          className="app-metric-bar-fill"
          style={{ '--w': `${metric.pct}%`, width: `${metric.pct}%`, background: metric.color }}
        />
      </div>
    </>
  );

  const style = {
    '--metric-color': metric.color,
    animationDelay: metric.delay ?? `${0.05 + index * 0.06}s`,
  };

  if (metric.onClick) {
    return (
      <button
        type="button"
        className="app-metric app-metric--clickable"
        style={style}
        onClick={metric.onClick}
        aria-label={`${metric.label}: scroll to ${metric.label === 'Upcoming' ? 'upcoming expenses' : 'current expenses'}`}
      >
        {content}
      </button>
    );
  }

  return (
    <div className="app-metric" style={style}>
      {content}
    </div>
  );
};

const MetricCardGrid = ({ metrics, className = '' }) => (
  <div className={`app-metric-grid${className ? ` ${className}` : ''}`}>
    {metrics.map((metric, index) => (
      <MetricCard key={metric.label} metric={metric} index={index} />
    ))}
  </div>
);

export default MetricCardGrid;
