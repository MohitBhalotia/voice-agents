"use server";
import { cookies } from "next/headers";

export const getCookies = async () => {
  const cookieStore = await cookies();
  const cookie = cookieStore.get("token")?.value;
  
  return cookie;
};
