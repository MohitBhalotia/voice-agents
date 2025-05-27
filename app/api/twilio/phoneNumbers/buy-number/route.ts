import { NextRequest } from "next/server";
import twilio from "twilio";
export async function POST(req: NextRequest) {
  try {
    const data = await req.json();
    const number = data.number;

    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const authToken = process.env.TWILIO_AUTH_TOKEN;
    const client = twilio(accountSid, authToken);
    const incomingPhoneNumber = await client.incomingPhoneNumbers.create({
      phoneNumber: number,
    });
    return Response.json(incomingPhoneNumber, { status: 200 });
  } catch (error) {
    console.error("Failed to buy phone number:", error);
    return Response.json(
      { error: "Failed to buy phone number" },
      { status: 500 }
    );
  }
}
