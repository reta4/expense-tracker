const { initializeFirebaseAdmin, probeFirestoreAdminAccess } = require('./config/firebaseAdmin');
const app = require('./app');
const { port, validateEnv } = require('./config/env');

validateEnv();

try {
  initializeFirebaseAdmin();
} catch (error) {
  console.error('Server startup aborted due to Firebase Admin configuration error.');
  process.exit(1);
}

app.listen(port, () => {
  console.log(`🚀 Secure Proxy server running on port ${port}`);

  probeFirestoreAdminAccess()
    .then((ok) => {
      if (ok) {
        console.log('✓ Firestore Admin access OK');
      } else {
        console.warn('⚠ Firestore Admin unavailable — Salesforce email fallback is active');
      }
    })
    .catch((error) => {
      console.warn('⚠ Firestore Admin check failed:', error.message);
    });
});
