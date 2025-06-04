"use client";

import Link from "next/link";
import {
  Squares2X2Icon,
  UsersIcon,
  ChatBubbleLeftRightIcon,
  BookOpenIcon,
  PhoneIcon,
  Cog6ToothIcon,
  ArrowLeftStartOnRectangleIcon,
  BellIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  SpeakerWaveIcon,
  // UserCircleIcon,
  Bars3Icon,
} from "@heroicons/react/24/outline";
import { useState } from "react";

export default function Sidebar({ active = "Dashboard" }: { active?: string }) {
  const [audioOpen, setAudioOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside
      className={`flex flex-col h-screen ${
        collapsed ? "w-20" : "w-72"
      } bg-[#16171a] border-r border-gray-800 text-white transition-all duration-200`}
    >
      {/* Toggle Button */}
      <div className="flex items-center justify-start px-2 pt-2 pb-1">
        <button
          aria-label="Toggle sidebar"
          title="Toggle sidebar"
          onClick={() => setCollapsed((c) => !c)}
          className="p-2 bg-violet-600 border border-violet-400 rounded-lg shadow hover:bg-violet-700 focus:outline-none focus:ring-2 focus:ring-violet-400"
        >
          <Bars3Icon className="h-6 w-6 text-white" />
        </button>
      </div>
      {/* Logo and App Name */}
      <div
        className={`flex items-center gap-2 ${
          collapsed ? "justify-center" : "px-6"
        } py-4`}
      >
        {!collapsed && (
          <span className="font-extrabold text-lg tracking-tight">
            II<span className="text-violet-400">VoiceAgents</span>
          </span>
        )}
      </div>
      {!collapsed && (
        <div className="px-6 pb-4">
          <span className="text-xl font-bold">Conversational AI</span>
        </div>
      )}
      {/* Navigation */}
      <nav className="flex-1 px-2 space-y-1">
        <SidebarLink
          href="/dashboard"
          icon={<Squares2X2Icon className="h-6 w-6" />}
          label="Dashboard"
          active={active === "Dashboard"}
          collapsed={collapsed}
        />
        <SidebarLink
          href="/agents/my-agents"
          icon={<UsersIcon className="h-6 w-6" />}
          label="Agents"
          active={active === "Agents"}
          collapsed={collapsed}
        />
        <SidebarLink
          href="/call-history"
          icon={<ChatBubbleLeftRightIcon className="h-6 w-6" />}
          label="Call History"
          active={active === "Call History"}
          collapsed={collapsed}
        />
        <SidebarLink
          href="/knowledge-base"
          icon={<BookOpenIcon className="h-6 w-6" />}
          label="Knowledge Base"
          active={active === "Knowledge Base"}
          collapsed={collapsed}
        />
        <SidebarLink
          href="/phone-numbers"
          icon={<PhoneIcon className="h-6 w-6" />}
          label="Phone Numbers"
          active={active === "Phone Numbers"}
          collapsed={collapsed}
        />
        <SidebarLink
          href="/settings"
          icon={<Cog6ToothIcon className="h-6 w-6" />}
          label="Settings"
          active={active === "Settings"}
          collapsed={collapsed}
        />
      </nav>
      <div className="border-t border-gray-800 my-4" />
      {/* Extra Links */}
      <div className="px-4 space-y-2">
        <SidebarLink
          href={`${process.env.NEXT_PUBLIC_URL}`}
          icon={<ArrowLeftStartOnRectangleIcon className="h-5 w-5" />}
          label="Back to Home"
          external
          collapsed={collapsed}
        />
        {/* Audio Tools Collapsible */}
        <button
          className={`flex items-center w-full text-left px-2 py-2 rounded-lg hover:bg-gray-800 transition ${
            collapsed ? "justify-center" : ""
          }`}
          onClick={() => setAudioOpen((o) => !o)}
        >
          <SpeakerWaveIcon className={`h-5 w-5 ${!collapsed ? "mr-3" : ""}`} />
          {!collapsed && <span className="flex-1">Audio Tools</span>}
          {!collapsed &&
            (audioOpen ? (
              <ChevronUpIcon className="h-4 w-4" />
            ) : (
              <ChevronDownIcon className="h-4 w-4" />
            ))}
        </button>
        {!collapsed && audioOpen && (
          <div className="ml-8 space-y-1">
            <SidebarLink href="/audio/convert" label="Convert" small />
            <SidebarLink href="/audio/analyze" label="Analyze" small />
          </div>
        )}
        <SidebarLink
          href="/notifications"
          icon={<BellIcon className="h-5 w-5" />}
          label="Notifications"
          collapsed={collapsed}
        />
      </div>
      {/* User Profile */}
      <div className="mt-auto px-4 py-4 border-t border-gray-800">
        <button
          className={`flex items-center w-full text-left px-2 py-2 rounded-lg hover:bg-gray-800 transition ${
            collapsed ? "justify-center" : ""
          }`}
          onClick={() => setProfileOpen((o) => !o)}
        >
          <span className="relative mr-3">
            <span className="inline-flex items-center justify-center h-9 w-9 rounded-full bg-violet-600 text-white font-bold text-lg">
              M
            </span>
          </span>
          {!collapsed && (
            <span className="flex-1">
              <span className="font-semibold">Mohit Bhalotia</span>
              <br />
              <span className="text-xs text-gray-400">My Workspace</span>
            </span>
          )}
          {!collapsed &&
            (profileOpen ? (
              <ChevronUpIcon className="h-4 w-4" />
            ) : (
              <ChevronDownIcon className="h-4 w-4" />
            ))}
        </button>
        {!collapsed && profileOpen && (
          <div className="ml-12 mt-2 space-y-1">
            <SidebarLink href="/profile" label="Profile" small />
            <SidebarLink href="/logout" label="Logout" small />
          </div>
        )}
      </div>
    </aside>
  );
}

function SidebarLink({
  href,
  icon,
  label,
  active,
  external,
  small,
  collapsed,
}: {
  href: string;
  icon?: React.ReactNode;
  label: string;
  active?: boolean;
  external?: boolean;
  small?: boolean;
  collapsed?: boolean;
}) {
  const base =
    "flex items-center gap-3 px-2 py-2 rounded-lg transition font-medium";
  const activeClass = active
    ? "bg-gray-800 text-white"
    : "text-gray-300 hover:bg-gray-800 hover:text-white";
  const size = small ? "text-sm pl-8 py-1" : "text-base";
  return external ? (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={`${base} ${activeClass} ${size} ${
        collapsed ? "justify-center" : ""
      }`}
    >
      {icon}
      {!collapsed && label}
    </a>
  ) : (
    <Link
      href={href}
      className={`${base} ${activeClass} ${size} ${
        collapsed ? "justify-center" : ""
      }`}
    >
      {icon}
      {!collapsed && label}
    </Link>
  );
}
