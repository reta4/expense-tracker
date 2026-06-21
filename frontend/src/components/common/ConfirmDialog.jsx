import React, { useEffect, useRef } from 'react';
import { useFocusTrap } from '../../hooks/useFocusTrap';

const ConfirmDialog = ({
  open,
  title = 'Are you sure?',
  message,
  itemName,
  itemAmount,
  itemCategory,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  onConfirm,
  onCancel,
  variant = 'danger',
  confirming = false,
  feedbackTone = null,
}) => {
  const dialogRef = useRef(null);
  useFocusTrap(open, dialogRef);

  useEffect(() => {
    if (!open) return undefined;

    const onKey = (event) => {
      if (event.key === 'Escape' && !confirming && !feedbackTone) onCancel();
    };

    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [confirming, feedbackTone, onCancel, open]);

  if (!open) return null;

  const isLocked = confirming || Boolean(feedbackTone);
  const hasPreview = Boolean(itemName || itemAmount);
  const overlayClass = [
    'app-confirm-overlay',
    feedbackTone ? `app-modal-overlay-feedback app-modal-overlay-feedback--${feedbackTone}` : '',
  ].filter(Boolean).join(' ');

  const dialogClass = [
    'app-confirm',
    feedbackTone ? `app-modal-feedback app-modal-feedback--${feedbackTone}` : '',
    isLocked ? 'app-modal--locked' : '',
  ].filter(Boolean).join(' ');

  return (
    <div
      className={overlayClass}
      onClick={isLocked ? undefined : onCancel}
      role="presentation"
    >
      <div
        ref={dialogRef}
        className={dialogClass}
        onClick={(event) => event.stopPropagation()}
        role="alertdialog"
        aria-labelledby="app-confirm-title"
        aria-describedby={message ? 'app-confirm-desc' : undefined}
      >
        <div className="app-confirm-icon-wrap" aria-hidden="true">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
            <path d="M3 6h18M8 6V4.5A1.5 1.5 0 0 1 9.5 3h5A1.5 1.5 0 0 1 16 4.5V6m2 0v12.5A1.5 1.5 0 0 1 16.5 20h-9A1.5 1.5 0 0 1 6 18.5V6h12Z" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M10 11v5M14 11v5" strokeLinecap="round" />
          </svg>
        </div>

        <h3 id="app-confirm-title" className="app-confirm-title">{title}</h3>
        {message && <p id="app-confirm-desc" className="app-confirm-desc">{message}</p>}

        {hasPreview && (
          <div className="app-confirm-preview">
            <span className="app-confirm-preview-name">{itemName}</span>
            <div className="app-confirm-preview-meta">
              {itemCategory && <span className="app-confirm-preview-category">{itemCategory}</span>}
              {itemAmount && <span className="app-confirm-preview-amount">{itemAmount}</span>}
            </div>
          </div>
        )}

        <div className="app-confirm-actions">
          <button type="button" className="et-btn et-btn-ghost" onClick={onCancel} disabled={isLocked}>
            {cancelLabel}
          </button>
          <button
            type="button"
            className={`et-btn app-confirm-btn app-confirm-btn--${variant}`}
            onClick={onConfirm}
            disabled={isLocked}
          >
            {confirming ? 'Deleting…' : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmDialog;
