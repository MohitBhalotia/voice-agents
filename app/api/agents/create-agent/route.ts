import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import prisma from "@/lib/prisma";

// Define Zod schema for agent creation
const createAgentSchema = z.object({
  agentName: z.string().min(2, "Agent name is required"),
  userId: z.string().min(5, "User ID is required"),
  is_active: z.boolean().optional(),
});

export async function POST(req: NextRequest) {
  try {
    const data = await req.json();
    
    // Validate input with Zod
    const validatedData = createAgentSchema.parse(data);
    // Create the agent in the database
    const agent = await prisma.agent.create({
      data: {
        name: validatedData.agentName,
        userId: validatedData.userId,
        isActive: validatedData.is_active,
      },
    });

    // Return success response with the agent ID for redirection
    return NextResponse.json({
      success: true,
      agentId: agent.id,
      redirectUrl: `/agents/${agent.id}/configure`,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors.map((e) => e.message).join(", ") },
        { status: 400 }
      );
    }
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}
