const { initializeFirebaseAdmin } = require('../config/firebaseAdmin');
const { getContactIdByEmail } = require('../services/salesforceService');

const contactCache = new Map();
let firestoreFallbackWarned = false;

const warnFirestoreFallbackOnce = () => {
  if (firestoreFallbackWarned) return;
  firestoreFallbackWarned = true;
  console.warn(
    'Firestore Admin read unavailable; using Salesforce email lookup. '
    + 'Grant the service account "Cloud Datastore User" in Google Cloud IAM (see README).',
  );
};

const readContactFromFirestore = async (uid) => {
  const admin = initializeFirebaseAdmin();
  const snapshot = await admin.firestore().doc(`users/${uid}`).get();

  if (!snapshot.exists) return null;

  const profile = snapshot.data();
  const contactId = profile.salesforceContactId || profile.User_Contact__c || profile.contactId;
  return contactId?.toString().trim() || null;
};

const resolveUserContact = async (req, res, next) => {
  try {
    const claimContactId = req.user.salesforceContactId;
    if (claimContactId) {
      req.contactId = String(claimContactId).trim();
      return next();
    }

    const cacheKey = req.user.uid;
    if (cacheKey && contactCache.has(cacheKey)) {
      req.contactId = contactCache.get(cacheKey);
      return next();
    }

    let contactId = null;

    try {
      contactId = await readContactFromFirestore(req.user.uid);
    } catch (firestoreError) {
      const denied = firestoreError.code === 7 || /PERMISSION_DENIED/i.test(firestoreError.message);
      if (!denied) throw firestoreError;
      warnFirestoreFallbackOnce();
    }

    if (!contactId) {
      const email = req.user.email?.trim().toLowerCase();
      if (!email) {
        return res.status(403).json({ error: 'Authenticated user email is required' });
      }
      contactId = await getContactIdByEmail(email);
    }

    if (!contactId) {
      return res.status(403).json({ error: 'Salesforce contact not linked to this account' });
    }

    if (cacheKey) {
      contactCache.set(cacheKey, contactId);
    }

    req.contactId = contactId;
    return next();
  } catch (error) {
    const status = error.response?.status;
    const detail = status ? ` (HTTP ${status})` : '';
    console.error(`Failed to resolve Salesforce contact:${detail} ${error.message}`);
    return res.status(500).json({ error: 'Unable to resolve user identity' });
  }
};

module.exports = { resolveUserContact };
