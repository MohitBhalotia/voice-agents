import { NextResponse } from "next/server";
import { z } from "zod";
// import { getCookies } from "@/utils/getCookies";
import prisma from "@/lib/prisma";
import { llm_model } from "@prisma/client";

// Create the validation schema
const configureAgentSchema = z.object({
  userId: z.string().uuid(),
  agentId: z.string().uuid(),
  agent_language: z.string().min(1),
  firstMessage: z.string().min(1),
  systemPrompt: z.string().min(1),
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
  fetch_initiation_webhook_url: z.string().url(),
  post_call_webhook_url: z.string().url(),
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
    console.log(updatableFields);

    const configuration = await prisma.agentConfiguration.upsert({
      where: { agentId },
      update: updatableFields,
      create: {
        agentId,
        ...updatableFields,
      },
    });

    return NextResponse.json({
      message: "Agent configuration updated successfully",
    //   configuration,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
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

// export async function GET(req: Request) {
//   try {
//     const token = await getCookies();
//     if (!token) {
//       return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
//     }

//     const { searchParams } = new URL(req.url);
//     const agentId = searchParams.get("agentId");

//     if (!agentId) {
//       return NextResponse.json(
//         { error: "Agent ID is required" },
//         { status: 400 }
//       );
//     }

//     // Check if agent exists and belongs to the user
//     const agent = await prisma.agent.findFirst({
//       where: {
//         id: agentId,
//         userId: token, // Assuming token contains userId
//       },
//     });

//     if (!agent) {
//       return NextResponse.json(
//         { error: "Agent not found or unauthorized" },
//         { status: 404 }
//       );
//     }

//     const configuration = await prisma.agentConfiguration.findUnique({
//       where: {
//         agentId: agentId,
//       },
//     });

//     if (!configuration) {
//       return NextResponse.json(
//         { error: "Configuration not found" },
//         { status: 404 }
//       );
//     }

//     return NextResponse.json({ configuration });
//   } catch (error) {
//     console.error("Error fetching agent configuration:", error);
//     return NextResponse.json(
//       { error: "Internal server error" },
//       { status: 500 }
//     );
//   }
// }
