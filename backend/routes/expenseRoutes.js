const express = require('express');
const { validateFirebaseToken } = require('../middleware/auth');
const { resolveUserContact } = require('../middleware/resolveContact');
const { assertExpenseOwnership } = require('../middleware/expenseOwnership');
const {
  getExpenses,
  getCategoryPicklistValues,
  createExpense,
  updateExpense,
  deleteExpense,
  DEFAULT_CATEGORY_VALUES,
} = require('../services/salesforceService');

const router = express.Router();

const formatSalesforceError = (error, fallback) => {
  if (!error.response?.data) return fallback;
  const sfError = error.response.data[0];
  let errorMessage = sfError?.message || fallback;
  if (errorMessage.includes('FIELD_CUSTOM_VALIDATION_EXCEPTION, ')) {
    errorMessage = errorMessage.replace('FIELD_CUSTOM_VALIDATION_EXCEPTION, ', '').split(':')[0];
  }
  return errorMessage;
};

router.get('/expenses', validateFirebaseToken, resolveUserContact, async (req, res) => {
  try {
    const records = await getExpenses(req.contactId);
    return res.json(records);
  } catch (error) {
    console.error('Failed to load expenses:', error.message);
    return res.status(500).json({ error: 'Unable to load expenses' });
  }
});

router.post('/expenses', validateFirebaseToken, resolveUserContact, async (req, res) => {
  try {
    const result = await createExpense(req.body, req.contactId);
    return res.status(201).json(result);
  } catch (error) {
    return res.status(400).json({ error: formatSalesforceError(error, 'Unable to create expense') });
  }
});

router.put('/expenses/:id', validateFirebaseToken, resolveUserContact, assertExpenseOwnership, async (req, res) => {
  try {
    await updateExpense(req.params.id, req.body);
    return res.json({ success: true });
  } catch (error) {
    return res.status(400).json({ error: formatSalesforceError(error, 'Unable to update expense') });
  }
});

router.delete('/expenses/:id', validateFirebaseToken, resolveUserContact, assertExpenseOwnership, async (req, res) => {
  try {
    await deleteExpense(req.params.id);
    return res.json({ success: true });
  } catch (error) {
    console.error('Failed to delete expense:', error.message);
    return res.status(500).json({ error: 'Unable to delete expense' });
  }
});

router.get('/categories', validateFirebaseToken, async (req, res) => {
  try {
    const values = await getCategoryPicklistValues();
    return res.json(values);
  } catch (error) {
    return res.json(DEFAULT_CATEGORY_VALUES);
  }
});

module.exports = router;
