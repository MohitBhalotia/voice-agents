const nodemailer =require('nodemailer');

export const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

export const sendVerificationEmail = async (email: string, token: string) => {
  const url = `${process.env.NEXT_PUBLIC_URL}/verify?token=${token}`;
  await transporter.sendMail({
    from: process.env.EMAIL_USER,
    to: email,
    subject: 'Verify your account',
    html: `<p>Click <a href="${url}">here</a> to verify your account.</p>`
  });
};

export const sendResetPasswordEmail = async (email: string, token: string) => {
  const url = `${process.env.NEXT_PUBLIC_URL}/reset-password?token=${token}`;
  await transporter.sendMail({
    from: process.env.EMAIL_USER,
    to: email,
    subject: 'Reset your password',
    html: `<p>Click <a href="${url}">here</a> to reset your password.</p>`
  });
};