const path = require('node:path');
require('dotenv').config();

const root = path.resolve(__dirname, '..');
const required = (name) => {
  if (!process.env[name]) throw new Error(`${name} is required`);
  return process.env[name];
};

const config = {
  root,
  port: Number(process.env.PORT || 3000),
  nodeEnv: process.env.NODE_ENV || 'development',
  databaseProvider: String(process.env.DATABASE_PROVIDER || 'sqlite').toLowerCase(),
  databasePath: path.resolve(root, process.env.DATABASE_PATH || './data/hermes.sqlite'),
  databaseUrl: process.env.DATABASE_URL || null,
  pgSslMode: process.env.PGSSLMODE || 'disable',
  sessionSecret: required('SESSION_SECRET'),
  adminSetupCode: required('ADMIN_SETUP_CODE'),
  sessionTtlDays: Number(process.env.SESSION_TTL_DAYS || 7),
  rateLimitWindowMs: Number(process.env.RATE_LIMIT_WINDOW_MS || 900000),
  rateLimitMax: Number(process.env.RATE_LIMIT_MAX || 20),
  gmail: {
    clientId: process.env.GMAIL_CLIENT_ID,
    clientSecret: process.env.GMAIL_CLIENT_SECRET,
    refreshToken: process.env.GMAIL_REFRESH_TOKEN,
    sender: process.env.GMAIL_SENDER || process.env.ADMIN_EMAIL,
    redirectUri: process.env.GMAIL_REDIRECT_URI || '',
    oauthSetupKey: process.env.GMAIL_OAUTH_SETUP_KEY || ''
  }
};

module.exports = config;
