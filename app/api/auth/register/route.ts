import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { sendVerificationEmail } from "@/lib/mailer";
import crypto from "crypto";
import { z } from "zod";

// Define Zod schema
const userSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8, "Password must be at least 6 characters"),
  fullName: z.string().min(2, "Full name is required"),
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
    
    const { email, password, fullName } = userSchema.parse(body); // Validate input

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return NextResponse.json(
        { error: "Email already registered" },
        { status: 400 }
      );
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const verification_token = crypto.randomBytes(32).toString("hex");

    const user = await prisma.user.create({
      data: {
        email,
        fullName,
        passwordHash,
        verification_token,
      },
    });

    await sendVerificationEmail(email, verification_token);

    return NextResponse.json({
      status: 201,
      message: "Account created successfully. Check your email to verify.",
    });
  } catch (error) {
    console.log(error);
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors.map((e) => e.message).join(", ") },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
