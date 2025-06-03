import { NextResponse } from "next/server";
import { z } from "zod";
// import { getCookies } from "@/utils/getCookies";
import prisma from "@/lib/prisma";
import { llm_model } from "@prisma/client";
import { agent_language } from "@prisma/client";
// import axios from "axios";
// import { getCookies } from "@/utils/getCookies";
// import { verifyJWTToken } from "@/lib/auth";
import { buildDeepgramPayload } from "@/utils/buildPayload";
// Create the validation schema
const configureAgentSchema = z.object({
  userId: z.string().uuid(),
  agentId: z.string().uuid(),
  agent_language: z.nativeEnum(agent_language).default(agent_language.EN),
  firstMessage: z.string().min(1),
  systemPrompt: z.string().min(10),
  llmModel: z.nativeEnum(llm_model).default(llm_model.OPENAI_GPT_4O_MINI),
  temperature: z.number().min(0).max(1).default(0.7),
  tokenLimit: z.number().int().positive().default(4096),
  use_rag: z.boolean().default(false),
  voiceId: z.string().min(1),
  use_flash_call: z.boolean().default(false),
  tts_output_format: z.string().default("mp3"),
  optimize_streaming_latency: z.boolean().default(false),
  voice_stability: z.number().min(0).max(1),
  voice_speed: z.number().min(0.5).max(2),
  voice_similarity_boost: z.number().min(0).max(1),
  fetch_initiation_webhook_url: z.string().optional(),
  post_call_webhook_url: z.string().optional(),
  concurrent_calls_limit: z.number().int().positive(),
  daily_calls_limit: z.number().int().positive(),
  turn_timeout_seconds: z.number().int().positive(),
  silence_end_call_timeout_seconds: z.number().int().positive(),
  max_conversation_duration_seconds: z.number().int().positive(),
  user_input_audio_format: z.string(),
  store_call_audio: z.boolean().default(true),
  zero_pii_retention: z.boolean().default(false),
  conversation_retention_days: z.number().int().positive().default(30),
  enable_auth_for_agent_api: z.boolean().default(false),
});

export async function POST(req: Request) {
  try {
    // const token = await getCookies();
    // if (!token) {
    //   return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    // }

    const body = await req.json();

    const validatedData = configureAgentSchema.parse(body);

    // Check if agent exists and belongs to the user
    const agent = await prisma.agent.findFirst({
      where: {
        id: validatedData.agentId,
        userId: validatedData.userId,
      },
    });

    if (!agent) {
      return NextResponse.json(
        { error: "Agent not found or unauthorized" },
        { status: 404 }
      );
    }

    // Create or update agent configuration
    const { userId, agentId, ...updatableFields } = validatedData;

    const configuration = await prisma.agentConfiguration.upsert({
      where: { agentId },
      update: updatableFields,
      create: {
        agentId,
        ...updatableFields,
      },
    });

    // const response = await axios.post(
    //   `http://localhost:3000/api/agents/${agentId}/build-agent`,
    //   { configuration }
    // );
    // const data = response.data;
    // console.log(data);
    return NextResponse.json(
      {
        message: "Agent configuration updated successfully",
      },
      { status: 200 }
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.log(error.errors);

      return NextResponse.json(
        { error: "Validation error", details: error.errors },
        { status: 400 }
      );
    }

    console.error("Error configuring agent:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    // const token = await getCookies();
    // if (!token) {
    //   return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    // }
    // const payload = await verifyJWTToken(token);
    const agentId = await params.id;

    if (!agentId) {
      return NextResponse.json(
        { error: "Agent ID is required" },
        { status: 400 }
      );
    }
    
    // Check if agent exists and belongs to the user
    const agent = await prisma.agent.findFirst({
      where: {
        id: agentId,
        // userId: payload.id as string, // Assuming token contains userId
      },
    });

    if (!agent) {
      return NextResponse.json(
        { error: "Agent not found or unauthorized" },
        { status: 404 }
      );
    }

    const configuration = await prisma.agentConfiguration.findUnique({
      where: {
        agentId: agentId,
      },
    });

    if (!configuration) {
      return NextResponse.json(
        { error: "Configuration not found" },
        { status: 404 }
      );
    }
    const config=buildDeepgramPayload(configuration)
    return NextResponse.json( config );
  } catch (error) {
    console.error("Error fetching agent configuration:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
