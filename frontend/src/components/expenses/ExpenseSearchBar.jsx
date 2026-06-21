import React from 'react';
import { getCategoryMeta } from '../../assets/categoryConfig';

const SearchIcon = () => (
  <svg className="et-search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
    <circle cx="11" cy="11" r="7" />
    <path d="M20 20l-3.5-3.5" strokeLinecap="round" />
  </svg>
);

const ExpenseSearchBar = ({
  searchQuery,
  onSearchChange,
  filterCategory,
  onCategoryChange,
  categories,
  resultCount,
  totalCount,
  onClearAll,
}) => {
  const hasFilters = Boolean(searchQuery.trim()) || filterCategory !== 'All';

  return (
    <section className="et-search-card" aria-label="Search and filter transactions">
      <div className="et-search-card-head">
        <h2 className="et-search-card-title">Find transactions</h2>
        <span className="et-search-card-meta">
          {hasFilters ? `${resultCount} matching` : `${totalCount} total`}
        </span>
      </div>

      <div className="et-search-wrap">
        <div className="et-search-bar">
          <div className="et-search-field">
            <input
              type="search"
              className="et-input et-search-input"
              placeholder="Search by name..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              aria-label="Search expenses"
            />
            <SearchIcon />
          </div>
          <select
            className="et-input et-search-select"
            value={filterCategory}
            onChange={(e) => onCategoryChange(e.target.value)}
            aria-label="Filter by category"
          >
            <option value="All">All categories</option>
            {categories.map((category) => (
              <option key={category} value={category}>
                {getCategoryMeta(category).label}
              </option>
            ))}
          </select>
        </div>

        {hasFilters && (
          <div className="app-filter-chips">
            {searchQuery.trim() && (
              <button type="button" className="app-chip" onClick={() => onSearchChange('')}>
                Search: &quot;{searchQuery.trim()}&quot;
                <span aria-hidden="true">×</span>
              </button>
            )}
            {filterCategory !== 'All' && (
              <button type="button" className="app-chip" onClick={() => onCategoryChange('All')}>
                {getCategoryMeta(filterCategory).label}
                <span aria-hidden="true">×</span>
              </button>
            )}
            <button type="button" className="app-chip app-chip-clear" onClick={onClearAll}>
              Clear all
            </button>
          </div>
        )}
      </div>
    </section>
  );
};

export default ExpenseSearchBar;
