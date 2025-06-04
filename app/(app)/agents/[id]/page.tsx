"use client";

import { useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { motion } from "framer-motion";
import { toast } from "react-hot-toast";
import { useAuth } from "@/app/contexts/AuthContext";

const TABS = ["Agent", "Voice", "Analysis", "Security", "Advanced", "Widget"];

const initialForm = {
  agent_language: "EN",
  firstMessage: "Hello, how can I help you?",
  systemPrompt:
    "You are a helpful voice assistant created by Deepgram. Your responses should be friendly, human-like, and conversational. Always keep your answers concise, limited to 1-2 sentences and no more than 120 characters.When responding to a user's message, follow these guidelines:- If the user's message is empty, respond with an empty message.- Ask follow-up questions to engage the user, but only one question at a time.- Keep your responses unique and avoid repetition.- If a question is unclear or ambiguous, ask for clarification before answering.- If asked about your well-being, provide a brief response about how you're feeling.Remember that you have a voice interface. You can listen and speak, and all your responses will be spoken aloud.",
  llmModel: "OPENAI_GPT_4O_MINI",
  temperature: 0.7,
  tokenLimit: 4096,
  use_rag: false,
  voiceId: "",
  use_flash_call: false,
  tts_output_format: "mp3",
  optimize_streaming_latency: false,
  voice_stability: 0.5,
  voice_speed: 1,
  voice_similarity_boost: 0.5,
  fetch_initiation_webhook_url: "",
  post_call_webhook_url: "",
  concurrent_calls_limit: 1,
  daily_calls_limit: 10,
  turn_timeout_seconds: 30,
  silence_end_call_timeout_seconds: 10,
  max_conversation_duration_seconds: 600,
  user_input_audio_format: "mp3",
  store_call_audio: true,
  zero_pii_retention: false,
  conversation_retention_days: 30,
  enable_auth_for_agent_api: false,
};

export default function AgentConfigPage() {
  const router = useRouter();
  const params = useParams();
  const [tab, setTab] = useState(0);
  const [form, setForm] = useState(initialForm);
  const [loading, setLoading] = useState(false);
  const { user, loading: authLoading, error } = useAuth();
  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value, type } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]:
        type === "checkbox" && e.target instanceof HTMLInputElement
          ? e.target.checked
          : value,
    }));
  };

  const handleSlider = (name: string, value: number) => {
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    try {
      const userId = user?.id;
      const agentId = params.id as string;

      const payload = {
        ...form,
        userId,
        agentId,
      };

      const res = await fetch(`/api/agents/${agentId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok)
        throw new Error(data.error || "Failed to save configuration");

      toast.success("Agent configuration saved!");
      router.push("/agents/my-agents");
    } catch (err) {
      console.log(err);

      toast.error( "Error saving configuration");
    } finally {
      setLoading(false);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white mb-4">Loading...</h1>
        </div>
      </div>
    );
  }

  if (!authLoading && !user) {
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

  function renderAgentTab() {
    return (
      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">
            Agent Language
          </label>
          <select
            name="agent_language"
            value={form.agent_language}
            onChange={handleChange}
            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
          >
            <option value="EN">English</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">
            First Message
          </label>
          <input
            name="firstMessage"
            value={form.firstMessage}
            onChange={handleChange}
            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
            placeholder="e.g. Hello, how can I help you today?"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">
            System Prompt
          </label>
          <textarea
            name="systemPrompt"
            value={form.systemPrompt}
            onChange={handleChange}
            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
            placeholder="Describe the agent's persona and context"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">
            LLM Model
          </label>
          <select
            name="llmModel"
            value={form.llmModel}
            onChange={handleChange}
            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
          >
            <option value="OPENAI_GPT_4O_MINI">OpenAI GPT-4o Mini</option>
            <option value="OPENAI_GPT_3_5_TURBO">OpenAI GPT-3.5 Turbo</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">
            Temperature ({form.temperature})
          </label>
          <input
            type="range"
            min={0}
            max={1}
            step={0.01}
            name="temperature"
            value={form.temperature}
            onChange={(e) =>
              handleSlider("temperature", parseFloat(e.target.value))
            }
            className="w-full"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">
            Token Limit
          </label>
          <input
            type="number"
            name="tokenLimit"
            value={form.tokenLimit}
            onChange={handleChange}
            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
            min={1}
            required
          />
        </div>
        <div className="flex items-center">
          <input
            type="checkbox"
            name="use_rag"
            checked={form.use_rag}
            onChange={handleChange}
            className="mr-2"
          />
          <label className="text-sm text-gray-300">
            Use RAG (Retrieval Augmented Generation)
          </label>
        </div>
      </div>
    );
  }

  function renderVoiceTab() {
    return (
      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">
            Voice ID
          </label>
          <input
            name="voiceId"
            value={form.voiceId}
            onChange={handleChange}
            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
            required
          />
        </div>
        <div className="flex items-center">
          <input
            type="checkbox"
            name="use_flash_call"
            checked={form.use_flash_call}
            onChange={handleChange}
            className="mr-2"
          />
          <label className="text-sm text-gray-300">Use Flash Call</label>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">
            TTS Output Format
          </label>
          <select
            name="tts_output_format"
            value={form.tts_output_format}
            onChange={handleChange}
            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
          >
            <option value="mp3">MP3</option>
            <option value="wav">WAV</option>
          </select>
        </div>
        <div className="flex items-center">
          <input
            type="checkbox"
            name="optimize_streaming_latency"
            checked={form.optimize_streaming_latency}
            onChange={handleChange}
            className="mr-2"
          />
          <label className="text-sm text-gray-300">
            Optimize Streaming Latency
          </label>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">
            Voice Stability ({form.voice_stability})
          </label>
          <input
            type="range"
            min={0}
            max={1}
            step={0.01}
            name="voice_stability"
            value={form.voice_stability}
            onChange={(e) =>
              handleSlider("voice_stability", parseFloat(e.target.value))
            }
            className="w-full"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">
            Voice Speed ({form.voice_speed})
          </label>
          <input
            type="range"
            min={0.5}
            max={2}
            step={0.01}
            name="voice_speed"
            value={form.voice_speed}
            onChange={(e) =>
              handleSlider("voice_speed", parseFloat(e.target.value))
            }
            className="w-full"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">
            Voice Similarity Boost ({form.voice_similarity_boost})
          </label>
          <input
            type="range"
            min={0}
            max={1}
            step={0.01}
            name="voice_similarity_boost"
            value={form.voice_similarity_boost}
            onChange={(e) =>
              handleSlider("voice_similarity_boost", parseFloat(e.target.value))
            }
            className="w-full"
          />
        </div>
      </div>
    );
  }

  function renderAnalysisTab() {
    return (
      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">
            Fetch Initiation Webhook URL
          </label>
          <input
            name="fetch_initiation_webhook_url"
            value={form.fetch_initiation_webhook_url}
            onChange={handleChange}
            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
            type="url"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">
            Post Call Webhook URL
          </label>
          <input
            name="post_call_webhook_url"
            value={form.post_call_webhook_url}
            onChange={handleChange}
            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
            type="url"
            required
          />
        </div>
      </div>
    );
  }

  function renderSecurityTab() {
    return (
      <div className="space-y-6">
        <div className="flex items-center">
          <input
            type="checkbox"
            name="enable_auth_for_agent_api"
            checked={form.enable_auth_for_agent_api}
            onChange={handleChange}
            className="mr-2"
          />
          <label className="text-sm text-gray-300">
            Enable Auth for Agent API
          </label>
        </div>
        <div className="flex items-center">
          <input
            type="checkbox"
            name="zero_pii_retention"
            checked={form.zero_pii_retention}
            onChange={handleChange}
            className="mr-2"
          />
          <label className="text-sm text-gray-300">Zero PII Retention</label>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">
            Conversation Retention Days
          </label>
          <input
            type="number"
            name="conversation_retention_days"
            value={form.conversation_retention_days}
            onChange={handleChange}
            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
            min={1}
            required
          />
        </div>
      </div>
    );
  }

  function renderAdvancedTab() {
    return (
      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">
            Concurrent Calls Limit
          </label>
          <input
            type="number"
            name="concurrent_calls_limit"
            value={form.concurrent_calls_limit}
            onChange={handleChange}
            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
            min={1}
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">
            Daily Calls Limit
          </label>
          <input
            type="number"
            name="daily_calls_limit"
            value={form.daily_calls_limit}
            onChange={handleChange}
            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
            min={1}
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">
            Turn Timeout (seconds)
          </label>
          <input
            type="number"
            name="turn_timeout_seconds"
            value={form.turn_timeout_seconds}
            onChange={handleChange}
            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
            min={1}
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">
            Silence End Call Timeout (seconds)
          </label>
          <input
            type="number"
            name="silence_end_call_timeout_seconds"
            value={form.silence_end_call_timeout_seconds}
            onChange={handleChange}
            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
            min={1}
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">
            Max Conversation Duration (seconds)
          </label>
          <input
            type="number"
            name="max_conversation_duration_seconds"
            value={form.max_conversation_duration_seconds}
            onChange={handleChange}
            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
            min={1}
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">
            User Input Audio Format
          </label>
          <input
            name="user_input_audio_format"
            value={form.user_input_audio_format}
            onChange={handleChange}
            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
            required
          />
        </div>
        <div className="flex items-center">
          <input
            type="checkbox"
            name="store_call_audio"
            checked={form.store_call_audio}
            onChange={handleChange}
            className="mr-2"
          />
          <label className="text-sm text-gray-300">Store Call Audio</label>
        </div>
      </div>
    );
  }

  function renderWidgetTab() {
    return (
      <div className="text-gray-400 text-center py-10">
        <p>Widget configuration coming soon...</p>
      </div>
    );
  }

  const renderTab = () => {
    switch (tab) {
      case 0:
        return renderAgentTab();
      case 1:
        return renderVoiceTab();
      case 2:
        return renderAnalysisTab();
      case 3:
        return renderSecurityTab();
      case 4:
        return renderAdvancedTab();
      case 5:
        return renderWidgetTab();
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 py-8 px-4 sm:px-6 lg:px-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-2xl mx-auto"
      >
        <div className="bg-gray-800 rounded-xl shadow-lg p-6">
          <div className="mb-8">
            <nav className="flex space-x-2">
              {TABS.map((t, i) => (
                <button
                  key={t}
                  onClick={() => setTab(i)}
                  className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
                    tab === i
                      ? "bg-blue-600 text-white shadow"
                      : "bg-gray-700 text-gray-300 hover:bg-gray-600"
                  }`}
                >
                  {t}
                </button>
              ))}
            </nav>
          </div>
          <form onSubmit={handleSubmit} className="space-y-8">
            {renderTab()}
            <div className="flex justify-between mt-8">
              <button
                type="button"
                onClick={() => setTab((prev) => Math.max(0, prev - 1))}
                disabled={tab === 0}
                className="px-4 py-2 rounded-lg bg-gray-700 text-gray-300 hover:bg-gray-600 transition disabled:opacity-50"
              >
                Previous
              </button>
              {tab < TABS.length - 1 ? (
                <button
                  type="button"
                  onClick={() =>
                    setTab((prev) => Math.min(TABS.length - 1, prev + 1))
                  }
                  className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition"
                >
                  Next
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={loading}
                  className="px-6 py-2 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700 transition disabled:opacity-50"
                >
                  {loading ? "Saving..." : "Save Configuration"}
                </button>
              )}
            </div>
          </form>
        </div>
      </motion.div>
    </div>
  );
}
