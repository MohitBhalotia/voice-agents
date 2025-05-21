import { SignJWT, jwtVerify, JWTPayload } from "jose";
const secret = new TextEncoder().encode(process.env.NEXT_PUBLIC_JWT_SECRET);

export async function signToken(payload: JWTPayload) {
  return await new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime("7d")
    .sign(secret);
}

export async function verifyToken(token: string) {
  const { payload } = await jwtVerify(token, secret);
  return payload;
}
