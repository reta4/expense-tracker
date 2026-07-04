import React from 'react';
import { formatMoney } from '../../utils/formatMoney';

const MonthlyHero = ({ monthLabel, total, transactionCount, trendLabel, trendTone, onAddClick }) => (
  <section className="et-hero" aria-label="Monthly spending summary">
    <div className="et-hero-glow" aria-hidden="true" />
    <div className="et-hero-content">
      <p className="et-hero-label">{monthLabel}</p>
      <p className="et-hero-amount">{formatMoney(total)}</p>
      <p className="et-hero-sub">
        {transactionCount}
        {' '}
        transaction
        {transactionCount === 1 ? '' : 's'}
        {' '}
        this month
      </p>
      {trendLabel && (
        <p className={`et-hero-trend${trendTone ? ` et-hero-trend--${trendTone}` : ''}`}>
          {trendLabel}
        </p>
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

export default MonthlyHero;
