const nodemailer = require('nodemailer');
const config = require('./config');

const configured = Boolean(config.smtp.host && config.smtp.user && config.smtp.password && config.smtp.from);
async function sendInvite(code, recipient = config.smtp.adminEmail) {
  if (!recipient) return false;
  if (!configured) return false;
  const transporter = nodemailer.createTransport({
    host: config.smtp.host, port: config.smtp.port, secure: config.smtp.secure,
    auth: { user: config.smtp.user, pass: config.smtp.password }
  });
  await transporter.sendMail({
    from: config.smtp.from, to: recipient,
    subject: 'Hermes user invite code',
    text: `A new one-time Hermes user invite code is: ${code}`
  });
  return true;
}
module.exports = { configured, sendInvite };
