const nodemailer = require("nodemailer");

export const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const emailTemplate = (content: string) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>VoiceAgents</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      line-height: 1.6;
      color: #1a1a1a;
      margin: 0;
      padding: 0;
      background-color: #f4f4f5;
    }
    .container {
      max-width: 600px;
      margin: 0 auto;
      padding: 20px;
    }
    .email-wrapper {
      background-color: #ffffff;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
      overflow: hidden;
    }
    .header {
      background-color: #1e40af;
      padding: 20px;
      text-align: center;
    }
    .logo {
      width: 48px;
      height: 48px;
      margin-bottom: 16px;
    }
    .content {
      padding: 32px 24px;
    }
    .button {
      display: inline-block;
      background-color: #2563eb;
      color: #ffffff !important;
      text-decoration: none;
      padding: 12px 24px;
      border-radius: 6px;
      font-weight: 500;
      margin: 24px 0;
    }
    .button:hover {
      background-color: #1d4ed8;
    }
    .footer {
      text-align: center;
      padding: 24px;
      color: #6b7280;
      font-size: 14px;
      border-top: 1px solid #e5e7eb;
    }
    .text-gray {
      color: #6b7280;
    }
    .text-center {
      text-align: center;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="email-wrapper">
      <div class="header">
        <img src="${
          process.env.NEXT_PUBLIC_URL
        }/logo.svg" alt="VoiceAgents Logo" class="logo">
      </div>
      <div class="content">
        ${content}
      </div>
      <div class="footer">
        <p>© ${new Date().getFullYear()} VoiceAgents. All rights reserved.</p>
        <p class="text-gray">This is an automated message, please do not reply.</p>
      </div>
    </div>
  </div>
</body>
</html>
`;

export const sendVerificationEmail = async (email: string, token: string) => {
  const url = `${process.env.NEXT_PUBLIC_URL}/verify?token=${token}`;
  const content = `
    <h2 style="margin: 0 0 16px; color: #1e40af;">Welcome to VoiceAgents!</h2>
    <p>Thank you for signing up. To complete your registration and start using VoiceAgents, please verify your email address by clicking the button below:</p>
    <div class="text-center">
      <a href="${url}" class="button">Verify Email Address</a>
    </div>
    <p class="text-gray">If you did not create an account, you can safely ignore this email.</p>
    
  `;

  await transporter.sendMail({
    from: process.env.EMAIL_USER,
    to: email,
    subject: "Verify your VoiceAgents account",
    html: emailTemplate(content),
  });
};

export const sendResetPasswordEmail = async (email: string, token: string) => {
  const url = `${process.env.NEXT_PUBLIC_URL}/reset-password?token=${token}`;
  const content = `
    <h2 style="margin: 0 0 16px; color: #1e40af;">Reset Your Password</h2>
    <p>We received a request to reset your password. Click the button below to create a new password:</p>
    <div class="text-center">
      <a href="${url}" class="button">Reset Password</a>
    </div>
    <p class="text-gray">This link will expire in 1 hour for security reasons.</p>
    <p class="text-gray">If you did not request a password reset, you can safely ignore this email.</p>
    
  `;

  await transporter.sendMail({
    from: process.env.EMAIL_USER,
    to: email,
    subject: "Reset your VoiceAgents password",
    html: emailTemplate(content),
  });
};
