import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 465,
  secure: true,
  auth: {
    user: 'satyajitpratihar200@gmail.com',
    pass: 'mevuakhqinezzefq',
  },
  tls: {
    rejectUnauthorized: false
  }
});

transporter.verify((error, success) => {
  if (error) {
    console.error('? [AVORA SMTP] Connection Error:', error);
  } else {
    console.log('? [AVORA SMTP] Connected to Gmail SMTP (satyajitpratihar200@gmail.com)');
  }
});

export interface SendOtpOptions {
  email: string;
  name?: string;
  otpCode: string;
  purpose?: string;
}

export async function sendOtpEmail({ email, name = 'Valued User', otpCode, purpose = 'Account Verification' }: SendOtpOptions) {
  const subject = `[AVORA Security] ${otpCode} is your Verification Code`;

  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f8fafc; margin: 0; padding: 20px; }
        .container { max-width: 560px; margin: 0 auto; background: #ffffff; border-radius: 16px; border: 1px solid #e2e8f0; overflow: hidden; box-shadow: 0 10px 25px rgba(0,0,0,0.05); }
        .header { background: linear-gradient(135deg, #0284c7, #38bdf8); padding: 32px 24px; text-align: center; color: #ffffff; }
        .brand { font-size: 28px; font-weight: 900; letter-spacing: 2px; margin: 0; text-transform: uppercase; }
        .subbrand { font-size: 11px; font-weight: 700; letter-spacing: 1.5px; opacity: 0.9; margin-top: 4px; text-transform: uppercase; }
        .content { padding: 32px 24px; text-align: center; color: #334155; }
        .greeting { font-size: 18px; font-weight: 700; color: #0f172a; margin-bottom: 12px; }
        .message { font-size: 14px; color: #64748b; line-height: 1.6; margin-bottom: 24px; }
        .otp-box { background: #f0f9ff; border: 2px dashed #0284c7; border-radius: 14px; padding: 20px; margin: 20px 0; display: inline-block; width: 80%; }
        .otp-code { font-size: 38px; font-weight: 900; color: #0284c7; letter-spacing: 12px; font-family: 'Courier New', monospace; margin: 0; }
        .warning { font-size: 12px; color: #94a3b8; margin-top: 24px; line-height: 1.5; }
        .footer { background: #f8fafc; padding: 20px; text-align: center; font-size: 11px; color: #94a3b8; border-top: 1px solid #e2e8f0; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <div class="brand">AVORA</div>
          <div class="subbrand">AI-Powered Hospital Operating System</div>
        </div>
        <div class="content">
          <div class="greeting">Hello, ${name}!</div>
          <div class="message">
            Use the following 6-digit Security Verification Code to complete your <strong>${purpose}</strong>.
          </div>
          <div class="otp-box">
            <div class="otp-code">${otpCode}</div>
          </div>
          <div class="message">
            This OTP code is valid for <strong>10 minutes</strong>. Do not share this code with anyone.
          </div>
          <div class="warning">
            If you did not request this verification code, please ignore this email or contact AVORA Security.
          </div>
        </div>
        <div class="footer">
          © 2026 AVORA Technologies · Protected Medical Communication System · HIPAA & NABH Certified
        </div>
      </div>
    </body>
    </html>
  `;

  try {
    const info = await transporter.sendMail({
      from: '"AVORA Security" <satyajitpratihar200@gmail.com>',
      to: email,
      subject,
      text: `Your AVORA OTP code is: ${otpCode}. Valid for 10 minutes.`,
      html: htmlContent,
    });
    console.log(`? [AVORA SMTP] Real OTP email delivered to ${email} (MessageID: ${info.messageId})`);
    return { success: true, messageId: info.messageId };
  } catch (err: any) {
    console.error(`? [AVORA SMTP] Failed to send OTP email to ${email}:`, err);
    throw err;
  }
}

export async function sendNotificationEmail(toEmail: string, subject: string, bodyText: string) {
  try {
    const info = await transporter.sendMail({
      from: '"AVORA Platform" <satyajitpratihar200@gmail.com>',
      to: toEmail,
      subject: `[AVORA] ${subject}`,
      text: bodyText,
      html: `<p style="font-family:sans-serif;font-size:14px;color:#334155;">${bodyText}</p>`,
    });
    console.log(`? [AVORA SMTP] Notification email delivered to ${toEmail} (MessageID: ${info.messageId})`);
    return { success: true, messageId: info.messageId };
  } catch (err: any) {
    console.error(`? [AVORA SMTP] Failed to send notification email to ${toEmail}:`, err);
    throw err;
  }
}