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
const sqlReturningId = () => (config.databaseProvider === 'postgres' ? ' RETURNING id' : '');

async function setupAdmin(req, res) {
  const { username, password } = credentials(req.body);
  const setupCode = String(req.body.setupCode || '').trim();
  if (!username || password.length < 12 || setupCode !== config.adminSetupCode.trim()) return res.status(400).json({ error: 'Invalid admin registration' });
  const existingAdmin = await db.prepare("SELECT 1 FROM users WHERE role='admin'").get();
  if (existingAdmin) return res.status(409).json({ error: 'Admin account already exists' });
  const values = registrationValues(req.body);
  const info = await db.prepare(`INSERT INTO users (username,password_hash,role,email,display_name) VALUES (?,?,?,?,?)${sqlReturningId()}`).run(username, passwordHash(password), 'admin', values.email, values.displayName);
  const user = await db.prepare('SELECT * FROM users WHERE id=?').get(info.lastInsertRowid || info.id || info.rows?.[0]?.id);
  await audit('admin_registered', req, user);
  res.cookie('hermes_session', await createSession(user), cookieOptions);
  res.status(201).json({ user: publicUser(user) });
}
router.post(['/admin/register', '/admin/setup'], authLimiter, setupAdmin);

router.post('/admin/login', authLimiter, async (req, res) => {
  const { username, password } = credentials(req.body);
  const user = await db.prepare("SELECT * FROM users WHERE username=? AND role='admin'").get(username);
  if (!user || !verifyPassword(password, user.password_hash)) { await audit('admin_login_failed', req, user, { username }); return invalidLogin(res); }
  res.cookie('hermes_session', await createSession(user), cookieOptions);
  await audit('admin_login_succeeded', req, user);
  res.json({ user: publicUser(user) });
});

async function registerUser(req, res) {
  const { username, password } = credentials(req.body);
  const code = String(req.body.inviteCode || '');
  const invite = await db.prepare('SELECT * FROM invite_codes WHERE code_hash=? AND used_at IS NULL AND expires_at > ?').get(hash(code), new Date().toISOString());
  if (!invite || !username || password.length < 12) return res.status(400).json({ error: 'Invalid registration or invite code' });
  try {
    const info = await db.transaction((tx) => {
      const connection = tx || db;
      const values = registrationValues(req.body);
      const created = connection.prepare(`INSERT INTO users (username,password_hash,role,email,display_name) VALUES (?,?,?,?,?)${sqlReturningId()}`).run(username, passwordHash(password), 'user', values.email, values.displayName);
      connection.prepare('UPDATE invite_codes SET used_at=? WHERE id=? AND used_at IS NULL').run(new Date().toISOString(), invite.id);
      return created;
    })();
    const user = await db.prepare('SELECT * FROM users WHERE id=?').get(info.lastInsertRowid || info.id || info.rows?.[0]?.id);
    await audit('user_registered', req, user);
    res.status(201).json({ user: publicUser(user) });
  } catch (error) {
    console.error('Register user failed:', error);
    res.status(409).json({ error: 'Username is already in use' });
  }
}
router.post(['/users/register', '/user/register'], authLimiter, registerUser);

async function loginUser(req, res) {
  const { username, password } = credentials(req.body);
  const user = await db.prepare("SELECT * FROM users WHERE username=? AND role='user'").get(username);
  if (!user || !verifyPassword(password, user.password_hash)) { await audit('user_login_failed', req, user, { username }); return invalidLogin(res); }
  res.cookie('hermes_session', await createSession(user), cookieOptions);
  await audit('user_login_succeeded', req, user);
  res.json({ user: publicUser(user) });
}
router.post(['/users/login', '/user/login'], authLimiter, loginUser);

async function createInvite(req, res) {
  const code = randomCode();
  const expiresAt = expires(Number(req.body.expiresInDays) || 7);
  await db.prepare('INSERT INTO invite_codes (code_hash,created_by,expires_at) VALUES (?,?,?)').run(hash(code), req.user.id, expiresAt);
  await audit('invite_created', req, req.user);
  const invitedEmail = req.body.email ? String(req.body.email).trim() : null;
  const adminEmail = config.gmail.sender || req.user.email;
  try {
    const emailed = await sendInvite(code, adminEmail, invitedEmail, expiresAt);
    const invite = { deliveredByEmail: emailed, email: adminEmail, invitedEmail, expiresAt };
    if (!configured && config.nodeEnv === 'development') invite.code = code;
    res.status(201).json({ invite });
  } catch (error) {
    console.error('Invite email delivery failed:', {
      code: error.code,
      command: error.command,
      responseCode: error.responseCode,
      message: error.message
    });
    res.status(503).json({ error: 'Invite created but email delivery failed' });
  }
}
router.post(['/admin/invites', '/invites'], requireAuth, requireAdmin, createInvite);

router.post('/admin/test-email', requireAuth, requireAdmin, async (req, res) => {
  const recipient = config.gmail.sender || req.user.email;
  if (!recipient) return res.status(400).json({ error: 'No administrator email is configured' });
  try {
    const sent = await sendInvite('GMAIL-API-TEST-DO-NOT-USE', recipient, 'Gmail API delivery test', new Date().toISOString());
    if (!sent) return res.status(503).json({ error: 'Gmail API is not fully configured' });
    res.json({ sent: true, email: recipient });
  } catch (error) {
    console.error('Gmail API test delivery failed:', {
      code: error.code,
      command: error.command,
      responseCode: error.responseCode,
      message: error.message
    });
    res.status(503).json({ error: 'Gmail API test delivery failed' });
  }
});

router.get('/me', requireAuth, async (req, res) => res.json({ user: publicUser(req.user) }));
router.post('/logout', async (req, res) => { await clearSession(req); res.clearCookie('hermes_session', cookieOptions); res.json({ user: null }); });
module.exports = router;
