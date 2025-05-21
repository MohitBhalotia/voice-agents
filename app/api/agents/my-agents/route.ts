import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { verifyJWTToken } from "@/lib/auth";

export async function GET(req: Request) {
  try {
    const token = req.headers.get("token");
    
    const payload=await verifyJWTToken(token!)
    
    if (!payload.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Fetch all agents for the user with their configurations
    const agents = await prisma.agent.findMany({
      where: {
        userId: payload.id as string,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json({ agents }, { status: 200 });
  } catch (error) {
    console.error("Error fetching agents:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
