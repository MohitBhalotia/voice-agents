"use client";

import { useEffect, useState } from "react";
import { Plus, Phone, Trash2, Edit2, Check, X, Link2 } from "lucide-react";
import { useAuth } from "@/app/contexts/AuthContext";
import { useRouter } from "next/navigation";
// import { number } from "zod";

interface PhoneNumber {
  id: string;
  number: string;
  friendlyName: string;
  createdAt: string;
  updatedAt: string;
  agentId: string | null;
}

interface Agent {
  id: string;
  name: string;
}

export default function PhoneNumbersPage() {
  const [phoneNumbers, setPhoneNumbers] = useState<PhoneNumber[]>([]);
  const [loading, setLoading] = useState(true);
  const [agents, setAgents] = useState<Agent[]>([]);
  const [editingNumber, setEditingNumber] = useState<string | null>(null);
  const [selectedAgentId, setSelectedAgentId] = useState<string | null>(null);
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  const fetchAgents = async () => {
    if (!user?.id) return;

    try {
      const response = await fetch("/api/agents/my-agents", {
        headers: {
          "user-id": user.id,
        },
      });
      const data = await response.json();
      setAgents(data.agents || []);
    } catch (error) {
      console.error(`Failed to fetch agents, ${error}`);
    }
  };

  const fetchPhoneNumbers = async () => {
    if (!user?.id) return;

    try {
      const response = await fetch("/api/user/numbers", {
        headers: {
          user_id: user.id,
        },
      });
      const data = await response.json();
      if (data.phoneNumbers) {
        setPhoneNumbers(data.phoneNumbers);
      }
    } catch (error) {
      console.error(`Failed to fetch phone numbers, ${error}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!authLoading && user?.id) {
      fetchPhoneNumbers();
      fetchAgents();
    }
  }, [authLoading, user?.id,fetchAgents,fetchPhoneNumbers]);

  const handleDelete = async (id: string) => {
    if (!user?.id) return;

    try {
      const response = await fetch(`/api/user/numbers/${id}`, {
        method: "DELETE",
        headers: {
          user_id: user.id,
        },
      });

      if (response.ok) {
        setPhoneNumbers(phoneNumbers.filter((num) => num.id !== id));
      } else {
        console.error("Failed to delete phone number");
      }
    } catch (error) {
      console.error(`Failed to delete phone number, ${error}`);
    }
  };

  const handleEditAgent = (id: string) => {
    setEditingNumber(id);
    const number = phoneNumbers.find((n) => n.id === id);
    setSelectedAgentId(number?.agentId || null);
  };

  const handleSaveAgent = async (id: string) => {
    if (!user?.id) return;

    try {
      const response = await fetch(`/api/user/numbers/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          user_id: user.id,
        },
        body: JSON.stringify({ agentId: selectedAgentId }),
      });

      if (response.ok) {
        setPhoneNumbers(
          phoneNumbers.map((num) =>
            num.id === id ? { ...num, agentId: selectedAgentId } : num
          )
        );
        setEditingNumber(null);
      } else {
        console.error("Failed to update agent");
      }
    } catch (error) {
      console.error(`Failed to update agent, ${error}`);
    }
  };

  const handleCancelEdit = () => {
    setEditingNumber(null);
    setSelectedAgentId(null);
  };

  if (authLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="text-center p-8 bg-white dark:bg-gray-800 rounded-2xl shadow-lg max-w-md">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
            Authentication Required
          </h2>
          <p className="text-gray-600 dark:text-gray-300 mb-6">
            Please sign in to view your phone numbers.
          </p>
          <button
            onClick={() => router.push("/login")}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-medium transition-all duration-200 transform hover:scale-105"
          >
            Sign In
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-10">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
              Phone Numbers
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Manage your virtual phone numbers and their agent assignments
            </p>
          </div>
          <button
            onClick={() => router.push("/phone-numbers/add")}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-medium flex items-center gap-2 transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl"
          >
            <Plus className="h-5 w-5" />
            Add Number
          </button>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-96">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent"></div>
          </div>
        ) : phoneNumbers.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-12">
            <div className="flex flex-col items-center justify-center h-96">
              <div className="bg-blue-50 dark:bg-blue-900/20 p-6 rounded-full mb-6">
                <Phone className="h-16 w-16 text-blue-600 dark:text-blue-400" />
              </div>
              <h3 className="text-2xl font-semibold text-gray-900 dark:text-white mb-3">
                No Phone Numbers Yet
              </h3>
              <p className="text-gray-600 dark:text-gray-400 text-center mb-8 max-w-md">
                Get started by adding your first virtual phone number. You can
                then assign it to an agent for handling calls.
              </p>
              <button
                onClick={() => router.push("/phone-numbers/add")}
                className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-xl font-medium transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl"
              >
                Add Your First Number
              </button>
            </div>
          </div>
        ) : (
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {phoneNumbers.map((phone) => (
              <div
                key={phone.id}
                className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-200 transform hover:-translate-y-1"
              >
                <div className="p-6">
                  <div className="flex justify-between items-start mb-6">
                    <div className="flex items-center gap-3">
                      <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-xl">
                        <Phone className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                      </div>
                      <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                        {phone.friendlyName}
                      </h3>
                    </div>

                    <button
                      onClick={() => handleDelete(phone.id)}
                      className="text-gray-400 hover:text-red-500 p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                    >
                      <Trash2 className="h-5 w-5" />
                    </button>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                    {phone.number}
                  </p>
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                      <span className="font-medium">Added:</span>
                      {new Date(phone.createdAt).toLocaleDateString()}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                      <span className="font-medium">Updated:</span>
                      {new Date(phone.updatedAt).toLocaleDateString()}
                    </div>

                    {editingNumber === phone.id ? (
                      <div className="mt-4 space-y-3">
                        <select
                          value={selectedAgentId || ""}
                          onChange={(e) => setSelectedAgentId(e.target.value)}
                          className="w-full text-sm border border-gray-300 dark:border-gray-600 rounded-xl px-4 py-2.5 bg-white dark:bg-gray-800 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                          <option value="">Select an agent</option>
                          {agents.map((agent) => (
                            <option key={agent.id} value={agent.id}>
                              {agent.name}
                            </option>
                          ))}
                        </select>
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleSaveAgent(phone.id)}
                            className="flex-1 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            disabled={!selectedAgentId}
                          >
                            <Check className="h-5 w-5 mx-auto" />
                          </button>
                          <button
                            onClick={handleCancelEdit}
                            className="flex-1 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 px-4 py-2 rounded-xl transition-colors"
                          >
                            <X className="h-5 w-5 mx-auto" />
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="mt-4 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Link2 className="h-4 w-4 text-gray-400" />
                          <span className="text-sm text-gray-600 dark:text-gray-400">
                            {phone.agentId
                              ? `Linked to: ${
                                  agents.find((a) => a.id === phone.agentId)
                                    ?.name
                                }`
                              : "No agent linked"}
                          </span>
                        </div>
                        <button
                          onClick={() => handleEditAgent(phone.id)}
                          className="text-blue-600 hover:text-blue-700 p-2 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
                        >
                          <Edit2 className="h-4 w-4" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
