import React, { useEffect, useRef } from 'react';
import { getCategoryMeta } from '../../assets/categoryConfig';
import { useFocusTrap } from '../../hooks/useFocusTrap';

const TransactionModal = ({
  isOpen,
  editingId,
  formData,
  setFormData,
  categories,
  onClose,
  onSubmit,
  saving = false,
  feedbackTone = null,
}) => {
  const dialogRef = useRef(null);
  useFocusTrap(isOpen, dialogRef);

  useEffect(() => {
    if (!isOpen) return undefined;

    const onKey = (event) => {
      if (event.key === 'Escape' && !saving && !feedbackTone) onClose();
    };

    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [feedbackTone, isOpen, onClose, saving]);

  if (!isOpen) return null;

  const isLocked = saving || Boolean(feedbackTone);
  const overlayClass = [
    'app-tx-modal-overlay',
    feedbackTone ? `app-modal-overlay-feedback app-modal-overlay-feedback--${feedbackTone}` : '',
  ].filter(Boolean).join(' ');

  const dialogClass = [
    'app-tx-modal',
    feedbackTone ? `app-modal-feedback app-modal-feedback--${feedbackTone}` : '',
    isLocked ? 'app-modal--locked' : '',
  ].filter(Boolean).join(' ');

  return (
    <div
      className={overlayClass}
      onClick={isLocked ? undefined : onClose}
      role="presentation"
    >
      <div
        ref={dialogRef}
        className={dialogClass}
        onClick={(event) => event.stopPropagation()}
        role="dialog"
        aria-labelledby="app-tx-modal-title"
        aria-modal="true"
      >
        <div className="app-tx-modal-header">
          <h3 id="app-tx-modal-title" className="app-tx-modal-title">
            {editingId ? 'Edit transaction' : 'Add transaction'}
          </h3>
          <button
            type="button"
            className="app-tx-modal-close"
            onClick={onClose}
            aria-label="Close"
            disabled={isLocked}
          >
            ×
          </button>
        </div>

        <form className="app-tx-modal-form" onSubmit={onSubmit}>
          <div className="app-tx-modal-field">
            <label className="app-tx-modal-label" htmlFor="tx-expense-name">Expense name</label>
            <input
              id="tx-expense-name"
              type="text"
              className="et-input"
              placeholder="Expense name"
              value={formData.Name}
              onChange={(e) => setFormData({ ...formData, Name: e.target.value })}
              required
              autoFocus
            />
          </div>

          <div className="app-tx-modal-field">
            <label className="app-tx-modal-label" htmlFor="tx-expense-amount">Amount ($)</label>
            <input
              id="tx-expense-amount"
              type="number"
              className="et-input"
              placeholder="Amount ($)"
              value={formData.Amount__c}
              onChange={(e) => setFormData({ ...formData, Amount__c: e.target.value })}
              required
            />
          </div>

          <div className="app-tx-modal-field">
            <label className="app-tx-modal-label" htmlFor="tx-expense-date">Date</label>
            <input
              id="tx-expense-date"
              type="date"
              className="et-input"
              value={formData.Date__c}
              onChange={(e) => setFormData({ ...formData, Date__c: e.target.value })}
              required
            />
          </div>

          <div className="app-tx-modal-field">
            <label className="app-tx-modal-label" htmlFor="tx-expense-category">Category</label>
            <select
              id="tx-expense-category"
              className="et-input"
              value={formData.Category__c}
              onChange={(e) => setFormData({ ...formData, Category__c: e.target.value })}
              required
            >
              {categories.map((category) => (
                <option key={category} value={category}>
                  {getCategoryMeta(category).label}
                </option>
              ))}
            </select>
          </div>

          <div className="et-form-check">
            <input
              type="checkbox"
              id="txIsRecurring"
              checked={formData.Is_Recurring__c}
              onChange={(e) => setFormData({ ...formData, Is_Recurring__c: e.target.checked })}
            />
            <label htmlFor="txIsRecurring">Set as recurring transaction</label>
          </div>

          <div className="app-tx-modal-actions">
            <button type="button" className="et-btn et-btn-ghost" onClick={onClose} disabled={isLocked}>
              Cancel
            </button>
            <button type="submit" className="et-btn et-btn-accent" disabled={isLocked}>
              {saving ? 'Saving…' : editingId ? 'Save changes' : 'Add transaction'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TransactionModal;
