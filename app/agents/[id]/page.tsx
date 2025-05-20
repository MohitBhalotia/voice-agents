"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useSession } from "next-auth/react";

interface Agent {
  id: string;
  name: string;
  description: string;
  voiceModel: string;
  language: string;
  status: "active" | "inactive";
  createdAt: string;
  updatedAt: string;
}

interface Conversation {
  id: string;
  duration: number;
  createdAt: string;
  transcript: string;
}

export default function AgentDetailsPage({
  params,
}: {
  params: { id: string };
}) {
  const router = useRouter();
  const { data: session } = useSession();
  const [agent, setAgent] = useState<Agent | null>(null);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAgentData = async () => {
      try {
        const [agentResponse, conversationsResponse] = await Promise.all([
          fetch(`/api/agents/${params.id}`),
          fetch(`/api/agents/${params.id}/conversations`),
        ]);

        if (!agentResponse.ok || !conversationsResponse.ok) {
          throw new Error("Failed to fetch agent data");
        }

        const [agentData, conversationsData] = await Promise.all([
          agentResponse.json(),
          conversationsResponse.json(),
        ]);

        setAgent(agentData);
        setConversations(conversationsData);
      } catch (error) {
        setError("Failed to load agent data. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    if (session) {
      fetchAgentData();
    }
  }, [session, params.id]);

  const handleStatusToggle = async () => {
    if (!agent) return;

    try {
      const response = await fetch(`/api/agents/${params.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          status: agent.status === "active" ? "inactive" : "active",
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to update agent status");
      }

      const updatedAgent = await response.json();
      setAgent(updatedAgent);
    } catch (error) {
      setError("Failed to update agent status. Please try again.");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (!agent) {
    return (
      <div className="min-h-screen bg-gray-100">
        <main className="py-10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-900">
                Agent not found
              </h2>
              <p className="mt-2 text-gray-600">
                The agent you're looking for doesn't exist or you don't have
                permission to view it.
              </p>
              <div className="mt-6">
                <Link
                  href="/dashboard"
                  className="text-indigo-600 hover:text-indigo-500"
                >
                  Return to Dashboard
                </Link>
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <main className="py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="md:flex md:items-center md:justify-between">
            <div className="flex-1 min-w-0">
              <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">
                {agent.name}
              </h2>
            </div>
            <div className="mt-4 flex md:mt-0 md:ml-4 space-x-3">
              <button
                onClick={handleStatusToggle}
                className={`inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${
                  agent.status === "active"
                    ? "bg-red-600 hover:bg-red-700"
                    : "bg-green-600 hover:bg-green-700"
                } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500`}
              >
                {agent.status === "active" ? "Deactivate" : "Activate"}
              </button>
              <Link
                href="/dashboard"
                className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Back to Dashboard
              </Link>
            </div>
          </div>

          {error && (
            <div className="mt-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}

          <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
            <div className="bg-white shadow sm:rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <h3 className="text-lg leading-6 font-medium text-gray-900">
                  Agent Details
                </h3>
                <div className="mt-5 border-t border-gray-200">
                  <dl className="divide-y divide-gray-200">
                    <div className="py-4 sm:grid sm:grid-cols-3 sm:gap-4">
                      <dt className="text-sm font-medium text-gray-500">
                        Description
                      </dt>
                      <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                        {agent.description}
                      </dd>
                    </div>
                    <div className="py-4 sm:grid sm:grid-cols-3 sm:gap-4">
                      <dt className="text-sm font-medium text-gray-500">
                        Voice Model
                      </dt>
                      <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                        {agent.voiceModel}
                      </dd>
                    </div>
                    <div className="py-4 sm:grid sm:grid-cols-3 sm:gap-4">
                      <dt className="text-sm font-medium text-gray-500">
                        Language
                      </dt>
                      <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                        {agent.language}
                      </dd>
                    </div>
                    <div className="py-4 sm:grid sm:grid-cols-3 sm:gap-4">
                      <dt className="text-sm font-medium text-gray-500">
                        Status
                      </dt>
                      <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            agent.status === "active"
                              ? "bg-green-100 text-green-800"
                              : "bg-gray-100 text-gray-800"
                          }`}
                        >
                          {agent.status}
                        </span>
                      </dd>
                    </div>
                  </dl>
                </div>
              </div>
            </div>

            <div className="bg-white shadow sm:rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <h3 className="text-lg leading-6 font-medium text-gray-900">
                  Recent Conversations
                </h3>
                <div className="mt-5">
                  {conversations.length === 0 ? (
                    <p className="text-sm text-gray-500">
                      No conversations yet. Start a conversation to see it here.
                    </p>
                  ) : (
                    <ul className="divide-y divide-gray-200">
                      {conversations.map((conversation) => (
                        <li
                          key={conversation.id}
                          className="py-4 flex justify-between items-center"
                        >
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 truncate">
                              {new Date(
                                conversation.createdAt
                              ).toLocaleString()}
                            </p>
                            <p className="text-sm text-gray-500">
                              Duration: {Math.round(conversation.duration / 60)}
                              m
                            </p>
                          </div>
                          <div className="ml-4 flex-shrink-0">
                            <Link
                              href={`/conversations/${conversation.id}`}
                              className="text-indigo-600 hover:text-indigo-900"
                            >
                              View
                            </Link>
                          </div>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
