import { Inter } from "next/font/google";
import Sidebar from "@/components/Sidebar";
import { AuthProvider } from "../contexts/AuthContext";
const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Voice Agent Platform",
  description: "Create and manage AI voice agents",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <div className="flex">
          <Sidebar active="Dashboard" />
          <div className="flex-grow">
            <AuthProvider>{children}</AuthProvider>
          </div>
        </div>
      </body>
    </html>
  );
}
