import twilio from "twilio";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const pathParts = url.pathname.split("/");
  const country_code = pathParts[pathParts.length - 1];

  const client = twilio(
    process.env.TWILIO_ACCOUNT_SID,
    process.env.TWILIO_AUTH_TOKEN
  );

  console.log(country_code);

  const availablePhoneNumberLocal = await client
    .availablePhoneNumbers(country_code)
    .local.list({ voiceEnabled: true, limit: 10 });

  const availablePhoneNumberTollFree = await client
    .availablePhoneNumbers(country_code)
    .tollFree.list({ voiceEnabled: true, limit: 10 });

  return Response.json({
    availablePhoneNumberLocal,
    availablePhoneNumberTollFree,
  });
}
