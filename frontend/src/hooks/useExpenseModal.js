import { useCallback, useEffect, useState } from 'react';
import { auth } from '../services/firebaseConfig';
import {
  createExpense,
  deleteExpense,
  getApiErrorMessage,
  updateExpense,
} from '../services/salesforceApi';
import { normalizeCategoryValue } from '../utils/categoryNormalize';
import { getCategoryMeta } from '../assets/categoryConfig';
import { formatMoney } from '../utils/formatMoney';
import { INITIAL_EXPENSE_FORM } from '../constants/expenseForm';

const MODAL_FEEDBACK_MS = 900;

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const toDateInputValue = (value) => {
  if (!value) return '';
  const raw = String(value);
  if (/^\d{4}-\d{2}-\d{2}$/.test(raw)) return raw;
  return raw.split('T')[0] || raw;
};

export const useExpenseModal = ({
  contactId,
  categories,
  setCategories,
  expenses,
  loadData,
  showToast,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState(INITIAL_EXPENSE_FORM);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [modalFeedback, setModalFeedback] = useState(null);
  const [deleteFeedback, setDeleteFeedback] = useState(null);
  const [saveError, setSaveError] = useState('');

  const defaultCategory = categories[0] || 'Other';

  const clearSaveError = useCallback(() => {
    setSaveError('');
  }, []);

  const updateFormData = useCallback((next) => {
    setSaveError('');
    setFormData(next);
  }, []);

  useEffect(() => {
    if (!categories.length || formData.Category__c) return;
    setFormData((prev) => ({ ...prev, Category__c: defaultCategory }));
  }, [categories, defaultCategory, formData.Category__c]);

  const openAddModal = useCallback(() => {
    setEditingId(null);
    setSaveError('');
    setFormData({ ...INITIAL_EXPENSE_FORM, Category__c: defaultCategory });
    setIsModalOpen(true);
  }, [defaultCategory]);

  const closeModal = useCallback(() => {
    if (modalFeedback || saving) return;
    setSaveError('');
    setIsModalOpen(false);
    setEditingId(null);
    setFormData({ ...INITIAL_EXPENSE_FORM, Category__c: defaultCategory });
  }, [defaultCategory, modalFeedback, saving]);

  const openEditModal = useCallback((exp) => {
    const normalizedCategory = normalizeCategoryValue(exp.Category__c || 'Other');
    setSaveError('');
    setEditingId(exp.Id);
    setFormData({
      Name: exp.Name,
      Amount__c: exp.Amount__c,
      Category__c: normalizedCategory,
      Date__c: toDateInputValue(exp.Date__c),
      Is_Recurring__c: exp.Is_Recurring__c || false,
    });
    if (setCategories) {
      setCategories((prev) => (prev.includes(normalizedCategory) ? prev : [...prev, normalizedCategory]));
    }
    setIsModalOpen(true);
  }, [setCategories]);

  const handleSubmit = useCallback(async (event) => {
    event.preventDefault();

    if (!contactId) {
      showToast('Error: Missing Salesforce identity details.', 'error');
      return;
    }

    const payload = {
      Name: formData.Name,
      Amount__c: parseFloat(formData.Amount__c),
      Date__c: formData.Date__c,
      Category__c: normalizeCategoryValue(formData.Category__c),
      Is_Recurring__c: formData.Is_Recurring__c,
    };

    try {
      setSaving(true);
      setSaveError('');
      const token = await auth.currentUser?.getIdToken(true);
      if (!token) throw new Error('Not authenticated');

      const wasEditing = Boolean(editingId);

      if (editingId) {
        await updateExpense(editingId, payload, token);
      } else {
        await createExpense(payload, token);
      }

      setModalFeedback(wasEditing ? 'edit' : 'create');
      await wait(MODAL_FEEDBACK_MS);

      setIsModalOpen(false);
      setModalFeedback(null);
      setEditingId(null);
      setFormData({ ...INITIAL_EXPENSE_FORM, Category__c: defaultCategory });
      await loadData(token, { showLoading: false });
      showToast(wasEditing ? 'Transaction updated successfully' : 'Transaction added successfully');
    } catch (err) {
      setSaveError(getApiErrorMessage(err, 'Failed to save transaction'));
    } finally {
      setSaving(false);
    }
  }, [contactId, defaultCategory, editingId, formData, loadData, showToast]);

  const requestDelete = useCallback((id) => {
    const exp = expenses.find((item) => item.Id === id);
    if (!exp) return;

    setDeleteTarget({
      id,
      name: exp.Name,
      amount: formatMoney(exp.Amount__c ?? exp.amount),
      category: getCategoryMeta(exp.Category__c || 'Other').label,
    });
  }, [expenses]);

  const closeDeleteDialog = useCallback(() => {
    if (deleteFeedback || deleting) return;
    setDeleteTarget(null);
  }, [deleteFeedback, deleting]);

  const confirmDelete = useCallback(async () => {
    if (!deleteTarget || deleting || deleteFeedback) return;

    try {
      setDeleting(true);
      const token = await auth.currentUser?.getIdToken(true);
      if (!token) throw new Error('Not authenticated');

      await deleteExpense(deleteTarget.id, token);
      setDeleteFeedback('delete');
      await wait(MODAL_FEEDBACK_MS);

      setDeleteTarget(null);
      setDeleteFeedback(null);
      await loadData(token, { showLoading: false });
      showToast('Transaction deleted successfully');
    } catch (err) {
      showToast(getApiErrorMessage(err, 'Unable to delete transaction. Please try again.'), 'error');
      setDeleteFeedback(null);
    } finally {
      setDeleting(false);
    }
  }, [deleteFeedback, deleteTarget, deleting, loadData, showToast]);

  return {
    isModalOpen,
    editingId,
    formData,
    setFormData: updateFormData,
    saveError,
    clearSaveError,
    deleteTarget,
    saving,
    deleting,
    modalFeedback,
    deleteFeedback,
    openAddModal,
    closeModal,
    openEditModal,
    handleSubmit,
    requestDelete,
    closeDeleteDialog,
    confirmDelete,
  };
};

export default useExpenseModal;
