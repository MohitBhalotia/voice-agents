"use client";

import React, { useEffect, useState } from "react";
import { useAuth } from "@/app/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { Plus, Settings, Phone, Trash2 } from "lucide-react";
import { toast } from "react-hot-toast";

interface Agent {
  id: string;
  name: string;
  createdAt: string;
  configuration: {
    agent_language: string;
    firstMessage: string;
    systemPrompt: string;
    llmModel: string;
  };
}

const MyAgentsPage = () => {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  console.log("user",user);
  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
    }
  }, [authLoading, user, router]);

  useEffect(() => {
    const fetchAgents = async () => {
      try {
        const response = await fetch("/api/agents/my-agents", {
          headers: {
            "user-id": user?.id as string,
          },
        });

        if (!response.ok) {
          throw new Error("Failed to fetch agents");
        }

        const data = await response.json();
        setAgents(data.agents);
      } catch (err) {
        setError(`Failed to load agents, ${err}`);
        toast.error("Failed to load agents");
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchAgents();
    }
  }, [user]);

  if (authLoading) {
    return (
      <div className="min-h-screen bg-[#0A0A0A] text-white p-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-3xl font-bold">My Agents</h1>
            <div className="h-10 w-32 bg-gray-800 animate-pulse rounded" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-48 bg-gray-800 animate-pulse rounded-lg"
              />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold">My Agents</h1>
          <button
            onClick={() => router.push("/agents/new")}
            className="bg-[#2563EB] hover:bg-[#1D4ED8] text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
          >
            <Plus className="h-4 w-4" />
            Create New Agent
          </button>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 mb-6">
            <p className="text-red-500">{error}</p>
          </div>
        )}

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-48 bg-gray-800 animate-pulse rounded-lg"
              />
            ))}
          </div>
        ) : agents.length === 0 ? (
          <div className="text-center py-12">
            <h3 className="text-xl font-semibold mb-2">No Agents Yet</h3>
            <p className="text-gray-400 mb-6">
              Create your first agent to get started
            </p>
            <button
              onClick={() => router.push("/agents/new")}
              className="bg-[#2563EB] hover:bg-[#1D4ED8] text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors mx-auto"
            >
              <Plus className="h-4 w-4" />
              Create New Agent
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {agents.map((agent) => (
              <div
                key={agent.id}
                className="bg-[#1A1A1A] border border-[#2A2A2A] hover:border-[#3A3A3A] transition-all duration-200 rounded-lg"
              >
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-xl font-semibold mb-1">
                        {agent.name}
                      </h3>
                      <p className="text-sm text-gray-400">
                        Created {new Date(agent.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    {agent.configuration && <div>Configured</div>}
                    <button
                      onClick={() => router.push(`/agents/${agent.id}`)}
                      className="text-gray-400 hover:text-white p-2 rounded-lg hover:bg-gray-800 transition-colors"
                    >
                      <Settings className="h-5 w-5" />
                    </button>
                  </div>

                  <div className="flex space-x-2">
                    <button
                      onClick={() => router.push(`/agents/${agent.id}/call`)}
                      className="flex-1 border border-[#2A2A2A] hover:border-[#3A3A3A] px-4 py-2 rounded-lg flex items-center justify-center gap-2 transition-colors"
                    >
                      <Phone className="h-4 w-4" />
                      Call
                    </button>
                    <button
                      onClick={() => {
                        // Add delete functionality
                        toast.error("Delete functionality not implemented yet");
                      }}
                      className="flex-1 border border-[#2A2A2A] hover:border-[#3A3A3A] text-red-500 hover:text-red-400 px-4 py-2 rounded-lg flex items-center justify-center gap-2 transition-colors"
                    >
                      <Trash2 className="h-4 w-4" />
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyAgentsPage;
