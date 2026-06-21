import React, { useMemo } from 'react';
import { formatMoney } from '../../utils/formatMoney';
import EmptyState from '../common/EmptyState';

const MonthlyTrends = ({ barData, monthFilterOptions, filterMonth, setFilterMonth }) => {
  const hasTrendData = barData.some((bar) => bar.total > 0);
  const hasFutureBars = barData.some((bar) => bar.isFuture && bar.total > 0);

  const getMonthTotal = (monthKey) => {
    const fromChart = barData.find((bar) => bar.key === monthKey);
    if (fromChart) return fromChart.total;
    return monthFilterOptions.all.find((option) => option.key === monthKey)?.total ?? 0;
  };

  const summary = useMemo(() => {
    if (!hasTrendData) return { label: 'No recent spending', total: formatMoney(0) };
    if (filterMonth === 'All') {
      const total = barData.reduce((sum, bar) => sum + bar.total, 0);
      return {
        label: hasFutureBars ? 'Last 7 months + planned' : 'Last 7 months',
        total: formatMoney(total),
      };
    }
    const selectedLabel = monthFilterOptions.all.find((option) => option.key === filterMonth)?.label
      ?? barData.find((bar) => bar.key === filterMonth)?.label
      ?? 'Selected month';
    return {
      label: `${selectedLabel} selected`,
      total: formatMoney(getMonthTotal(filterMonth)),
    };
  }, [barData, filterMonth, hasFutureBars, hasTrendData, monthFilterOptions.all]);

  const toggleMonth = (key) => {
    setFilterMonth(filterMonth === key ? 'All' : key);
  };

  const { pastByYear, future } = monthFilterOptions;

  return (
    <div className="av-card av-card--trends" style={{ animationDelay: '.1s' }}>
      <div className="av-card-header av-trends-header">
        <div className="av-trends-heading">
          <span className="av-card-title">Monthly trends</span>
          <p className="av-trends-summary">
            <span className="av-trends-summary-total">{summary.total}</span>
            <span className="av-trends-summary-label">{summary.label}</span>
          </p>
        </div>
        <select
          className="av-period-select"
          value={filterMonth}
          onChange={(event) => setFilterMonth(event.target.value)}
          aria-label="Filter by month"
        >
          <option value="All">All time</option>
          {pastByYear.map(({ year, options }) => (
            <optgroup key={year} label={String(year)}>
              {options.map((option) => (
                <option key={option.key} value={option.key}>
                  {option.label}
                </option>
              ))}
            </optgroup>
          ))}
          {future.length > 0 && (
            <optgroup label="Upcoming">
              {future.map((option) => (
                <option key={option.key} value={option.key}>
                  {option.label}
                </option>
              ))}
            </optgroup>
          )}
        </select>
      </div>

      {!hasTrendData ? (
        <EmptyState
          title="No trend data yet"
          description="Add expenses in recent months or plan upcoming payments to see trends."
          icon="chart"
        />
      ) : (
        <div className="av-trends-chart" role="img" aria-label="Monthly spending bar chart">
          <div className="av-trends-grid" aria-hidden="true">
            {[0, 1, 2, 3].map((line) => (
              <span key={line} className="av-trends-grid-line" />
            ))}
          </div>

          <div className={`av-bars${barData.length <= 5 ? ' av-bars--centered' : ''}`}>
            {barData.map((bar) => {
              const isActive = filterMonth === bar.key;
              const isDimmed = filterMonth !== 'All' && !isActive;
              const barHeight = Math.max(bar.pct, bar.total > 0 ? 8 : 0);

              return (
                <button
                  key={bar.key}
                  type="button"
                  className={`av-bar-col${bar.isFuture ? ' av-bar-col--future' : ''}${isActive ? ' active' : ''}${isDimmed ? ' dimmed' : ''}`}
                  onClick={() => toggleMonth(bar.key)}
                  title={`${bar.label}: ${formatMoney(bar.total)}`}
                  aria-pressed={isActive}
                  aria-label={`${bar.label}, ${formatMoney(bar.total)}`}
                >
                  <span className="av-bar-amount">{bar.total > 0 ? formatMoney(bar.total) : '\u00a0'}</span>
                  <div className="av-bar-track">
                    <div
                      className="av-bar-fill"
                      style={{ height: `${barHeight}%`, animationDelay: `${bar.delay}s` }}
                    />
                  </div>
                  <span className="av-bar-label">{bar.label}</span>
                </button>
              );
            })}
          </div>

          <p className="av-trends-hint">
            {hasFutureBars
              ? 'Purple bars are planned · tap any bar to filter'
              : 'Tap a bar to filter the dashboard by month'}
          </p>
        </div>
      )}
    </div>
  );
};

export default MonthlyTrends;
