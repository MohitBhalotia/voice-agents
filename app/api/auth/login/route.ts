import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { signToken } from "@/lib/auth";
import { z } from "zod";

// Define Zod schema for validation
const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

export async function POST(req: Request) {
  try {
    let body;

    // Safely parse JSON body
    try {
      body = await req.json();
    } catch (error) {
      console.error("JSON parse error:", error);
      return NextResponse.json(
        { error: "Invalid or missing JSON body" },
        { status: 400 }
      );
    }

    // Validate input with Zod
    const { email, password } = loginSchema.parse(body);

    // Find user by email
    const user = await prisma.user.findUnique({ where: { email } });

    if (!user || !user.is_verified) {
      console.error("User not found or unverified:", email);
      return NextResponse.json(
        { error: "Invalid credentials or unverified" },
        { status: 401 }
      );
    }

    // Check password
    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      console.error("Invalid password for user:", email);
      return NextResponse.json(
        { error: "Invalid credentials" },
        { status: 401 }
      );
    }

    // Sign JWT token
    const token = await signToken({ id: user.id, email: user.email });
    await prisma.user.update({
      where: { id: user.id },
      data: { last_login_at: new Date() },
    });

    // Create NextResponse and set cookie
    const res = NextResponse.json(
      { message: "Login successful" },
      { status: 200 }
    );

    // Set cookie with more permissive settings for Docker environment
    res.cookies.set("token", token, {
      httpOnly: true,
      path: "/",
      sameSite: "lax",
      secure: false,
      maxAge: 60 * 60 * 24 * 7, // 1 week
      domain: "localhost", // Explicitly set domain for localhost
    });

    // console.log("Login successful for user:", email);
    return res;
  } catch (error) {
    console.error("Login error:", error);
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
