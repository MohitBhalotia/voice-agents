import { NextRequest } from "next/server";
import prisma from "@/lib/prisma";

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const data = await req.json();
    const numberId = params.id;
    const agentId = data.agentId;

    if (!numberId || !agentId) {
      return Response.json(
        { error: "Number ID and agent ID are required" },
        { status: 400 }
      );
    }
    const updatedNumber = await prisma.phoneNumber.update({
      where: { id: numberId },
      data: { agentId },
    });

    return Response.json({ updatedNumber });
  } catch (error) {
    return Response.json({ error: "Failed to update number" }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const numberId = params.id;

    if (!numberId) {
      return Response.json({ error: "Number ID is required" }, { status: 400 });
    }

    const deletedNumber = await prisma.phoneNumber.delete({
      where: {
        id: numberId,
      },
    });

    return Response.json({
      message: "Phone number deleted successfully",
      data: deletedNumber,
    });
  } catch (error: any) {
    console.error("Failed to delete phone number:", error);
    return Response.json({ error: "Failed to delete phone number" }, { status: 500 });
  }
}
