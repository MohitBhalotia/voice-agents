"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { toast } from "react-hot-toast";
import { useAuth } from "@/app/contexts/AuthContext";

export default function NewAgentPage() {
  const router = useRouter();
  const { user, loading, error } = useAuth();

  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    agentName: "",
    is_active: true,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      toast.error("Please login to create an agent");
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch("/api/agents/create-agent", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          agentName: formData.agentName,
          userId: user.id,
          is_active: formData.is_active,
        }),
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || "Failed to create agent");
      }

      toast.success("Agent created successfully!");
      router.push(data.redirectUrl);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Something went wrong"
      );
    } finally {
      setIsLoading(false);
    }
  };
  if(loading){
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white mb-4">Loading...</h1>
        </div>
      </div>
    );
  }
  if (!loading && !user) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white mb-4">
            Please login to continue
          </h1>
          {error && <p className="text-red-500 mb-4">Error: {error}</p>}
          <button
            onClick={() => router.push("/login")}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 py-8 px-4 sm:px-6 lg:px-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-xl mx-auto"
      >
        <div className="bg-gray-800 rounded-xl shadow-lg p-6">
          <div className="text-center mb-6">
            <h1 className="text-2xl font-bold text-white mb-1">
              Create New Agent
            </h1>
            <p className="text-gray-400 text-sm">
              Give your AI agent a name to get started
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label
                htmlFor="agentName"
                className="block text-sm font-medium text-gray-300 mb-1"
              >
                Agent Name
              </label>
              <input
                type="text"
                id="agentName"
                value={formData.agentName}
                onChange={(e) =>
                  setFormData({ ...formData, agentName: e.target.value })
                }
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                placeholder="Enter agent name"
                minLength={2}
                required
              />
              <p className="mt-1 text-xs text-gray-400">
                Minimum 2 characters required
              </p>
            </div>

            <div className="flex items-center justify-between py-2">
              <label
                htmlFor="is_active"
                className="text-sm font-medium text-gray-300"
              >
                Active Status
              </label>
              <button
                type="button"
                role="switch"
                aria-checked={formData.is_active}
                onClick={() =>
                  setFormData({ ...formData, is_active: !formData.is_active })
                }
                className={`${
                  formData.is_active ? "bg-blue-600" : "bg-gray-600"
                } relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2`}
              >
                <span
                  className={`${
                    formData.is_active ? "translate-x-6" : "translate-x-1"
                  } inline-block h-4 w-4 transform rounded-full bg-white transition-transform`}
                />
              </button>
            </div>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={isLoading}
              className={`w-full py-2 px-4 rounded-lg text-white font-medium transition-all duration-200 ${
                isLoading
                  ? "bg-blue-600 cursor-not-allowed"
                  : "bg-blue-600 hover:bg-blue-700"
              }`}
            >
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <svg
                    className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Creating...
                </div>
              ) : (
                "Create Agent"
              )}
            </motion.button>
          </form>
        </div>
      </motion.div>
    </div>
  );
}
