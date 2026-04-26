import nodemailer from 'nodemailer';

export const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_PASS,
  },
});

const baseHtml = (content: string) => `
  <div style="font-family:'Plus Jakarta Sans',sans-serif;max-width:480px;margin:0 auto;padding:32px;background:#f2ede8;border-radius:16px;">
    <div style="text-align:center;margin-bottom:24px;">
      <div style="display:inline-block;background:#d67d61;border-radius:12px;padding:10px 16px;">
        <span style="color:white;font-weight:800;font-size:18px;">SmartTask</span>
      </div>
    </div>
    ${content}
    <hr style="border:none;border-top:1px solid #d9d0c4;margin:24px 0;" />
    <p style="color:#a09d99;font-size:12px;text-align:center;">© 2024 SmartTask Inc.</p>
  </div>
`;

const btn = (url: string, label: string) =>
  `<a href="${url}" style="display:inline-block;background:#d67d61;color:white;font-weight:700;font-size:15px;padding:14px 28px;border-radius:12px;text-decoration:none;margin-bottom:24px;">${label}</a>`;

export const sendVerificationEmail = async (to: string, name: string, token: string) => {
  const url = `${process.env.APP_URL}/verify-email?token=${token}`;
  await transporter.sendMail({
    from: `"SmartTask" <${process.env.GMAIL_USER}>`,
    to,
    subject: 'Verify your SmartTask account',
    html: baseHtml(`
      <h2 style="color:#272422;font-size:22px;font-weight:700;margin-bottom:8px;">Hi ${name} 👋</h2>
      <p style="color:#5d5a58;font-size:15px;line-height:1.6;margin-bottom:24px;">
        Thanks for signing up! Please verify your email address to activate your account.
      </p>
      ${btn(url, 'Verify Email Address')}
      <p style="color:#a09d99;font-size:13px;margin-top:16px;">
        This link expires in 24 hours. If you didn't create an account, you can safely ignore this email.
      </p>
    `),
  });
};

export const sendPasswordResetEmail = async (to: string, name: string, token: string) => {
  const url = `${process.env.APP_URL}/reset-password?token=${token}`;
  await transporter.sendMail({
    from: `"SmartTask" <${process.env.GMAIL_USER}>`,
    to,
    subject: 'Reset your SmartTask password',
    html: baseHtml(`
      <h2 style="color:#272422;font-size:22px;font-weight:700;margin-bottom:8px;">Password Reset</h2>
      <p style="color:#5d5a58;font-size:15px;line-height:1.6;margin-bottom:24px;">
        Hi ${name}, we received a request to reset your password. Click the button below to set a new one.
      </p>
      ${btn(url, 'Reset Password')}
      <p style="color:#a09d99;font-size:13px;margin-top:16px;">
        This link expires in 1 hour. If you didn't request a reset, ignore this email.
      </p>
    `),
  });
};

export const sendTeamInviteEmail = async (to: string, inviterName: string, teamName: string, token: string) => {
  const url = token ? `${process.env.APP_URL}/accept-invite?token=${token}` : `${process.env.APP_URL}/app`;
  await transporter.sendMail({
    from: `"SmartTask" <${process.env.GMAIL_USER}>`,
    to,
    subject: `${inviterName} invited you to join ${teamName} on SmartTask`,
    html: baseHtml(`
      <h2 style="color:#272422;font-size:22px;font-weight:700;margin-bottom:8px;">You're invited! 🎉</h2>
      <p style="color:#5d5a58;font-size:15px;line-height:1.6;margin-bottom:8px;">
        <strong>${inviterName}</strong> has invited you to join <strong>${teamName}</strong> on SmartTask.
      </p>
      <p style="color:#5d5a58;font-size:15px;line-height:1.6;margin-bottom:24px;">
        Click the button below to accept the invitation and start collaborating.
      </p>
      ${btn(url, 'Accept Invitation')}
      <p style="color:#a09d99;font-size:13px;margin-top:16px;">
        This invitation expires in 7 days. If you don't have a SmartTask account, you'll be prompted to create one.
      </p>
    `),
  });
};
