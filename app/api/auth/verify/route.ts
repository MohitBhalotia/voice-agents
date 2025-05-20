import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const token = searchParams.get('token');

  const user = await prisma.user.findFirst({ where: { verification_token: token  } });
  if (!user) return NextResponse.json({ error: 'Invalid token' }, { status: 400 });

  await prisma.user.update({
    where: { id: user.id },
    data: {
      is_verified: true,
      verification_token: null,
    },
  });

  return NextResponse.json({ message: 'Email verified successfully!' });
}