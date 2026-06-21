import axios from 'axios';
import { auth } from './firebaseConfig';
import { API_BASE } from '../config/api';
import { normalizeCategoryValue } from '../utils/categoryNormalize';

export { normalizeCategoryValue };

const getHeaders = (token) => ({
  Authorization: `Bearer ${token}`,
  'Content-Type': 'application/json',
});

const getErrorPayload = (error) => {
  const message = error?.response?.data?.error || error?.message || 'Request failed';
  const normalizedError = new Error(message);
  normalizedError.response = error?.response;
  return normalizedError;
};

const request = async (method, path, { token, data, params } = {}) => {
  try {
    const authToken = token || (auth.currentUser ? await auth.currentUser.getIdToken() : null);
    if (!authToken) throw new Error('Not authenticated');

    const response = await axios.request({
      method,
      url: `${API_BASE}${path}`,
      headers: getHeaders(authToken),
      data,
      params,
    });

    return response.data;
  } catch (error) {
    throw getErrorPayload(error);
  }
};

export const getExpenses = async (token) => request('get', '/expenses', { token });

export const getCategoryPicklistValues = async (token) => {
  try {
    const values = await request('get', '/categories', { token });
    return (values || []).map(normalizeCategoryValue);
  } catch {
    return [];
  }
};

export const createExpense = async (expenseData, token) => request('post', '/expenses', { token, data: expenseData });

export const updateExpense = async (id, expenseData, token) => request('put', `/expenses/${id}`, { token, data: expenseData });

export const deleteExpense = async (id, token) => request('delete', `/expenses/${id}`, { token });

export const createSalesforceContact = async ({ firstName, lastName }, token) => (
  request('post', '/create-contact', { token, data: { firstName, lastName } })
);
