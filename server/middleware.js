const config = require('./config');
const { userFromRequest } = require('./auth');

function rateLimit(req, res, next) {
  const key = `${req.ip}:${req.path}`;
  const current = req.app.locals.rateLimits.get(key) || { count: 0, start: Date.now() };
  if (Date.now() - current.start >= config.rateLimitWindowMs) { current.count = 0; current.start = Date.now(); }
  current.count += 1;
  req.app.locals.rateLimits.set(key, current);
  if (current.count > config.rateLimitMax) return res.status(429).json({ error: 'Too Many Requests' });
  next();
}

async function requireAuth(req, res, next) {
  const user = await userFromRequest(req);
  if (!user) return res.status(401).json({ error: 'Authentication required' });
  req.user = user;
  next();
}

function requireAdmin(req, res, next) {
  if (req.user?.role !== 'admin') return res.status(403).json({ error: 'Admin access required' });
  next();
}

function requirePasswordChanged(req, res, next) {
  if (req.user?.must_change_password) return res.status(403).json({ error: 'Password change required before accessing the ledger' });
  next();
}

module.exports = { rateLimit, requireAuth, requireAdmin, requirePasswordChanged };
