const express = require('express');
const config = require('../config');
const { db, passwordHash, verifyPassword, createSession, audit, clearSession } = require('../auth');
const { rateLimit, requireAuth, requireAdmin } = require('../middleware');

const router = express.Router();
const authLimiter = rateLimit;
const cookieOptions = { httpOnly: true, sameSite: 'lax', secure: false, maxAge: config.sessionTtlDays * 86400000, path: '/' };
const passwordChangeFlag = (required) => config.databaseProvider === 'postgres' ? required : (required ? 1 : 0);
const credentials = (body) => ({ username: String(body.username || '').trim(), password: String(body.password || '') });
const invalidLogin = (res) => res.status(401).json({ error: 'Wrong Username or Password' });
const publicUser = (user) => {
  let permissions = [];
  if (user.permissions) {
    try {
      permissions = typeof user.permissions === 'string' ? JSON.parse(user.permissions) : user.permissions;
    } catch {
      permissions = [];
    }
  } else if (user.role === 'admin') {
    permissions = ['home', 'quota', 'tithe', 'savings', 'goals', 'charts', 'editUsers'];
  } else {
    permissions = ['home', 'tithe', 'savings'];
  }
  return {
    id: user.id,
    username: user.username,
    role: user.role,
    roleTitle: user.role_title || (user.role === 'admin' ? 'Lead Administrator' : 'Delegated'),
    email: user.email,
    displayName: user.display_name || user.username,
    mustChangePassword: Boolean(user.must_change_password),
    permissions
  };
};
const registrationValues = (body) => ({
  email: body.email ? String(body.email).trim() : null,
  displayName: body.displayName ? String(body.displayName).trim() : null,
  roleTitle: body.roleTitle ? String(body.roleTitle).trim() : null,
  permissions: body.permissions ? (Array.isArray(body.permissions) ? JSON.stringify(body.permissions) : String(body.permissions)) : null
});
const sqlReturningId = () => (config.databaseProvider === 'postgres' ? ' RETURNING id' : '');

async function setupAdmin(req, res) {
  const { username, password } = credentials(req.body);
  const setupCode = String(req.body.setupCode || '').trim();
  if (!username || password.length < 12 || setupCode !== config.adminSetupCode.trim()) return res.status(400).json({ error: 'Invalid admin registration' });
  const existingAdmin = await db.prepare("SELECT 1 FROM users WHERE role='admin'").get();
  if (existingAdmin) return res.status(409).json({ error: 'Admin account already exists' });
  const values = registrationValues(req.body);
  const info = await db.prepare(`INSERT INTO users (username,password_hash,role,email,display_name,role_title,must_change_password) VALUES (?,?,?,?,?,?,?)${sqlReturningId()}`).run(username, passwordHash(password), 'admin', values.email, values.displayName, 'Lead Administrator', passwordChangeFlag(false));
  const user = await db.prepare('SELECT * FROM users WHERE id=?').get(info.lastInsertRowid || info.id || info.rows?.[0]?.id);
  await audit('admin_registered', req, user);
  const token = await createSession(user);
  res.cookie('hermes_session', token, cookieOptions);
  res.status(201).json({ user: publicUser(user), token });
}
router.post(['/admin/register', '/admin/setup'], authLimiter, setupAdmin);

router.post('/admin/login', authLimiter, async (req, res) => {
  const { username, password } = credentials(req.body);
  const user = await db.prepare("SELECT * FROM users WHERE LOWER(username)=LOWER(?) AND role='admin'").get(username);
  if (!user || !verifyPassword(password, user.password_hash)) { await audit('admin_login_failed', req, user, { username }); return invalidLogin(res); }
  const token = await createSession(user);
  res.cookie('hermes_session', token, cookieOptions);
  await audit('admin_login_succeeded', req, user);
  res.json({ user: publicUser(user), token });
});

async function loginUser(req, res) {
  const { username, password } = credentials(req.body);
  const user = await db.prepare("SELECT * FROM users WHERE LOWER(username)=LOWER(?) AND role='user'").get(username);
  if (!user || !verifyPassword(password, user.password_hash)) { await audit('user_login_failed', req, user, { username }); return invalidLogin(res); }
  const token = await createSession(user);
  res.cookie('hermes_session', token, cookieOptions);
  await audit('user_login_succeeded', req, user);
  res.json({ user: publicUser(user), token });
}
router.post(['/users/login', '/user/login'], authLimiter, loginUser);

// Admin-created Delegated User Accounts CRUD
router.get(['/admin/users', '/users'], requireAuth, requireAdmin, async (req, res) => {
  try {
    const rows = await db.prepare('SELECT id, username, role, role_title, permissions, email, display_name, must_change_password, created_at FROM users ORDER BY id ASC').all();
    res.json({ users: rows.map(publicUser) });
  } catch (error) {
    console.error('List users failed:', error);
    res.status(500).json({ error: 'Failed to retrieve user accounts' });
  }
});

router.post(['/admin/users', '/users'], requireAuth, requireAdmin, async (req, res) => {
  const username = String(req.body.username || req.body.email || '').trim();
  const password = String(req.body.password || req.body.pin || '');
  const roleTitle = String(req.body.roleTitle || req.body.role || 'Finance Secretary').trim();
  const displayName = String(req.body.displayName || req.body.name || username).trim();
  const email = req.body.email ? String(req.body.email).trim() : null;
  const permissions = Array.isArray(req.body.permissions) ? req.body.permissions : ['Log Income & Tithes'];

  if (!username) return res.status(400).json({ error: 'Username or email is required' });
  if (password.length < 8) return res.status(400).json({ error: 'Temporary password must be at least 8 characters' });

  const existing = await db.prepare('SELECT 1 FROM users WHERE LOWER(username)=LOWER(?)').get(username);
  if (existing) return res.status(409).json({ error: `Account with username/email "${username}" already exists` });

  try {
    const info = await db.prepare(`
      INSERT INTO users (username, password_hash, role, role_title, permissions, email, display_name, must_change_password)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)${sqlReturningId()}
    `).run(
      username,
      passwordHash(password),
      'user',
      roleTitle,
      JSON.stringify(permissions),
      email,
      displayName,
      passwordChangeFlag(true)
    );
    const user = await db.prepare('SELECT * FROM users WHERE id=?').get(info.lastInsertRowid || info.id || info.rows?.[0]?.id);
    await audit('delegated_user_created', req, req.user, { createdUserId: user.id, username, roleTitle });
    res.status(201).json({ user: publicUser(user) });
  } catch (error) {
    console.error('Create delegated user failed:', error);
    res.status(500).json({ error: error.message || 'Failed to create delegated user account' });
  }
});

router.delete(['/admin/users/:id', '/users/:id'], requireAuth, requireAdmin, async (req, res) => {
  const targetId = Number(req.params.id);
  if (!targetId) return res.status(400).json({ error: 'Invalid user ID' });
  if (targetId === req.user.id) return res.status(400).json({ error: 'Cannot delete the active administrator account' });

  const targetUser = await db.prepare('SELECT * FROM users WHERE id=?').get(targetId);
  if (!targetUser) return res.status(404).json({ error: 'User not found' });
  if (targetUser.role === 'admin') return res.status(403).json({ error: 'Cannot delete an administrator account' });

  try {
    await db.transaction((tx) => {
      const connection = tx || db;
      connection.prepare('UPDATE audit_log SET user_id=NULL WHERE user_id=?').run(targetId);
      connection.prepare('DELETE FROM invite_codes WHERE created_by=?').run(targetId);
      connection.prepare('DELETE FROM users WHERE id=?').run(targetId);
    })();
    await audit('delegated_user_deleted', req, req.user, { deletedUserId: targetId, username: targetUser.username });
    res.json({ success: true, deletedId: targetId });
  } catch (error) {
    console.error('Delete user failed:', error);
    res.status(500).json({ error: 'Failed to delete user account' });
  }
});

router.post('/change-password', requireAuth, async (req, res) => {
  const password = String(req.body.password || '');
  if (password.length < 12) return res.status(400).json({ error: 'New password must be at least 12 characters' });
  if (!req.user.must_change_password) return res.status(400).json({ error: 'A password change is not required for this account' });
  const storedUser = await db.prepare('SELECT password_hash FROM users WHERE id=?').get(req.user.id);
  if (storedUser && verifyPassword(password, storedUser.password_hash)) {
    return res.status(400).json({ error: 'New password must be different from the temporary password' });
  }
  await db.prepare('UPDATE users SET password_hash=?, must_change_password=? WHERE id=?').run(passwordHash(password), passwordChangeFlag(false), req.user.id);
  await audit('password_changed', req, req.user);
  const user = await db.prepare('SELECT * FROM users WHERE id=?').get(req.user.id);
  res.json({ user: publicUser(user) });
});

router.get('/me', requireAuth, async (req, res) => res.json({ user: publicUser(req.user) }));
router.post('/logout', async (req, res) => { await clearSession(req); res.clearCookie('hermes_session', cookieOptions); res.json({ user: null }); });
module.exports = router;
