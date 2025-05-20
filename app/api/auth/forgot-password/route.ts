import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { sendResetPasswordEmail } from '@/lib/mailer';
import crypto from 'crypto';
import { z } from 'zod';

// Zod schema for email
const emailSchema = z.object({
  email: z.string().email(),
});

export async function POST(req: Request) {
  try {
    let body;

    // Safely parse JSON
    try {
      body = await req.json();
    } catch {
      return NextResponse.json({ error: 'Invalid or missing JSON body' }, { status: 400 });
    }

    // Validate email with Zod
    const { email } = emailSchema.parse(body);

    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const resetToken = crypto.randomBytes(32).toString('hex');
    const expires = new Date(Date.now() + 1000 * 60 * 15); // 15 minutes

    await prisma.user.update({
      where: { email },
      data: {
        reset_password_token: resetToken,
        reset_password_expires: expires,
      },
    });

    await sendResetPasswordEmail(email, resetToken);

    return NextResponse.json({ message: 'Reset link sent to your email' });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors.map((e) => e.message).join(', ') },
        { status: 400 }
      );
    }

    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
