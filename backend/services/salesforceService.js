const axios = require('axios');
const { salesforce } = require('../config/env');

let cachedToken = null;
let tokenExpiry = 0;

const DEFAULT_CATEGORY_VALUES = [
  'Food',
  'Transport',
  'Entertainment',
  'Bills',
  'Vacation / Travel',
  'Family Expenses',
  'Work / Business',
  'Groceries',
  'Rent / Mortgage',
  'Utilities',
  'Health / Medical',
  'Gas / Fuel',
  'Public Transport',
  'Car Maintenance',
  'Dining Out',
  'Shopping',
  'Gym / Fitness',
  'Gifts / Donations',
  'Education / Courses',
  'Subscriptions',
  'Other',
];


const normalizeCategoryValue = (value) => {
  if (!value) return value;

  const legacyMap = {
    Housing: 'Rent / Mortgage',
    Transportation: 'Transport',
  };

  return legacyMap[value] || value;
};

const sanitizeExpensePayload = (expenseData = {}, { forCreate = false } = {}) => {
  const sanitizedPayload = { ...expenseData };

  delete sanitizedPayload.userContactId;
  delete sanitizedPayload.contactId;

  if (!forCreate) {
    delete sanitizedPayload.User_Contact__c;
  }

  if (sanitizedPayload.Category__c) {
    sanitizedPayload.Category__c = normalizeCategoryValue(sanitizedPayload.Category__c);
  }

  return sanitizedPayload;
};

const getValidToken = async () => {
  if (cachedToken && Date.now() < tokenExpiry) {
    return cachedToken;
  }

  const body = new URLSearchParams({
    grant_type: 'client_credentials',
    client_id: salesforce.clientId,
    client_secret: salesforce.clientSecret,
  });

  const response = await axios.post(salesforce.loginUrl, body.toString(), {
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      Accept: 'application/json',
    },
  });

  cachedToken = response.data.access_token;
  tokenExpiry = Date.now() + 50 * 60 * 1000;
  return cachedToken;
};

const buildAuthHeaders = async () => ({
  Authorization: `Bearer ${await getValidToken()}`,
});

const getExpenses = async (contactId) => {
  const headers = await buildAuthHeaders();
  const safeContactId = String(contactId).trim().replace(/'/g, "\\'");
  const soql = `SELECT Id, Name, Amount__c, Date__c, Type__c, Category__c, Is_Recurring__c FROM Expense__c WHERE User_Contact__c = '${safeContactId}'`;

  const response = await axios.get(
    `${salesforce.instanceUrl}/services/data/${salesforce.apiVersion}/query/?q=${encodeURIComponent(soql)}`,
    { headers }
  );

  return response.data.records;
};

const getExpenseById = async (id) => {
  const headers = await buildAuthHeaders();
  const safeId = String(id).trim().replace(/'/g, "\\'");
  const soql = `SELECT Id, User_Contact__c FROM Expense__c WHERE Id = '${safeId}' LIMIT 1`;

  const response = await axios.get(
    `${salesforce.instanceUrl}/services/data/${salesforce.apiVersion}/query/?q=${encodeURIComponent(soql)}`,
    { headers }
  );

  return response.data.records[0] || null;
};

const getContactIdByEmail = async (email) => {
  const headers = await buildAuthHeaders();
  const safeEmail = String(email).trim().toLowerCase().replace(/'/g, "\\'");
  const soql = `SELECT Id FROM Contact WHERE Email = '${safeEmail}' ORDER BY CreatedDate DESC LIMIT 1`;

  const response = await axios.get(
    `${salesforce.instanceUrl}/services/data/${salesforce.apiVersion}/query/?q=${encodeURIComponent(soql)}`,
    { headers }
  );

  return response.data.records[0]?.Id || null;
};

const getCategoryPicklistValues = async () => {
  const headers = await buildAuthHeaders();
  const response = await axios.get(
    `${salesforce.instanceUrl}/services/data/${salesforce.apiVersion}/sobjects/Expense__c/describe`,
    { headers }
  );

  const categoryField = response.data.fields.find((field) => field.name === 'Category__c');
  return categoryField?.picklistValues?.map((value) => value.value) || [];
};

const createContact = async ({ firstName, lastName, email }) => {
  const headers = await buildAuthHeaders();
  const response = await axios.post(
    `${salesforce.instanceUrl}/services/data/${salesforce.apiVersion}/sobjects/Contact`,
    {
      FirstName: firstName.trim(),
      LastName: lastName.trim(),
      Email: email.trim().toLowerCase(),
      LeadSource: 'Web App',
    },
    {
      headers: {
        ...headers,
        'Content-Type': 'application/json',
      },
    }
  );

  return response.data.id;
};

const createExpense = async (expenseData, contactId) => {
  const headers = await buildAuthHeaders();
  const normalizedPayload = sanitizeExpensePayload(
    { ...expenseData, User_Contact__c: contactId },
    { forCreate: true },
  );

  const response = await axios.post(
    `${salesforce.instanceUrl}/services/data/${salesforce.apiVersion}/sobjects/Expense__c`,
    normalizedPayload,
    {
      headers: {
        ...headers,
        'Content-Type': 'application/json',
      },
    }
  );

  return response.data;
};

const updateExpense = async (id, expenseData) => {
  const headers = await buildAuthHeaders();
  const normalizedPayload = sanitizeExpensePayload(expenseData, { forCreate: false });

  await axios.patch(
    `${salesforce.instanceUrl}/services/data/${salesforce.apiVersion}/sobjects/Expense__c/${id}`,
    normalizedPayload,
    {
      headers: {
        ...headers,
        'Content-Type': 'application/json',
      },
    }
  );
};

const deleteExpense = async (id) => {
  const headers = await buildAuthHeaders();
  await axios.delete(`${salesforce.instanceUrl}/services/data/${salesforce.apiVersion}/sobjects/Expense__c/${id}`, { headers });
};

module.exports = {
  DEFAULT_CATEGORY_VALUES,
  getValidToken,
  getExpenses,
  getExpenseById,
  getContactIdByEmail,
  getCategoryPicklistValues,
  createContact,
  createExpense,
  updateExpense,
  deleteExpense,
  sanitizeExpensePayload,
  normalizeCategoryValue,
};
