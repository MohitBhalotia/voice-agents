import twilio from "twilio";

export async function GET(
  request: Request,
  { params }: { params: { country_code: string } }
) {
  const client = twilio(
    process.env.TWILIO_ACCOUNT_SID,
    process.env.TWILIO_AUTH_TOKEN
  );

  console.log(params.country_code);

  let availablePhoneNumberLocal = await client
    .availablePhoneNumbers(params.country_code)
    .local.list({ voiceEnabled: true });

  const availablePhoneNumberTollFree = await client
    .availablePhoneNumbers(params.country_code)
    .tollFree.list({ voiceEnabled: true });

  return Response.json({
    availablePhoneNumberLocal,
    availablePhoneNumberTollFree,
  });
}
