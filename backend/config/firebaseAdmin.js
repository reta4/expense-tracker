require('dotenv').config();
const fs = require('fs');
const path = require('path');
const admin = require('firebase-admin');

const REQUIRED_SERVICE_ACCOUNT_FIELDS = ['project_id', 'private_key', 'client_email'];

const formatParseError = (source, error) => (
  `Failed to parse Firebase service account JSON from ${source}: ${error.message}. `
  + 'Ensure the value is valid JSON (for Render, paste the full service account as a single line).'
);

const assertServiceAccountShape = (serviceAccount, source) => {
  const missingFields = REQUIRED_SERVICE_ACCOUNT_FIELDS.filter(
    (field) => !serviceAccount?.[field],
  );

  if (missingFields.length > 0) {
    throw new Error(
      `Firebase service account loaded from ${source} is missing required field(s): `
      + `${missingFields.join(', ')}.`,
    );
  }

  return serviceAccount;
};

const loadServiceAccountFromEnv = () => {
  const rawJson = process.env.FIREBASE_SERVICE_ACCOUNT_JSON?.trim();

  if (!rawJson) {
    return null;
  }

  try {
    const parsed = JSON.parse(rawJson);
    return assertServiceAccountShape(parsed, 'FIREBASE_SERVICE_ACCOUNT_JSON');
  } catch (error) {
    if (error.message.startsWith('Firebase service account loaded from')) {
      throw error;
    }

    throw new Error(formatParseError('FIREBASE_SERVICE_ACCOUNT_JSON', error));
  }
};

const loadServiceAccountFromFile = () => {
  const keyPath = process.env.FIREBASE_SERVICE_ACCOUNT_PATH
    || path.join(__dirname, '..', 'serviceAccountKey.json');

  if (!fs.existsSync(keyPath)) {
    return null;
  }

  try {
    const fileContents = fs.readFileSync(keyPath, 'utf8');
    const parsed = JSON.parse(fileContents);
    return assertServiceAccountShape(parsed, keyPath);
  } catch (error) {
    if (error.message.startsWith('Firebase service account loaded from')) {
      throw error;
    }

    throw new Error(formatParseError(keyPath, error));
  }
};

const loadServiceAccount = () => {
  const fromEnv = loadServiceAccountFromEnv();
  if (fromEnv) {
    return { serviceAccount: fromEnv, source: 'FIREBASE_SERVICE_ACCOUNT_JSON' };
  }

  const fromFile = loadServiceAccountFromFile();
  if (fromFile) {
    return {
      serviceAccount: fromFile,
      source: process.env.FIREBASE_SERVICE_ACCOUNT_PATH || 'serviceAccountKey.json',
    };
  }

  throw new Error(
    'Firebase Admin is not configured. Set FIREBASE_SERVICE_ACCOUNT_JSON for cloud deployment '
    + 'or place serviceAccountKey.json in the backend directory for local development.',
  );
};

const initializeFirebaseAdmin = () => {
  if (admin.apps.length > 0) {
    return admin;
  }

  try {
    const { serviceAccount, source } = loadServiceAccount();

    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });

    console.log(`✓ Firebase Admin initialized (${source})`);
    return admin;
  } catch (error) {
    console.error('✗ Firebase Admin startup failed:', error.message);
    throw error;
  }
};

let firestoreProbeResult = null;

const probeFirestoreAdminAccess = async () => {
  if (firestoreProbeResult !== null) return firestoreProbeResult;

  try {
    const db = initializeFirebaseAdmin().firestore();
    await db.collection('_healthcheck').doc('probe').get();
    firestoreProbeResult = true;
  } catch (error) {
    const denied = error.code === 7 || /PERMISSION_DENIED/i.test(error.message);
    firestoreProbeResult = denied ? false : true;
  }

  return firestoreProbeResult;
};

module.exports = { initializeFirebaseAdmin, probeFirestoreAdminAccess };
