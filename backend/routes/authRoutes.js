const express = require('express');
const rateLimit = require('express-rate-limit');
const { validateFirebaseToken } = require('../middleware/auth');
const { initializeFirebaseAdmin } = require('../config/firebaseAdmin');
const { createContact, getContactIdByEmail } = require('../services/salesforceService');

const router = express.Router();

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 15,
  message: { error: 'Too many attempts. Please try again later.' },
});

const linkContactToUser = async (uid, contactId) => {
  const admin = initializeFirebaseAdmin();
  await admin.auth().setCustomUserClaims(uid, { salesforceContactId: contactId });
};

router.post('/create-contact', authLimiter, validateFirebaseToken, async (req, res) => {
  const { firstName, lastName } = req.body;
  const email = req.user.email?.trim().toLowerCase();

  if (!firstName?.trim() || !lastName?.trim() || !email) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
    const existingContactId = await getContactIdByEmail(email);
    if (existingContactId) {
      await linkContactToUser(req.user.uid, existingContactId);
      return res.status(200).json({ success: true, contactId: existingContactId });
    }

    const contactId = await createContact({
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      email,
    });

    await linkContactToUser(req.user.uid, contactId);
    return res.status(201).json({ success: true, contactId });
  } catch (error) {
    console.error('Error creating Salesforce contact:', error.response?.data || error.message);
    return res.status(500).json({ error: 'Failed to create Salesforce contact' });
  }
});

module.exports = router;
