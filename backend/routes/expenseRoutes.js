const express = require('express');
const { validateFirebaseToken } = require('../middleware/auth');
const { resolveUserContact } = require('../middleware/resolveContact');
const { assertExpenseOwnership } = require('../middleware/expenseOwnership');
const {
  formatSalesforceError,
  isSalesforceClientError,
} = require('../utils/salesforceErrors');
const {
  getExpenses,
  getContactSummary,
  getCategoryPicklistValues,
  createExpense,
  updateExpense,
  deleteExpense,
  DEFAULT_CATEGORY_VALUES,
} = require('../services/salesforceService');

const router = express.Router();

const respondSalesforceWriteError = (res, error, fallback) => {
  if (isSalesforceClientError(error)) {
    const cleanMessage = formatSalesforceError(error, fallback);
    // 200 keeps expected validation failures out of the browser console as HTTP errors.
    return res.status(200).json({ success: false, error: cleanMessage });
  }

  console.error(fallback, error.response?.data || error.message);
  return res.status(500).json({ error: fallback });
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

router.get('/user/summary', validateFirebaseToken, resolveUserContact, async (req, res) => {
  try {
    const summary = await getContactSummary(req.contactId);

    if (!summary) {
      return res.status(404).json({ error: 'Contact not found' });
    }

    return res.json(summary);
  } catch (error) {
    console.error('Failed to load user summary:', error.message);
    return res.status(500).json({ error: 'Unable to load user summary' });
  }
});

router.post('/expenses', validateFirebaseToken, resolveUserContact, async (req, res) => {
  try {
    const result = await createExpense(req.body, req.contactId);
    return res.status(201).json(result);
  } catch (error) {
    return respondSalesforceWriteError(res, error, 'Unable to create expense');
  }
});

router.put('/expenses/:id', validateFirebaseToken, resolveUserContact, assertExpenseOwnership, async (req, res) => {
  try {
    await updateExpense(req.params.id, req.body);
    return res.json({ success: true });
  } catch (error) {
    return respondSalesforceWriteError(res, error, 'Unable to update expense');
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
