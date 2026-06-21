import { useCallback, useState } from 'react';
import { auth } from '../services/firebaseConfig';
import { getExpenses, getCategoryPicklistValues } from '../services/salesforceApi';
import { normalizeCategoryValue } from '../utils/categoryNormalize';

export { normalizeCategoryValue };

export const useExpenses = () => {
  const [expenses, setExpenses] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const loadData = useCallback(async (token, options = {}) => {
    const { showLoading = true } = options;
    if (showLoading) setLoading(true);
    setError('');

    try {
      const authToken = token || await auth.currentUser?.getIdToken(true);
      if (!authToken) throw new Error('Not authenticated');

      const [expensesData, categoriesData] = await Promise.all([
        getExpenses(authToken),
        getCategoryPicklistValues(authToken),
      ]);

      setExpenses(expensesData || []);
      setCategories(categoriesData || []);

      return {
        expenses: expensesData || [],
        categories: categoriesData || [],
      };
    } catch {
      setError('Failed to load transaction data.');
      setExpenses([]);
      setCategories([]);
      return { expenses: [], categories: [] };
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
