import { NextRequest } from "next/server";
import twilio from "twilio";
export async function DELETE(req: NextRequest) {
  try {
    const { phoneNumberSid } = await req.json();

    if (!phoneNumberSid) {
      return Response.json(
        { error: "phoneNumberSid is required" },
        { status: 400 }
      );
    }

    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const authToken = process.env.TWILIO_AUTH_TOKEN;

    const client = twilio(accountSid, authToken);

    const incomingPhoneNumber = await client
      .incomingPhoneNumbers(phoneNumberSid)
      .remove();

    return Response.json(
      {
        success: true,
        phoneNumber: incomingPhoneNumber,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error linking phone number to agent:", error);
    return Response.json(
      {
        error: "Failed to link phone number to agent",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
