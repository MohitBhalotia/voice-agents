"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  MagnifyingGlassIcon,
  ChartBarIcon,
  ClockIcon,
  UserGroupIcon,
} from "@heroicons/react/24/outline";
import { useAuth } from "@/app/contexts/AuthContext";

interface Agent {
  id: string;
  name: string;
  description: string;
  isActive: boolean;
  createdAt: string;
  // lastActive?: string;
  // totalInteractions?: number;
  // successRate?: number;
}

interface DashboardStats {
  totalAgents: number;
  activeAgents: number;
  totalInteractions: number;
  averageSuccessRate: number;
}

export default function DashboardPage() {
  const { user  } = useAuth();
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<
    "all" | "active" | "inactive"
  >("all");
  const [stats, setStats] = useState<DashboardStats>({
    totalAgents: 0,
    activeAgents: 0,
    totalInteractions: 0,
    averageSuccessRate: 0,
  });

  useEffect(() => {
    const fetchAgents = async () => {
      try {
        const response = await fetch("/api/agents/my-agents", {
          headers: {
            "user-id": user?.id as string,
          },
        });
        
        if(response.status!==200)
        {
          throw new Error("Failed to fetch agents");
        }
        const data = await response.json();
        console.log(data);
        
        setAgents(data.agents);

        // Calculate stats
        const activeAgents = data.agents.filter(
          (agent: Agent) => agent.isActive === true
        ).length;
        
        // const totalInteractions = data.reduce(
        //   (sum: number, agent: Agent) => sum + (agent.totalInteractions || 0),
        //   0
        // );
        // const averageSuccessRate =
        //   data.length > 0
        //     ? data.reduce(
        //         (sum: number, agent: Agent) => sum + (agent.successRate || 0),
        //         0
        //       ) / data.length
        //     : 0;

        setStats({
          totalAgents: data.agents.length,
          activeAgents,
          // TODO: Add total interactions and average success rate
          totalInteractions: 0,
          averageSuccessRate: 0,
        });
      } catch (error) {
        setError(`Failed to load agents. Please try again later. ${error}`);
      } finally {
        setLoading(false);
      }
    };

    fetchAgents();
  }, [user]);

  let filteredAgents: Agent[] =[];
  if (agents.length > 0) {
    filteredAgents = agents.filter((agent) => {
      const matchesSearch =
        agent.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        agent.description.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus =
        statusFilter === "all" || agent.isActive === (statusFilter === "active");
      return matchesSearch && matchesStatus;
    });
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900">
      <main className="py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header Section */}
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold text-white">Dashboard</h1>
              <p className="mt-1 text-sm text-gray-400">
                Manage and monitor your AI agents
              </p>
            </div>
            <Link
              href="/agents/new"
              className="inline-flex items-center px-5 py-2 border border-transparent text-base font-semibold rounded-lg shadow-lg text-white bg-violet-600 hover:bg-violet-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-violet-500 transition-all duration-200"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="size-6 mr-2"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 4.5v15m7.5-7.5h-15"
                />
              </svg>
              New Agent
            </Link>
          </div>

          {/* Stats Overview */}
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 mb-10">
            <div className="bg-gray-800 border border-gray-700 shadow-lg rounded-xl">
              <div className="p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <UserGroupIcon className="h-7 w-7 text-gray-400" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-base font-medium text-gray-400 truncate">
                        Total Agents
                      </dt>
                      <dd className="text-2xl font-bold text-white">
                        {stats.totalAgents}
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>
            <div className="bg-gray-800 border border-gray-700 shadow-lg rounded-xl">
              <div className="p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <ChartBarIcon className="h-7 w-7 text-green-400" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-base font-medium text-gray-400 truncate">
                        Active Agents
                      </dt>
                      <dd className="text-2xl font-bold text-white">
                        {stats.activeAgents}
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>
            <div className="bg-gray-800 border border-gray-700 shadow-lg rounded-xl">
              <div className="p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <ClockIcon className="h-7 w-7 text-blue-400" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-base font-medium text-gray-400 truncate">
                        Total Interactions
                      </dt>
                      <dd className="text-2xl font-bold text-white">
                        {stats.totalInteractions}
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>
            <div className="bg-gray-800 border border-gray-700 shadow-lg rounded-xl">
              <div className="p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <ChartBarIcon className="h-7 w-7 text-violet-400" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-base font-medium text-gray-400 truncate">
                        Success Rate
                      </dt>
                      <dd className="text-2xl font-bold text-white">
                        {isNaN(stats.averageSuccessRate)
                          ? "0.0"
                          : stats.averageSuccessRate.toFixed(1)}
                        %
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Search and Filter */}
          <div className="mb-10 flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative rounded-lg shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <MagnifyingGlassIcon className="h-5 w-5 text-gray-500" />
                </div>
                <input
                  type="text"
                  className="bg-gray-800 border border-gray-700 text-white placeholder-gray-500 focus:ring-violet-500 focus:border-violet-500 block w-full pl-10 sm:text-base rounded-lg py-2"
                  placeholder="Search agents..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <select
                className="bg-gray-800 border border-gray-700 text-white focus:ring-violet-500 focus:border-violet-500 block w-full pl-3 pr-10 py-2 text-base rounded-lg"
                value={statusFilter}
                onChange={(e) =>
                  setStatusFilter(
                    e.target.value as "all" | "active" | "inactive"
                  )
                }
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
          </div>

          {error && (
            <div className="mt-4 bg-red-900 border border-red-700 text-red-200 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          {/* Agents Grid */}
          <div className="mt-8">
            {filteredAgents.length === 0 ? (
              <div className="text-center py-16 bg-gray-800 rounded-2xl shadow-lg border border-gray-700">
                <h3 className="mt-2 text-lg font-semibold text-white">
                  No agents found
                </h3>
                <p className="mt-1 text-base text-gray-400">
                  {searchQuery || statusFilter !== "all"
                    ? "Try adjusting your search or filter criteria"
                    : "Get started by creating a new agent."}
                </p>
                <div className="mt-8">
                  <Link
                    href="/agents/new"
                    className="inline-flex items-center px-6 py-3 border border-transparent shadow-lg text-base font-semibold rounded-lg text-white bg-violet-600 hover:bg-violet-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-violet-500 transition-all duration-200"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={1.5}
                      stroke="currentColor"
                      className="size-6 mr-2"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M12 4.5v15m7.5-7.5h-15"
                      />
                    </svg>
                    New Agent
                  </Link>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {filteredAgents.map((agent) => (
                  <div
                    key={agent.id}
                    className="bg-gray-800 border border-gray-700 overflow-hidden shadow-lg rounded-2xl hover:shadow-xl transition-shadow duration-300"
                  >
                    <div className="px-6 py-6">
                      <div className="flex items-center justify-between">
                        <h3 className="text-xl font-semibold text-white">
                          {agent.name}
                        </h3>
                        <span
                          className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${
                            agent.isActive === true
                              ? "bg-green-900 text-green-300"
                              : "bg-gray-700 text-gray-400"
                          }`}
                        >
                          {agent.isActive ? "Active" : "Inactive"}
                        </span>
                      </div>
                      <p className="mt-2 text-base text-gray-400">
                        {agent.description}
                      </p>
                      {/* <div className="mt-4 space-y-2">
                        {agent.lastActive && (
                          <p className="text-xs text-gray-500">
                            Last active:{" "}
                            {new Date(agent.lastActive).toLocaleDateString()}
                          </p>
                        )}
                        {agent.totalInteractions !== undefined && (
                          <p className="text-xs text-gray-500">
                            Total interactions: {agent.totalInteractions}
                          </p>
                        )}
                        {agent.successRate !== undefined && (
                          <p className="text-xs text-gray-500">
                            Success rate: {agent.successRate.toFixed(1)}%
                          </p>
                        )}
                      </div> */}
                      <div className="mt-6 flex justify-between items-center">
                        <Link
                          href={`/agents/${agent.id}`}
                          className="text-base font-semibold text-violet-400 hover:text-violet-300 transition-colors"
                        >
                          View details
                          <span aria-hidden="true"> &rarr;</span>
                        </Link>
                        <button
                          className="text-base font-semibold text-gray-400 hover:text-white transition-colors"
                          onClick={() => {
                            /* Add quick action handler */
                          }}
                        >
                          Quick Actions
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
