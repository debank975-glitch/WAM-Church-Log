const crypto = require('node:crypto');
const db = require('./db');
const config = require('./config');

const hash = (value) => crypto.createHash('sha256').update(value).digest('hex');
const safeEqual = (left, right) => {
  const a = Buffer.from(left);
  const b = Buffer.from(right);
  return a.length === b.length && crypto.timingSafeEqual(a, b);
};
const passwordHash = (password) => {
  const salt = crypto.randomBytes(16).toString('hex');
  const derived = crypto.scryptSync(password, salt, 64).toString('hex');
  return `scrypt$${salt}$${derived}`;
};
const verifyPassword = (password, stored) => {
  const [, salt, expected] = String(stored).split('$');
  if (!salt || !expected) return false;
  const actual = crypto.scryptSync(password, salt, 64).toString('hex');
  return safeEqual(actual, expected);
};
const randomCode = () => crypto.randomBytes(18).toString('base64url');
const signedToken = (raw) => `${raw}.${crypto.createHmac('sha256', config.sessionSecret).update(raw).digest('base64url')}`;
const verifySignedToken = (value) => {
  const [raw, signature] = String(value || '').split('.');
  if (!raw || !signature) return null;
  const expected = crypto.createHmac('sha256', config.sessionSecret).update(raw).digest('base64url');
  return safeEqual(signature, expected) ? raw : null;
};
const now = () => new Date();
const expires = (days) => new Date(Date.now() + days * 86400000).toISOString();

async function audit(event, req, user, metadata = {}) {
  await db.prepare('INSERT INTO audit_log (event,user_id,username,ip,metadata) VALUES (?,?,?,?,?)').run(
    event,
    user?.id || null,
    user?.username || null,
    req.ip,
    JSON.stringify(metadata)
  );
}

async function createSession(user) {
  const raw = crypto.randomBytes(32).toString('base64url');
  await db.prepare('INSERT INTO sessions (token_hash,user_id,expires_at) VALUES (?,?,?)').run(
    hash(raw),
    user.id,
    expires(config.sessionTtlDays)
  );
  return signedToken(raw);
}

async function userFromRequest(req) {
  const raw = verifySignedToken(req.cookies?.hermes_session);
  if (!raw) return null;
  const row = await db.prepare(`
    SELECT u.id,u.username,u.role,u.email,u.display_name,s.expires_at
    FROM sessions s JOIN users u ON u.id=s.user_id
    WHERE s.token_hash=? AND s.expires_at > ?
  `).get(hash(raw), now().toISOString());
  if (row) {
    await db.prepare('UPDATE sessions SET last_seen_at=? WHERE token_hash=?').run(now().toISOString(), hash(raw));
  }
  return row || null;
}

async function clearSession(req) {
  const raw = verifySignedToken(req.cookies?.hermes_session);
  if (raw) {
    await db.prepare('DELETE FROM sessions WHERE token_hash=?').run(hash(raw));
  }
}

module.exports = { db, hash, passwordHash, verifyPassword, randomCode, createSession, userFromRequest, clearSession, audit, expires };
