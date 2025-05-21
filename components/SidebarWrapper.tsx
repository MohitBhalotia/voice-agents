"use client";

import { usePathname } from "next/navigation";
import Sidebar from "./Sidebar";

export default function SidebarWrapper() {
  const pathname = usePathname();

  const getActiveSidebarItem = () => {
    if (pathname.startsWith("/dashboard")) return "Dashboard";
    if (pathname.startsWith("/agents")) return "Agents";
    if (pathname.startsWith("/call-history")) return "Call History";
    if (pathname.startsWith("/knowledge-base")) return "Knowledge Base";
    if (pathname.startsWith("/phone-numbers")) return "Phone Numbers";
    if (pathname.startsWith("/settings")) return "Settings";
    return "Dashboard";
  };

  return <Sidebar active={getActiveSidebarItem()} />;
}
