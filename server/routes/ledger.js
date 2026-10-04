const express = require('express');
const { db } = require('../auth');
const { requireAuth, requirePasswordChanged } = require('../middleware');

const router = express.Router();
const MAX_STATE_BYTES = 2 * 1024 * 1024;

router.get('/state', requireAuth, requirePasswordChanged, async (req, res) => {
  const record = await db.prepare('SELECT state_json, updated_at FROM shared_ledger_state WHERE id=1').get();
  if (!record) return res.json({ state: null });
  try {
    return res.json({ state: JSON.parse(record.state_json), updatedAt: record.updated_at });
  } catch {
    return res.status(500).json({ error: 'Stored ledger state is invalid' });
  }
});

router.put('/state', requireAuth, requirePasswordChanged, async (req, res) => {
  const stateJson = JSON.stringify(req.body?.state);
  if (!req.body?.state || stateJson.length > MAX_STATE_BYTES) {
    return res.status(400).json({ error: 'Ledger state is missing or too large' });
  }
  const updatedAt = new Date().toISOString();
  await db.prepare(`
    INSERT INTO shared_ledger_state (id,state_json,updated_at) VALUES (1,?,?)
    ON CONFLICT(id) DO UPDATE SET state_json=excluded.state_json, updated_at=excluded.updated_at
  `).run(stateJson, updatedAt);
  res.json({ saved: true, updatedAt });
});

module.exports = router;
