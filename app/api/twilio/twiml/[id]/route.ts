import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const agentId = params.id;

  const agent = await prisma.agent.findUnique({
    where: { id: agentId },
  });

  if (!agent) {
    return new NextResponse("Agent not found", { status: 404 });
  }

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say language="en">Welcome to the live assistant.</Say>
  <Connect>
    <Stream url="wss://${process.env.SERVER_URL}/twilio">
      <Parameter name="agent_id" value="${agentId}" />
    </Stream>
  </Connect>
</Response>`;

  return new NextResponse(xml, {
    status: 200,
    headers: {
      "Content-Type": "text/xml",
    },
  });
}
