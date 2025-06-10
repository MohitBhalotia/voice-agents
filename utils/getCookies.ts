"use server";
import { cookies } from "next/headers";

export const getCookies = async () => {
  try {
    const cookieStore = await cookies();
    const cookie = cookieStore.get("token")?.value;
    return cookie;
  } catch (error) {
    // If we're on the client side, try to get the cookie from document
    if (typeof document !== "undefined") {
      const cookies = document.cookie.split(";");
      const tokenCookie = cookies.find((cookie) =>
        cookie.trim().startsWith("token=")
      );
      return tokenCookie ? tokenCookie.split("=")[1] : null;
    }
    return null;
  }
};
