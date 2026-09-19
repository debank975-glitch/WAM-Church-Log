const express = require('express');
const path = require('node:path');
const cookieParser = require('cookie-parser');
const config = require('./config');
const authRoutes = require('./routes/auth');
const ledgerRoutes = require('./routes/ledger');

const app = express();
app.locals.rateLimits = new Map();
app.disable('x-powered-by');
app.use(express.json({ limit: '32kb' }));
app.use(cookieParser());
app.use('/api/auth', authRoutes);
app.use('/api/ledger', ledgerRoutes);
app.use(express.static(config.root));
app.get('*', (req, res, next) => req.path.startsWith('/api/') ? next() : res.sendFile(path.join(config.root, 'index.html')));
app.use((req, res) => res.status(404).json({ error: 'Not found' }));
module.exports = app;
