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
  databasePath: path.resolve(root, process.env.DATABASE_PATH || './data/hermes.sqlite'),
  sessionSecret: required('SESSION_SECRET'),
  adminSetupCode: required('ADMIN_SETUP_CODE'),
  sessionTtlDays: Number(process.env.SESSION_TTL_DAYS || 7),
  rateLimitWindowMs: Number(process.env.RATE_LIMIT_WINDOW_MS || 900000),
  rateLimitMax: Number(process.env.RATE_LIMIT_MAX || 20),
  smtp: {
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT || 587),
    secure: process.env.SMTP_SECURE === 'true',
    user: process.env.SMTP_USER,
    password: process.env.SMTP_PASSWORD,
    from: process.env.SMTP_FROM,
    adminEmail: process.env.ADMIN_EMAIL
  }
};

module.exports = config;
