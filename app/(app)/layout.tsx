import { Inter } from "next/font/google";
import SidebarWrapper from "@/components/SidebarWrapper";
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
          <SidebarWrapper />
          <div className="flex-grow">
            <AuthProvider>{children}</AuthProvider>
          </div>
        </div>
      </body>
    </html>
  );
}
