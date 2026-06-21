require('dotenv').config();
const fs = require('fs');
const path = require('path');
const admin = require('firebase-admin');

const loadServiceAccount = () => {
  if (process.env.FIREBASE_SERVICE_ACCOUNT_JSON) {
    return JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_JSON);
  }

  const keyPath = process.env.FIREBASE_SERVICE_ACCOUNT_PATH
    || path.join(__dirname, '..', 'serviceAccountKey.json');

  if (fs.existsSync(keyPath)) {
    return JSON.parse(fs.readFileSync(keyPath, 'utf8'));
  }

  throw new Error(
    'Firebase Admin is not configured. Set FIREBASE_SERVICE_ACCOUNT_JSON or place serviceAccountKey.json locally.'
  );
};

const initializeFirebaseAdmin = () => {
  if (admin.apps.length > 0) {
    return admin;
  }

  const serviceAccount = loadServiceAccount();
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });

  return admin;
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
