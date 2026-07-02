import { useCallback, useState } from 'react';
import { auth } from '../services/firebaseConfig';
import { getExpenses, getCategoryPicklistValues } from '../services/salesforceApi';
import { normalizeCategoryValue } from '../utils/categoryNormalize';

export { normalizeCategoryValue };

let expensesSession = null;

export const clearExpensesSession = () => {
  expensesSession = null;
};

export const hasExpensesSession = () => Boolean(expensesSession);

export const useExpenses = () => {
  const [expenses, setExpenses] = useState(() => expensesSession?.expenses ?? []);
  const [categories, setCategories] = useState(() => expensesSession?.categories ?? []);
  const [loading, setLoading] = useState(() => !expensesSession);
  const [error, setError] = useState('');

  const loadData = useCallback(async (token, options = {}) => {
    const { showLoading = true } = options;
    const hasCache = Boolean(expensesSession);

    if (hasCache && !showLoading) {
      setExpenses(expensesSession.expenses);
      setCategories(expensesSession.categories);
      setLoading(false);
    }

    if (showLoading && !hasCache) setLoading(true);
    setError('');

    try {
      const authToken = token || await auth.currentUser?.getIdToken(true);
      if (!authToken) throw new Error('Not authenticated');

      const [expensesData, categoriesData] = await Promise.all([
        getExpenses(authToken),
        getCategoryPicklistValues(authToken),
      ]);

      const nextExpenses = expensesData || [];
      const nextCategories = categoriesData || [];

      expensesSession = {
        expenses: nextExpenses,
        categories: nextCategories,
      };

      setExpenses(nextExpenses);
      setCategories(nextCategories);

      return {
        expenses: nextExpenses,
        categories: nextCategories,
      };
    } catch {
      setError('Failed to load transaction data.');
      if (!hasCache) {
        expensesSession = null;
        setExpenses([]);
        setCategories([]);
      }
      return { expenses: expensesSession?.expenses ?? [], categories: expensesSession?.categories ?? [] };
    } finally {
      if (showLoading) setLoading(false);
    }
  }, []);

  return {
    expenses,
    categories,
    loading,
    error,
    setCategories,
    loadData,
  };
};

export default useExpenses;
