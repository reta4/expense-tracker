import React from 'react';
import { getCategoryMeta } from '../../assets/categoryConfig';
import EmptyState from './EmptyState';
import { formatMoney } from '../../utils/formatMoney';
import { formatDate } from '../../utils/formatDate';

const getAmount = (exp) => Number(exp.Amount__c ?? exp.amount ?? 0);

export const TransactionRows = ({ items, onEdit, onDelete }) => (
  <div className="app-tx-list">
    {items.map((exp, index) => {
      const meta = getCategoryMeta(exp.Category__c || 'Other');
      return (
        <div key={exp.Id} className="app-tx-row" style={{ animationDelay: `${index * 0.04}s` }}>
          <div className="app-tx-pip" style={{ background: meta.color }} />
          <div className="app-tx-body">
            <div className="app-tx-name">{exp.Name}</div>
            <div className="app-tx-meta">
              <span className="app-tx-tag" style={{ background: meta.light, color: meta.color }}>
                {meta.label}
                {exp.Is_Recurring__c && <span className="et-badge-recurring">Recurring</span>}
              </span>
              <span className="app-tx-sep">·</span>
              <span>{formatDate(exp.Date__c)}</span>
            </div>
          </div>
          <div className="app-tx-actions">
            <div className="app-tx-amount">{formatMoney(getAmount(exp))}</div>
            <button type="button" className="app-tx-act" onClick={() => onEdit(exp)} aria-label="Edit">
              <span className="app-tx-act-text">Edit</span>
            </button>
            <button type="button" className="app-tx-act app-tx-act--delete" onClick={() => onDelete(exp.Id)} aria-label="Delete">
              <span className="app-tx-act-text">Delete</span>
            </button>
          </div>
        </div>
      );
    })}
  </div>
);

const TransactionColumn = ({
  title,
  badge,
  total,
  items,
  onEdit,
  onDelete,
  emptyTitle = 'Nothing here yet',
  emptyDescription,
  emptyActionLabel,
  onEmptyAction,
  isFiltered = false,
}) => (
  <div className="et-col">
    <div className="et-col-head">
      <div className="et-col-head-left">
        {title}
        {' '}
        {badge}
      </div>
      <div className="et-col-total">{total}</div>
    </div>

    <div className="et-list">
      {items.length === 0 ? (
        <EmptyState
          title={isFiltered ? 'No matching expenses' : emptyTitle}
          description={isFiltered ? 'Try a different search or category filter.' : emptyDescription}
          actionLabel={isFiltered ? 'Clear filters' : emptyActionLabel}
          onAction={onEmptyAction}
        />
      ) : (
        <TransactionRows items={items} onEdit={onEdit} onDelete={onDelete} />
      )}
    </div>
  </div>
);

export default TransactionColumn;
