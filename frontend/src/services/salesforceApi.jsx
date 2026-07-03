import axios from 'axios';
import { auth } from './firebaseConfig';
import { API_URL } from '../config/api';
import { normalizeCategoryValue } from '../utils/categoryNormalize';

export { normalizeCategoryValue };

const getHeaders = (token) => ({
  Authorization: `Bearer ${token}`,
  'Content-Type': 'application/json',
});

const stripSalesforceValidationPrefix = (message) => {
  if (!message || !message.includes('FIELD_CUSTOM_VALIDATION_EXCEPTION')) return message;

  return message
    .replace(/FIELD_CUSTOM_VALIDATION_EXCEPTION,?\s*/i, '')
    .split(':')[0]
    .trim();
};

export const extractServerErrorMessage = (responseData, fallback = 'An error occurred') => {
  if (responseData?.success === false && typeof responseData?.error === 'string' && responseData.error.trim()) {
    return responseData.error.trim();
  }

  if (typeof responseData === 'string' && responseData.trim()) {
    return stripSalesforceValidationPrefix(responseData.trim()) || fallback;
  }

  if (typeof responseData?.error === 'string' && responseData.error.trim()) {
    return responseData.error.trim();
  }

  if (Array.isArray(responseData) && responseData[0]?.message) {
    const cleaned = stripSalesforceValidationPrefix(responseData[0].message);
    return cleaned || fallback;
  }

  if (typeof responseData?.message === 'string' && responseData.message.trim()) {
    return stripSalesforceValidationPrefix(responseData.message.trim()) || fallback;
  }

  return fallback;
};

const getErrorPayload = (error, fallback = 'An error occurred') => {
  const responseData = error?.response?.data;
  const errorMessage = extractServerErrorMessage(responseData, fallback);

  const normalizedError = new Error(errorMessage);
  normalizedError.response = error?.response;
  normalizedError.status = error?.response?.status;
  return normalizedError;
};

const request = async (method, path, { token, data, params, fallback = 'An error occurred' } = {}) => {
  const authToken = token || (auth.currentUser ? await auth.currentUser.getIdToken() : null);
  if (!authToken) throw new Error('Not authenticated');

  const response = await axios.request({
    method,
    url: `${API_URL}${path}`,
    headers: getHeaders(authToken),
    data,
    params,
    validateStatus: () => true,
  });

  if (response.status >= 200 && response.status < 300) {
    if (response.data?.success === false) {
      const errorMessage = extractServerErrorMessage(response.data, fallback);
      const normalizedError = new Error(errorMessage);
      normalizedError.response = response;
      normalizedError.status = response.status;
      normalizedError.isValidationError = true;
      throw normalizedError;
    }

    return response.data;
  }

  const errorMessage = extractServerErrorMessage(response.data, fallback);
  const normalizedError = new Error(errorMessage);
  normalizedError.response = response;
  normalizedError.status = response.status;
  throw normalizedError;
};

export const getApiErrorMessage = (error, fallback = 'An error occurred') => {
  if (error instanceof Error && error.message && error.message !== fallback && error.message !== 'An error occurred') {
    return error.message;
  }

  return extractServerErrorMessage(error?.response?.data, fallback);
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

export const createExpense = (expenseData, token) => (
  request('post', '/expenses', { token, data: expenseData, fallback: 'Failed to save transaction' })
);

export const updateExpense = (id, expenseData, token) => (
  request('put', `/expenses/${id}`, { token, data: expenseData, fallback: 'Failed to save transaction' })
);

export const deleteExpense = (id, token) => (
  request('delete', `/expenses/${id}`, { token, fallback: 'Unable to delete transaction. Please try again.' })
);

export const createSalesforceContact = ({ firstName, lastName }, token) => (
  request('post', '/create-contact', { token, data: { firstName, lastName }, fallback: 'Failed to create Salesforce contact' })
);
