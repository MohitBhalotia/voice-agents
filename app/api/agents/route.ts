import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/route";
import { PrismaClient } from "@prisma/client";
import { Deepgram } from "@deepgram/sdk";

const prisma = new PrismaClient();
const deepgram = new Deepgram(process.env.DEEPGRAM_API_KEY);

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { name, description, voiceModel, language } = body;

    // Validate required fields
    if (!name || !description || !voiceModel || !language) {
      return NextResponse.json(
        { message: "Missing required fields" },
        { status: 400 }
      );
    }

    // Get the user from the database
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    // Create the agent in Deepgram
    const deepgramResponse = await deepgram.manage.createAgent({
      name,
      description,
      voice: {
        model: voiceModel,
        language,
      },
      // Add any additional Deepgram configuration here
      settings: {
        // You can customize these settings based on your needs
        temperature: 0.7,
        maxTokens: 150,
        topP: 0.9,
      },
    });

    if (!deepgramResponse?.agent?.id) {
      throw new Error("Failed to create agent in Deepgram");
    }

    // Create the agent in our database
    const agent = await prisma.agent.create({
      data: {
        name,
        userId: user.id,
        configuration: {
          create: {
            llmModel: "deepgram",
            systemPrompt: "You are a helpful voice assistant.",
            firstMessage: "Hello! How can I help you today?",
            temperature: 0.7,
            voiceId: deepgramResponse.agent.id,
          },
        },
      },
      include: {
        configuration: true,
      },
    });

    return NextResponse.json(agent, { status: 201 });
  } catch (error) {
    console.error("Error creating agent:", error);
    return NextResponse.json(
      { message: "Failed to create agent" },
      { status: 500 }
    );
  }
}
