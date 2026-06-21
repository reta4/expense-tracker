const assert = require('assert');

const { sanitizeExpensePayload } = require('../services/salesforceService');

(async () => {
  const createSanitized = sanitizeExpensePayload(
    {
      Name: 'Lunch',
      Amount__c: 25,
      Category__c: 'Food',
      User_Contact__c: '003123',
    },
    { forCreate: true }
  );

  assert.strictEqual(createSanitized.User_Contact__c, '003123');
  assert.strictEqual(createSanitized.Name, 'Lunch');
  assert.strictEqual(createSanitized.Category__c, 'Food');

  const updateSanitized = sanitizeExpensePayload(
    {
      Name: 'Dinner',
      Amount__c: 40,
      Category__c: 'Food',
      User_Contact__c: '003123',
    },
    { forCreate: false }
  );

  assert.strictEqual(updateSanitized.User_Contact__c, undefined);

  const serverCreate = sanitizeExpensePayload(
    { Name: 'Rent', Amount__c: 1000, Category__c: 'Housing' },
    { forCreate: true },
  );
  const boundCreate = sanitizeExpensePayload(
    { Name: 'Rent', Amount__c: 1000, Category__c: 'Housing', User_Contact__c: '003ABC' },
    { forCreate: true },
  );
  assert.strictEqual(serverCreate.Category__c, 'Rent / Mortgage');
  assert.strictEqual(boundCreate.User_Contact__c, '003ABC');

  console.log('✓ salesforceService payload sanitization passed');
})();
