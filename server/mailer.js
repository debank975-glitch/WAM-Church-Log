const nodemailer = require('nodemailer');
const config = require('./config');

const configured = Boolean(config.smtp.host && config.smtp.user && config.smtp.password && config.smtp.from);
const escapeHtml = (value) => String(value || '').replace(/[&<>"']/g, character => ({
  '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
}[character]));
async function sendInvite(code, recipient, invitedEmail, expiresAt) {
  if (!recipient) return false;
  if (!configured) return false;
  const transporter = nodemailer.createTransport({
    host: config.smtp.host,
    port: config.smtp.port,
    secure: config.smtp.secure,
    requireTLS: !config.smtp.secure,
    auth: { user: config.smtp.user, pass: config.smtp.password },
    tls: { minVersion: 'TLSv1.2', rejectUnauthorized: true }
  });
  await transporter.sendMail({
    from: config.smtp.from,
    to: recipient,
    replyTo: config.smtp.from,
    subject: 'Hermes invitation code for a new team member',
    text: [
      'A new Hermes team member invitation was created.',
      '',
      `Invitee email: ${invitedEmail || 'Not provided'}`,
      `One-time invitation code: ${code}`,
      `Expires: ${expiresAt}`,
      '',
      'Share this code securely with the invited person. It can be used only once.'
    ].join('\n'),
    html: `
      <p>A new Hermes team member invitation was created.</p>
      <p><strong>Invitee email:</strong> ${escapeHtml(invitedEmail || 'Not provided')}<br>
      <strong>One-time invitation code:</strong> <code>${escapeHtml(code)}</code><br>
      <strong>Expires:</strong> ${escapeHtml(expiresAt)}</p>
      <p>Share this code securely with the invited person. It can be used only once.</p>
    `,
    headers: {
      'X-Auto-Response-Suppress': 'All',
      'X-Entity-Ref-ID': `hermes-invite-${Date.now()}`
    }
  });
  return true;
}
module.exports = { configured, sendInvite };
