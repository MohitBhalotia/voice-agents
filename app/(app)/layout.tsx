import { Inter } from "next/font/google";
import Sidebar from "@/components/Sidebar";

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
          <div className="flex-grow">{children}</div>
        </div>
      </body>
    </html>
  );
}
