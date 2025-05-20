import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { z } from 'zod';

// Zod schema to validate request body
const resetSchema = z.object({
  token: z.string().min(1, 'Token is required'),
  newPassword: z.string().min(8, 'Password must be at least 6 characters'),
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

    // Validate input
    const { token, newPassword } = resetSchema.parse(body);

    // Check if user with valid token exists
    const user = await prisma.user.findFirst({
      where: {
        reset_password_token: token,
        reset_password_expires: { gt: new Date() },
      },
    });

    if (!user) {
      return NextResponse.json({ error: 'Invalid or expired token' }, { status: 400 });
    }

    const hashed = await bcrypt.hash(newPassword, 10);

    // Update user password and clear token
    await prisma.user.update({
      where: { id: user.id },
      data: {
        passwordHash: hashed,
        reset_password_token: null,
        reset_password_expires: null,
      },
    });

    return NextResponse.json({ message: 'Password updated successfully!' });
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
