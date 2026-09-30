const nodemailer = require('nodemailer');
const config = require('./env');

let transporter = null;

function getTransporter() {
  if (transporter) return transporter;
  if (!config.smtp.user || !config.smtp.pass) return null;
  transporter = nodemailer.createTransport({
    host: config.smtp.host,
    port: config.smtp.port,
    secure: config.smtp.port === 465,
    auth: { user: config.smtp.user, pass: config.smtp.pass },
  });
  return transporter;
}

async function verifyEmailConfig() {
  const t = getTransporter();
  if (!t) return { ok: false, reason: 'SMTP not configured' };
  try {
    await t.verify();
    return { ok: true };
  } catch (e) {
    return { ok: false, reason: e.message };
  }
}

function buildResetEmail({ toName, resetUrl }) {
  const from = `"${config.smtp.fromName}" <${config.smtp.fromEmail}>`;
  const subject = 'Reset your ClinicOCR password';
  const text = `Hi ${toName || 'there'},\n\nYou requested a password reset for your ClinicOCR account.\n\nReset your password: ${resetUrl}\n\nThis link expires in 1 hour. If you didn't request this, you can safely ignore this email.\n\n— ClinicOCR`;
  const html = `<!doctype html>
<html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width"></head>
<body style="margin:0;padding:0;background:#f1f5f9;font-family:Inter,system-ui,-apple-system,Segoe UI,Roboto,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f1f5f9;padding:24px 12px;">
    <tr><td align="center">
      <table width="560" cellpadding="0" cellspacing="0" style="max-width:560px;width:100%;background:#ffffff;border-radius:16px;overflow:hidden;border:1px solid #e2e8f0;box-shadow:0 8px 24px rgba(15,23,42,0.08);">
        <tr><td style="background:linear-gradient(135deg,#0a2540 0%,#123B5D 40%,#0F766E 100%);padding:28px 24px;text-align:center;">
          <div style="display:inline-flex;align-items:center;gap:8px;color:#fff;font-weight:700;font-size:18px;letter-spacing:-0.02em;">ClinicOCR</div>
          <p style="margin:8px 0 0;color:rgba(255,255,255,0.7);font-size:12px;letter-spacing:0.04em;text-transform:uppercase;">Medical Document Intelligence</p>
        </td></tr>
        <tr><td style="padding:28px 24px 8px;">
          <h1 style="margin:0 0 8px;font-size:20px;line-height:1.3;color:#0f172a;font-weight:700;">Reset your password</h1>
          <p style="margin:0;color:#475569;font-size:14px;line-height:1.6;">Hi ${toName ? toName : 'there'},</p>
          <p style="margin:12px 0 0;color:#475569;font-size:14px;line-height:1.6;">We received a request to reset your ClinicOCR password. Click the button below to choose a new password. This link expires in <strong style="color:#0f172a;">1 hour</strong>.</p>
        </td></tr>
        <tr><td style="padding:16px 24px;">
          <a href="${resetUrl}" style="display:block;text-align:center;background:#123B5D;color:#ffffff;text-decoration:none;padding:13px 20px;border-radius:10px;font-weight:600;font-size:14px;">Reset Password</a>
          <p style="margin:14px 0 0;text-align:center;color:#64748b;font-size:12px;">Button not working? Copy this link:<br><a href="${resetUrl}" style="color:#123B5D;word-break:break-all;">${resetUrl}</a></p>
        </td></tr>
        <tr><td style="padding:8px 24px 24px;">
          <div style="background:#f8fafc;border:1px solid #f1f5f9;border-radius:10px;padding:12px 14px;">
            <p style="margin:0;color:#64748b;font-size:12px;line-height:1.6;"><strong style="color:#0f172a;">Didn't request this?</strong> You can safely ignore this email — your password won't change.</p>
          </div>
        </td></tr>
        <tr><td style="background:#f8fafc;border-top:1px solid #f1f5f9;padding:14px 24px;text-align:center;">
          <p style="margin:0;color:#94a3b8;font-size:11px;line-height:1.6;">This is an automated message from ClinicOCR. Please do not reply.<br>© ${new Date().getFullYear()} ClinicOCR — HIPAA-conscious platform</p>
        </td></tr>
      </table>
      <p style="margin:14px 0 0;color:#94a3b8;font-size:11px;text-align:center;">Need help? Contact your clinic administrator.</p>
    </td></tr>
  </table>
</body></html>`;
  return { from, subject, text, html };
}

async function sendResetEmail({ to, toName, resetUrl }) {
  const t = getTransporter();
  if (!t) throw new Error('SMTP not configured');
  const mail = buildResetEmail({ toName, resetUrl });
  return t.sendMail({ from: mail.from, to, subject: mail.subject, text: mail.text, html: mail.html });
}

module.exports = { getTransporter, verifyEmailConfig, buildResetEmail, sendResetEmail };
