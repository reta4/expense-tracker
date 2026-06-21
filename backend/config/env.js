require('dotenv').config();

const config = {
  port: process.env.PORT || 3001,
  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:5173',
  salesforce: {
    clientId: process.env.SF_CLIENT_ID,
    clientSecret: process.env.SF_CLIENT_SECRET,
    loginUrl: process.env.SF_LOGIN_URL,
    instanceUrl: process.env.SF_INSTANCE_URL,
    apiVersion: process.env.SF_API_VERSION || 'v60.0',
  },
};

const REQUIRED_SALESFORCE_VARS = [
  'SF_CLIENT_ID',
  'SF_CLIENT_SECRET',
  'SF_LOGIN_URL',
  'SF_INSTANCE_URL',
];

const validateEnv = () => {
  const missing = REQUIRED_SALESFORCE_VARS.filter((key) => !process.env[key]);
  if (missing.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missing.join(', ')}. Copy backend/.env.example to backend/.env and fill in the values.`
    );
  }
};

module.exports = { ...config, validateEnv };
