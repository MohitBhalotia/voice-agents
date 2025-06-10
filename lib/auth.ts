import { SignJWT, jwtVerify, JWTPayload } from "jose";

if (!process.env.JWT_SECRET) {
  throw new Error("JWT_SECRET environment variable is not set");
}

const secret = new TextEncoder().encode(process.env.JWT_SECRET);

export async function signToken(payload: JWTPayload) {
  if (!payload) {
    throw new Error("Payload is required for signing token");
  }

  return await new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime("7d")
    .sign(secret);
}

export async function verifyJWTToken(token: string) {
  if (!token) {
    throw new Error("Token is required for verification");
  }

  try {
    const { payload } = await jwtVerify(token, secret);
    return payload;
  } catch (error) {
    console.error("Token verification failed:", error);
    throw new Error("Invalid token");
  }
}
