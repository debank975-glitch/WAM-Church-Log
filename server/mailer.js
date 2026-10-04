const { google } = require('googleapis');
const config = require('./config');

const configured = Boolean(
  config.gmail.clientId &&
  config.gmail.clientSecret &&
  config.gmail.refreshToken &&
  config.gmail.sender
);

const escapeHtml = (value) => String(value || '').replace(/[&<>"']/g, character => ({
  '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
}[character]));

const encodeBase64Url = (value) => Buffer.from(value)
  .toString('base64')
  .replace(/\+/g, '-')
  .replace(/\//g, '_')
  .replace(/=+$/, '');

function createMessage(recipient, invitedEmail, code, expiresAt) {
  const subject = 'Hermes invitation code for a new team member';
  const text = [
    'A new Hermes team member invitation was created.',
    '',
    `Invitee email: ${invitedEmail || 'Not provided'}`,
    `One-time invitation code: ${code}`,
    `Expires: ${expiresAt} (Valid for 30 minutes)`,
    '',
    'Share this code securely with the invited person. It can be used only once.'
  ].join('\n');
  const html = `
    <p>A new Hermes team member invitation was created.</p>
    <p><strong>Invitee email:</strong> ${escapeHtml(invitedEmail || 'Not provided')}<br>
    <strong>One-time invitation code:</strong> <code>${escapeHtml(code)}</code><br>
    <strong>Expires:</strong> ${escapeHtml(expiresAt)} <em>(Valid for 30 minutes)</em></p>
    <p>Share this code securely with the invited person. It can be used only once.</p>
  `;
  return [
    `From: ${config.gmail.sender}`,
    `To: ${recipient}`,
    `Reply-To: ${config.gmail.sender}`,
    `Subject: ${subject}`,
    'MIME-Version: 1.0',
    'Content-Type: multipart/alternative; boundary="hermes-boundary"',
    '',
    '--hermes-boundary',
    'Content-Type: text/plain; charset="UTF-8"',
    '',
    text,
    '--hermes-boundary',
    'Content-Type: text/html; charset="UTF-8"',
    '',
    html,
    '--hermes-boundary--'
  ].join('\r\n');
}

async function sendInvite(code, recipient, invitedEmail, expiresAt) {
  if (!recipient || !configured) return false;
  const auth = new google.auth.OAuth2(config.gmail.clientId, config.gmail.clientSecret);
  auth.setCredentials({ refresh_token: config.gmail.refreshToken });
  const gmail = google.gmail({ version: 'v1', auth });
  await gmail.users.messages.send({
    userId: 'me',
    requestBody: { raw: encodeBase64Url(createMessage(recipient, invitedEmail, code, expiresAt)) }
  });
  return true;
}

module.exports = { configured, sendInvite };
