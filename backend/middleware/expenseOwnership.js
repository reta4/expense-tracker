const { getExpenseById } = require('../services/salesforceService');

const assertExpenseOwnership = async (req, res, next) => {
  try {
    const expense = await getExpenseById(req.params.id);

    if (!expense) {
      return res.status(404).json({ error: 'Expense not found' });
    }

    if (expense.User_Contact__c !== req.contactId) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    return next();
  } catch (error) {
    console.error('Expense ownership check failed:', error.message);
    return res.status(500).json({ error: 'Unable to verify expense ownership' });
  }
};

module.exports = { assertExpenseOwnership };
