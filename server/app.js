const express = require('express');
const path = require('node:path');
const cookieParser = require('cookie-parser');
const config = require('./config');
const { userFromRequest } = require('./auth');
const authRoutes = require('./routes/auth');
const ledgerRoutes = require('./routes/ledger');
const gmailOauthRoutes = require('./routes/gmail-oauth');

const app = express();
app.set('trust proxy', 1);
app.locals.rateLimits = new Map();
app.disable('x-powered-by');
app.use(express.json({ limit: '32kb' }));
app.use(cookieParser());
app.use('/api/auth', authRoutes);
app.use('/api/ledger', ledgerRoutes);
app.use('/', gmailOauthRoutes);
app.get(['/', '/index.html', '/admin.html', '/user.html'], async (req, res, next) => {
  try {
    const user = await userFromRequest(req);
    if (!user) return res.redirect('/auth.html');
    if (user.must_change_password) return res.redirect('/auth.html?change-password=1');
    const page = user.role === 'admin' ? 'admin.html' : 'user.html';
    return res.sendFile(path.join(config.publicRoot, page));
  } catch (error) {
    return next(error);
  }
});
app.use(express.static(config.publicRoot));
app.get('*', (req, res, next) => req.path.startsWith('/api/') ? next() : res.sendFile(path.join(config.publicRoot, 'auth.html')));
app.use((req, res) => res.status(404).json({ error: 'Not found' }));
module.exports = app;
