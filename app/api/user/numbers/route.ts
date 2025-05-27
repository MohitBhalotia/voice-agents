import prisma from "@/lib/prisma";
import { NextRequest } from "next/server";
import { Prisma } from "@prisma/client";

export async function GET(req: NextRequest) {
  const userId = req.headers.get("user_id");

  if (!userId) {
    return Response.json({ error: "User ID is required" }, { status: 400 });
  }

  const phoneNumbers = await prisma.phoneNumber.findMany({
    where: { userId },
    select: {
      id: true,
      number: true,
      agentId: true,
      friendlyName: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  return Response.json({ phoneNumbers });
}

export async function POST(req: NextRequest) {
  try {
    const data = await req.json();
    const number = data.number;

    const userId = req.headers.get("user_id");

    if (!userId) {
      return Response.json({ error: "User ID is required" }, { status: 400 });
    }

    if (!number) {
      return Response.json(
        { error: "Phone number is required" },
        { status: 400 }
      );
    }

    const response = await fetch("http://localhost:3000/api/twilio/phoneNumbers/buy-number", {
      method: "POST",
      body: JSON.stringify({ number }),
      headers: {
        "Content-Type": "application/json",
        user_id: userId,
      },
    });
    const res = await response.json();
    console.log(res);

    const phoneNumber = await prisma.phoneNumber.create({
      data: {
        number,
        userId,
        sid: res.sid,
        friendlyName: res.friendlyName,
      },
    });

    return Response.json({ phoneNumber });
  } catch (error) {
    console.log(error);
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      return Response.json(
        { error: "Phone number already exists" },
        { status: 409 }
      );
    }
    return Response.json(
      { error: "Failed to create phone number", },
      { status: 500 }
    );
  }
}
