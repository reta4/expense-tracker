import React from 'react';
import DonutChart from './DonutChart';
import EmptyState from '../common/EmptyState';
import { formatMoney } from '../../utils/formatMoney';

const CategoryBreakdown = ({ donutSegments, filterCategory, setFilterCategory, filterMonthLabel }) => {
  const periodLabel = filterMonthLabel ?? 'All time';
  const total = donutSegments.reduce((sum, segment) => sum + segment.val, 0);
  const isCategoryFiltered = filterCategory !== 'All';

  const handleCategorySelect = (name) => {
    setFilterCategory(name === filterCategory ? 'All' : name);
  };

  const visibleSegments = isCategoryFiltered
    ? donutSegments.filter((segment) => segment.name === filterCategory)
    : donutSegments;

  const selectedSegment = isCategoryFiltered
    ? donutSegments.find((segment) => segment.name === filterCategory)
    : null;

  return (
    <div className="av-card av-card--categories" style={{ animationDelay: '.18s' }}>
      <div className="av-card-header">
        <span className="av-card-title">Spending by category</span>
        <span className="av-period-badge">{periodLabel}</span>
      </div>

      {donutSegments.length === 0 ? (
        <EmptyState
          title="No categorized records"
          description="No spending data for this period."
          icon="chart"
        />
      ) : (
        <div className="av-donut-section">
          <div className="av-cat-list">
            {isCategoryFiltered && (
              <button
                type="button"
                className="av-cat-show-all"
                onClick={() => setFilterCategory('All')}
              >
                Show all categories
              </button>
            )}

            {visibleSegments.map((segment) => (
              <button
                key={segment.name}
                type="button"
                className={`av-cat-row${filterCategory === segment.name ? ' active' : ''}`}
                onClick={() => handleCategorySelect(segment.name)}
                aria-pressed={filterCategory === segment.name}
              >
                <div className="av-cat-head">
                  <span className="av-cat-dot" style={{ background: segment.color }} />
                  <span className="av-cat-name">{segment.label}</span>
                  <span className="av-cat-amount">{formatMoney(segment.val)}</span>
                  <span className="av-cat-pct" style={{ color: segment.color }}>
                    {Math.round(segment.percent)}%
                  </span>
                </div>
                <div className="av-progress-bg">
                  <div
                    className="av-progress-fill"
                    style={{ width: `${segment.percent}%`, background: segment.color }}
                  />
                </div>
              </button>
            ))}
          </div>

          <div className="av-donut-visual">
            <DonutChart
              segments={donutSegments}
              total={total}
              filterCategory={filterCategory}
              onSegmentClick={handleCategorySelect}
            />
            <p className="av-donut-caption">
              {selectedSegment
                ? `${selectedSegment.label} · ${formatMoney(selectedSegment.val)}`
                : `${donutSegments.length} categories · ${formatMoney(total)}`}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default CategoryBreakdown;
