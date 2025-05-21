import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const data = await req.json();

    // Example: Validate required fields (expand as needed)
    if (
      !data.agentName ||
      !data.language ||
      !data.firstMessage ||
      !data.systemPrompt ||
      !data.model ||
      !data.temperature ||
      !data.maxTokens ||
      !data.knowledgeBase ||
      !data.use_rag 
    //   TODO: Add more fields
    ) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Here you would save the config to a database, or pass it to your WebSocket logic
    // For now, just echo it back
    return NextResponse.json({ success: true, config: data });
  } catch (err) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}
