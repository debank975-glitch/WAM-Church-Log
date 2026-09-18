const express = require('express');
const config = require('../config');
const { db, hash, passwordHash, verifyPassword, randomCode, createSession, audit, expires, clearSession } = require('../auth');
const { rateLimit, requireAuth, requireAdmin } = require('../middleware');
const { configured, sendInvite } = require('../mailer');

const router = express.Router();
const authLimiter = rateLimit;
const cookieOptions = { httpOnly: true, sameSite: 'lax', secure: config.nodeEnv === 'production', maxAge: config.sessionTtlDays * 86400000, path: '/' };
const credentials = (body) => ({ username: String(body.username || '').trim(), password: String(body.password || '') });
const invalidLogin = (res) => res.status(401).json({ error: 'Wrong Username or Password' });
const publicUser = (user) => ({
  id: user.id, username: user.username, role: user.role, email: user.email,
  displayName: user.display_name || null
});
const registrationValues = (body) => ({
  email: body.email ? String(body.email).trim() : null,
  displayName: body.displayName ? String(body.displayName).trim() : null
});

function setupAdmin(req, res) {
  const { username, password } = credentials(req.body);
  if (!username || password.length < 12 || req.body.setupCode !== config.adminSetupCode) return res.status(400).json({ error: 'Invalid admin registration' });
  if (db.prepare("SELECT 1 FROM users WHERE role='admin'").get()) return res.status(409).json({ error: 'Admin account already exists' });
  const values = registrationValues(req.body);
  const info = db.prepare('INSERT INTO users (username,password_hash,role,email,display_name) VALUES (?,?,?,?,?)').run(username, passwordHash(password), 'admin', values.email, values.displayName);
  const user = db.prepare('SELECT * FROM users WHERE id=?').get(info.lastInsertRowid);
  audit('admin_registered', req, user);
  res.cookie('hermes_session', createSession(user), cookieOptions);
  res.status(201).json({ user: publicUser(db.prepare('SELECT * FROM users WHERE id=?').get(info.lastInsertRowid)) });
}
router.post(['/admin/register', '/admin/setup'], authLimiter, setupAdmin);

router.post('/admin/login', authLimiter, (req, res) => {
  const { username, password } = credentials(req.body);
  const user = db.prepare("SELECT * FROM users WHERE username=? AND role='admin'").get(username);
  if (!user || !verifyPassword(password, user.password_hash)) { audit('admin_login_failed', req, user, { username }); return invalidLogin(res); }
  res.cookie('hermes_session', createSession(user), cookieOptions);
  audit('admin_login_succeeded', req, user);
  res.json({ user: publicUser(user) });
});

function registerUser(req, res) {
  const { username, password } = credentials(req.body);
  const code = String(req.body.inviteCode || '');
  const invite = db.prepare('SELECT * FROM invite_codes WHERE code_hash=? AND used_at IS NULL AND expires_at > ?').get(hash(code), new Date().toISOString());
  if (!invite || !username || password.length < 12) return res.status(400).json({ error: 'Invalid registration or invite code' });
  try {
    const info = db.transaction(() => {
      const values = registrationValues(req.body);
      const created = db.prepare('INSERT INTO users (username,password_hash,role,email,display_name) VALUES (?,?,?,?,?)').run(username, passwordHash(password), 'user', values.email, values.displayName);
      db.prepare('UPDATE invite_codes SET used_at=? WHERE id=? AND used_at IS NULL').run(new Date().toISOString(), invite.id);
      return created;
    })();
    const user = db.prepare('SELECT * FROM users WHERE id=?').get(info.lastInsertRowid);
    audit('user_registered', req, user);
    res.status(201).json({ user: publicUser(user) });
  } catch { res.status(409).json({ error: 'Username is already in use' }); }
}
router.post(['/users/register', '/user/register'], authLimiter, registerUser);

function loginUser(req, res) {
  const { username, password } = credentials(req.body);
  const user = db.prepare("SELECT * FROM users WHERE username=? AND role='user'").get(username);
  if (!user || !verifyPassword(password, user.password_hash)) { audit('user_login_failed', req, user, { username }); return invalidLogin(res); }
  res.cookie('hermes_session', createSession(user), cookieOptions);
  audit('user_login_succeeded', req, user);
  res.json({ user: publicUser(user) });
}
router.post(['/users/login', '/user/login'], authLimiter, loginUser);

function createInvite(req, res) {
  const code = randomCode();
  db.prepare('INSERT INTO invite_codes (code_hash,created_by,expires_at) VALUES (?,?,?)').run(hash(code), req.user.id, expires(Number(req.body.expiresInDays) || 7));
  audit('invite_created', req, req.user);
  const email = req.body.email ? String(req.body.email).trim() : config.smtp.adminEmail;
  sendInvite(code, email).then((emailed) => {
    const invite = { deliveredByEmail: emailed, email, expiresAt: db.prepare('SELECT expires_at FROM invite_codes WHERE code_hash=?').get(hash(code)).expires_at };
    if (!configured && config.nodeEnv === 'development') invite.code = code;
    res.status(201).json({ invite });
  }).catch(() => res.status(503).json({ error: 'Invite created but email delivery failed' }));
}
router.post(['/admin/invites', '/invites'], requireAuth, requireAdmin, createInvite);

router.get('/me', requireAuth, (req, res) => res.json({ user: publicUser(req.user) }));
router.post('/logout', (req, res) => { clearSession(req); res.clearCookie('hermes_session', cookieOptions); res.json({ user: null }); });
module.exports = router;
