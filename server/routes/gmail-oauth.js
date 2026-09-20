const crypto = require('node:crypto');
const express = require('express');
const { google } = require('googleapis');
const config = require('../config');

const router = express.Router();
const pendingStates = new Map();
const scope = 'https://www.googleapis.com/auth/gmail.send';

function missingConfiguration() {
  return [
    ['GMAIL_CLIENT_ID', config.gmail.clientId],
    ['GMAIL_CLIENT_SECRET', config.gmail.clientSecret],
    ['GMAIL_REDIRECT_URI', config.gmail.redirectUri],
    ['GMAIL_OAUTH_SETUP_KEY', config.gmail.oauthSetupKey]
  ].filter(([, value]) => !String(value || '').trim()).map(([name]) => name);
}

function client() {
  return new google.auth.OAuth2(
    config.gmail.clientId,
    config.gmail.clientSecret,
    config.gmail.redirectUri
  );
}

function page(title, body) {
  return `<!doctype html><html lang="en"><head><meta charset="utf-8"><title>${title}</title>
    <style>body{font-family:system-ui,sans-serif;max-width:760px;margin:40px auto;padding:0 20px}
    code{word-break:break-all;background:#f1f1f1;padding:4px;border-radius:4px}</style></head>
    <body><h1>${title}</h1>${body}</body></html>`;
}

router.get('/oauth2authorize', (req, res) => {
  const missing = missingConfiguration();
  if (missing.length) {
    return res.status(503).send(page(
      'OAuth is not configured',
      `<p>Add these missing Render environment variables:</p><p><code>${missing.join('</code>, <code>')}</code></p>`
    ));
  }
  if (req.query.key !== config.gmail.oauthSetupKey) return res.status(404).send('Not found');

  const state = crypto.randomBytes(32).toString('hex');
  pendingStates.set(state, Date.now() + 10 * 60 * 1000);
  const authorizationUrl = client().generateAuthUrl({
    access_type: 'offline',
    prompt: 'consent',
    scope,
    state
  });
  res.redirect(authorizationUrl);
});

router.get('/oauth2callback', async (req, res) => {
  const expiresAt = pendingStates.get(req.query.state);
  pendingStates.delete(req.query.state);
  if (!expiresAt || expiresAt < Date.now()) return res.status(400).send(page('Authorization expired', '<p>Start the authorization again.</p>'));
  if (req.query.error) return res.status(400).send(page('Authorization cancelled', `<p>${req.query.error}</p>`));

  try {
    const { tokens } = await client().getToken(req.query.code);
    if (!tokens.refresh_token) {
      return res.status(400).send(page('No refresh token received', '<p>Restart authorization and approve access again.</p>'));
    }
    res.send(page('OAuth complete', `<p>Copy this refresh token into Render as <code>GMAIL_REFRESH_TOKEN</code>. Do not share it.</p><p><code>${tokens.refresh_token}</code></p><p>You can close this page after saving it.</p>`));
  } catch (error) {
    console.error('Gmail OAuth callback failed:', { code: error.code, message: error.message });
    res.status(502).send(page('OAuth failed', '<p>Google authorization could not be completed. Check the server logs.</p>'));
  }
});

module.exports = router;
