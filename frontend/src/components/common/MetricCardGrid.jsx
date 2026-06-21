import React from 'react';

const MetricCardGrid = ({ metrics, className = '' }) => (
  <div className={`app-metric-grid${className ? ` ${className}` : ''}`}>
    {metrics.map((metric, index) => (
      <div
        key={metric.label}
        className="app-metric"
        style={{
          '--metric-color': metric.color,
          animationDelay: metric.delay ?? `${0.05 + index * 0.06}s`,
        }}
      >
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
      </div>
    ))}
  </div>
);

export default MetricCardGrid;
