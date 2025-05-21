"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import { jwtVerify } from "jose"; // ✅ use jwtVerify instead of jwtDecrypt
import { getCookies } from "@/utils/getCookies";

interface User {
  id: string;
  email: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  error: string | null;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: false,
  error: null,
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true); // ✅ loading should start as true
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {

    const verifyToken = async () => {

      try {
        const token=await getCookies();

        if (!token) {
          setUser(null);
          setLoading(false);
          return;
        }

        const secret = new TextEncoder().encode(
          process.env.NEXT_PUBLIC_JWT_SECRET
        ); 

        const { payload } = await jwtVerify(token, secret);

        setUser({
          id: payload.id as string,
          email: payload.email as string,
        });
      } catch (err) {
        
        setError(err instanceof Error ? err.message : "Authentication failed");
        setUser(null);
      } finally {
        setLoading(false); 
      }
    };

    verifyToken();
  }, []); 

  return (
    <AuthContext.Provider value={{ user, loading, error }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
