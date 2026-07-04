import React from 'react';

const AnalysisSummary = ({
  periodLabel,
  total,
  periodTotal,
  entryCount,
  filterMonth,
  filterCategory,
  onClearMonth,
  onClearCategory,
  onClearAll,
  onAddClick,
}) => {
  const displayTotal = periodTotal ?? total;
  const hasFilters = filterMonth !== 'All' || filterCategory !== 'All';
  const entryLabel = entryCount === 1 ? 'transaction' : 'transactions';

  return (
    <section className="et-hero av-summary-hero" aria-label="Spending summary">
      <div className="et-hero-glow" aria-hidden="true" />
      <div className="et-hero-content">
        <p className="et-hero-label">
          Total spending ·
          {' '}
          {periodLabel}
        </p>
        <p className="et-hero-amount">{displayTotal}</p>
        {entryCount != null && (
          <p className="et-hero-sub">
            {entryCount}
            {' '}
            {entryLabel}
            {filterMonth === 'All' ? ' recorded' : ` · ${periodLabel}`}
          </p>
        )}
        {hasFilters && (
          <div className="app-filter-chips av-summary-chips">
            {filterMonth !== 'All' && (
              <button type="button" className="app-chip" onClick={onClearMonth}>
                {periodLabel}
                <span aria-hidden="true"> ×</span>
              </button>
            )}
            {filterCategory !== 'All' && (
              <button type="button" className="app-chip" onClick={onClearCategory}>
                {filterCategory}
                <span aria-hidden="true"> ×</span>
              </button>
            )}
            <button type="button" className="app-chip app-chip-clear" onClick={onClearAll}>
              Clear all
            </button>
          </div>
        )}
      </div>
      {onAddClick ? (
        <button type="button" className="et-btn et-btn-accent et-hero-cta et-hero-cta--visible-mobile" onClick={onAddClick}>
          <span className="et-hero-cta-icon" aria-hidden="true">+</span>
          Add expense
        </button>
      ) : null}
    </section>
  );
};

export default AnalysisSummary;
