import React from 'react';
import { formatMoney } from '../../utils/formatMoney';

const polarToCartesian = (cx, cy, r, angleDeg) => {
  const angleRad = ((angleDeg - 90) * Math.PI) / 180;
  return {
    x: cx + r * Math.cos(angleRad),
    y: cy + r * Math.sin(angleRad),
  };
};

const describeArc = (cx, cy, r, startPct, endPct) => {
  if (endPct - startPct <= 0) return '';

  const startAngle = startPct * 3.6;
  const endAngle = endPct * 3.6;
  const span = endAngle - startAngle;

  if (span >= 359.99) {
    return [
      `M ${cx} ${cy - r}`,
      `A ${r} ${r} 0 1 1 ${cx - 0.01} ${cy - r}`,
    ].join(' ');
  }

  const start = polarToCartesian(cx, cy, r, startAngle);
  const end = polarToCartesian(cx, cy, r, endAngle);
  const largeArc = span > 180 ? 1 : 0;

  return `M ${start.x} ${start.y} A ${r} ${r} 0 ${largeArc} 1 ${end.x} ${end.y}`;
};

const DonutChart = ({ segments, total, filterCategory = 'All', onSegmentClick }) => {
  const R = 54;
  const CX = 80;
  const CY = 80;
  const STROKE = 16;

  let cumulative = 0;
  const arcs = segments.map((segment) => {
    const startPct = cumulative;
    cumulative += segment.percent;
    const endPct = cumulative;
    return {
      ...segment,
      path: describeArc(CX, CY, R, startPct, endPct),
      startPct,
      endPct,
    };
  });

  const chartTotal = total ?? segments.reduce((sum, item) => sum + item.val, 0);
  const totalStr = chartTotal >= 1000
    ? `$${(chartTotal / 1000).toFixed(1)}K`
    : formatMoney(chartTotal);

  const centerLabel = 'In total';
  const isFiltered = filterCategory !== 'All';

  return (
    <svg viewBox="0 0 160 160" className="av-donut-svg" role="img" aria-label={`${totalStr} ${centerLabel.toLowerCase()}`}>
      <circle cx={CX} cy={CY} r={R} className="av-donut-track" />
      {arcs.map((arc, index) => {
        if (!arc.path || arc.percent === 0) return null;

        const isActive = filterCategory === arc.name;
        const isDimmed = isFiltered && !isActive;

        return (
          <g key={arc.name} className="av-ring-group">
            <path
              d={arc.path}
              fill="none"
              stroke="transparent"
              strokeWidth={STROKE + 10}
              className="av-ring-hit"
              onClick={() => onSegmentClick?.(arc.name)}
              aria-label={`Filter by ${arc.label}`}
            />
            <path
              d={arc.path}
              fill="none"
              stroke={arc.color}
              strokeWidth={isActive ? STROKE + 2 : STROKE}
              strokeLinecap="butt"
              className={`av-ring-segment${isActive ? ' active' : ''}${isDimmed ? ' dimmed' : ''}`}
              pointerEvents="none"
              style={{
                filter: isActive ? `drop-shadow(0 0 6px ${arc.color})` : undefined,
                transition: `stroke-width 0.2s ease, opacity 0.25s ease, filter 0.25s ease, stroke-dashoffset ${0.5 + index * 0.08}s cubic-bezier(.22,1,.36,1)`,
              }}
            />
          </g>
        );
      })}
      <text x={CX} y={CY - 8} textAnchor="middle" className="av-donut-total">
        {totalStr}
      </text>
      <text x={CX} y={CY + 12} textAnchor="middle" className="av-donut-label">
        {centerLabel}
      </text>
    </svg>
  );
};

export default DonutChart;
