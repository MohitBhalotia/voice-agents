"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "react-hot-toast";

interface FormData {
  name: string;
  description: string;
  voiceModel: string;
  language: string;
}

interface FormErrors {
  name?: string;
  description?: string;
  voiceModel?: string;
  language?: string;
}

const VOICE_MODELS = [
  {
    id: "en-US-Neural2-A",
    label: "Female (US)",
    preview: "Hello, I'm your AI assistant.",
  },
  {
    id: "en-US-Neural2-C",
    label: "Male (US)",
    preview: "Hi there, how can I help you today?",
  },
  {
    id: "en-GB-Neural2-A",
    label: "Female (UK)",
    preview: "Greetings, I'm here to assist you.",
  },
  {
    id: "en-GB-Neural2-B",
    label: "Male (UK)",
    preview: "Good day! How may I be of service?",
  },
];

const LANGUAGES = [
  { code: "en-US", label: "English (US)", flag: "🇺🇸" },
  { code: "en-GB", label: "English (UK)", flag: "🇬🇧" },
  { code: "es-ES", label: "Spanish", flag: "🇪🇸" },
  { code: "fr-FR", label: "French", flag: "🇫🇷" },
  { code: "de-DE", label: "German", flag: "🇩🇪" },
];

export default function NewAgentPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    name: "",
    description: "",
    voiceModel: "",
    language: "",
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [previewVoice, setPreviewVoice] = useState(false);
  const [activeStep, setActiveStep] = useState(1);

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = "Name is required";
    } else if (formData.name.length < 3) {
      newErrors.name = "Name must be at least 3 characters";
    }

    if (!formData.description.trim()) {
      newErrors.description = "Description is required";
    } else if (formData.description.length < 10) {
      newErrors.description = "Description must be at least 10 characters";
    }

    // if (!formData.voiceModel) {
    //   newErrors.voiceModel = "Voice model is required";
    // }

    // if (!formData.language) {
    //   newErrors.language = "Language is required";
    // }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear error when user starts typing
    if (errors[name as keyof FormErrors]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error("Please fix the errors in the form");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("/api/agents", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || "Failed to create agent");
      }

      const data = await response.json();
      toast.success("Agent created successfully!");
      router.push(`/agents/${data.id}`);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to create agent"
      );
    } finally {
      setLoading(false);
    }
  };

  const playVoicePreview = () => {
    setPreviewVoice(true);
    // Add voice preview logic here
    TODO: setTimeout(() => setPreviewVoice(false), 2000);
  };

  const nextStep = () => {
    if (validateForm()) {
      setActiveStep(2);
    }
  };

  const prevStep = () => {
    setActiveStep(1);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <main className="py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="md:flex md:items-center md:justify-between"
          >
            <div className="flex-1 min-w-0">
              <h2 className="text-3xl font-bold leading-7 text-gray-900 sm:text-4xl">
                Create New Agent
              </h2>
              <p className="mt-2 text-sm text-gray-600">
                Configure your AI voice agent with personalized settings
              </p>
            </div>
            <div className="mt-4 flex md:mt-0 md:ml-4">
              <Link
                href="/dashboard"
                className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors duration-200"
              >
                Cancel
              </Link>
            </div>
          </motion.div>

          <div className="mt-8">
            <div className="md:grid md:grid-cols-3 md:gap-8">
              <div className="md:col-span-1">
                <div className="px-4 sm:px-0">
                  <h3 className="text-lg font-medium leading-6 text-gray-900">
                    Agent Details
                  </h3>
                  <p className="mt-1 text-sm text-gray-600">
                    Configure your voice agent with a name, description, and
                    voice settings. These settings can be modified later.
                  </p>
                </div>
              </div>

              <div className="mt-5 md:mt-0 md:col-span-2">
                <form onSubmit={handleSubmit}>
                  <div className="shadow-lg rounded-lg overflow-hidden">
                    <div className="px-4 py-5 bg-white space-y-6 sm:p-6">
                      <div className="mb-8">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center">
                            <div
                              className={`flex items-center justify-center w-8 h-8 rounded-full ${
                                activeStep >= 1
                                  ? "bg-indigo-600 text-white"
                                  : "bg-gray-200 text-gray-600"
                              }`}
                            >
                              1
                            </div>
                            <div className="ml-3">
                              <span className="text-sm font-medium text-gray-900">
                                Basic Information
                              </span>
                            </div>
                          </div>
                          <div className="flex items-center">
                            <div
                              className={`flex items-center justify-center w-8 h-8 rounded-full ${
                                activeStep >= 2
                                  ? "bg-indigo-600 text-white"
                                  : "bg-gray-200 text-gray-600"
                              }`}
                            >
                              2
                            </div>
                            <div className="ml-3">
                              <span className="text-sm font-medium text-gray-900">
                                Voice Settings
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>

                      <AnimatePresence mode="wait">
                        {activeStep === 1 ? (
                          <motion.div
                            key="step1"
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 20 }}
                            transition={{ duration: 0.2 }}
                            className="space-y-6"
                          >
                            <div>
                              <label
                                htmlFor="name"
                                className="block text-sm font-medium text-gray-700"
                              >
                                Name
                              </label>
                              <div className="mt-1 relative rounded-md shadow-sm">
                                <input
                                  type="text"
                                  name="name"
                                  id="name"
                                  required
                                  value={formData.name}
                                  onChange={handleInputChange}
                                  className={`block w-full sm:text-sm rounded-md transition-colors duration-200 text-gray-900 ${
                                    errors.name
                                      ? "border-red-300 text-red-900 placeholder-red-300 focus:ring-red-500 focus:border-red-500"
                                      : "border-gray-600 focus:ring-indigo-500 focus:border-indigo-500 p-4"
                                  }`}
                                  placeholder="My Voice Agent"
                                />
                              </div>
                              {errors.name && (
                                <p className="mt-2 text-sm text-red-600">
                                  {errors.name}
                                </p>
                              )}
                              <p className="mt-2 text-sm text-gray-500">
                                Choose a memorable name for your agent
                              </p>
                            </div>

                            <div>
                              <label
                                htmlFor="description"
                                className="block text-sm font-medium text-gray-700"
                              >
                                Description
                              </label>
                              <div className="mt-1">
                                <textarea
                                  id="description"
                                  name="description"
                                  rows={3}
                                  required
                                  value={formData.description}
                                  onChange={handleInputChange}
                                  className={`block w-full sm:text-sm rounded-md transition-colors duration-200 text-gray-900 p-5 ${
                                    errors.description
                                      ? "border-red-300 text-red-900 placeholder-red-300 focus:ring-red-500 focus:border-red-500"
                                      : "border-gray-300 focus:ring-indigo-500 focus:border-indigo-500"
                                  }`}
                                  placeholder="A brief description of your agent's purpose and capabilities"
                                />
                              </div>
                              {errors.description && (
                                <p className="mt-2 text-sm text-red-600">
                                  {errors.description}
                                </p>
                              )}
                              <p className="mt-2 text-sm text-gray-500">
                                Describe what your agent does and how it can
                                help users
                              </p>
                            </div>

                            <div className="flex justify-end">
                              <button
                                type="button"
                                onClick={nextStep}
                                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors duration-200"
                              >
                                Next Step
                                <svg
                                  className="ml-2 -mr-1 h-4 w-4"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth="2"
                                    d="M9 5l7 7-7 7"
                                  />
                                </svg>
                              </button>
                            </div>
                          </motion.div>
                        ) : (
                          <motion.div
                            key="step2"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            transition={{ duration: 0.2 }}
                            className="space-y-6"
                          >
                            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                              <div>
                                <label
                                  htmlFor="voiceModel"
                                  className="block text-sm font-medium text-gray-700"
                                >
                                  Voice Model
                                </label>
                                <div className="mt-1">
                                  <select
                                    id="voiceModel"
                                    name="voiceModel"
                                    required
                                    value={formData.voiceModel}
                                    onChange={handleInputChange}
                                    className={`block w-full sm:text-sm rounded-md transition-colors duration-200 text-gray-900 border-1 border-gray-600 ${
                                      errors.voiceModel
                                        ? "border-red-300 text-red-900 placeholder-red-300 focus:ring-red-500 focus:border-red-500"
                                        : "border-gray-300 focus:ring-indigo-500 focus:border-indigo-500"
                                    }`}
                                  >
                                    <option value="">
                                      Select a voice model
                                    </option>
                                    {VOICE_MODELS.map((model) => (
                                      <option key={model.id} value={model.id}>
                                        {model.label}
                                      </option>
                                    ))}
                                  </select>
                                </div>
                                {errors.voiceModel && (
                                  <p className="mt-2 text-sm text-red-600">
                                    {errors.voiceModel}
                                  </p>
                                )}
                                {formData.voiceModel && (
                                  <div className="mt-2">
                                    <button
                                      type="button"
                                      onClick={playVoicePreview}
                                      className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-indigo-700 bg-indigo-100 hover:bg-indigo-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors duration-200"
                                    >
                                      {previewVoice ? (
                                        <>
                                          <svg
                                            className="animate-spin -ml-1 mr-2 h-4 w-4 text-indigo-700"
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
                                          Playing...
                                        </>
                                      ) : (
                                        <>
                                          <svg
                                            className="-ml-1 mr-2 h-4 w-4"
                                            fill="none"
                                            stroke="currentColor"
                                            viewBox="0 0 24 24"
                                          >
                                            <path
                                              strokeLinecap="round"
                                              strokeLinejoin="round"
                                              strokeWidth="2"
                                              d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"
                                            />
                                            <path
                                              strokeLinecap="round"
                                              strokeLinejoin="round"
                                              strokeWidth="2"
                                              d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                                            />
                                          </svg>
                                          Preview Voice
                                        </>
                                      )}
                                    </button>
                                    <p className="mt-1 text-xs text-gray-500">
                                      {VOICE_MODELS.find(
                                        (m) => m.id === formData.voiceModel
                                      )?.preview || ""}
                                    </p>
                                  </div>
                                )}
                              </div>

                              <div>
                                <label
                                  htmlFor="language"
                                  className="block text-sm font-medium text-gray-700"
                                >
                                  Language
                                </label>
                                <div className="mt-1">
                                  <select
                                    id="language"
                                    name="language"
                                    required
                                    value={formData.language}
                                    onChange={handleInputChange}
                                    className={`block w-full sm:text-sm rounded-md transition-colors duration-200 text-gray-900 border-1 border-gray-600${
                                      errors.language
                                        ? "border-red-300 text-red-900 placeholder-red-300 focus:ring-red-500 focus:border-red-500"
                                        : "border-gray-300 focus:ring-indigo-500 focus:border-indigo-500"
                                    }`}
                                  >
                                    <option value="">Select a language</option>
                                    {LANGUAGES.map((lang) => (
                                      <option key={lang.code} value={lang.code}>
                                        {lang.flag} {lang.label}
                                      </option>
                                    ))}
                                  </select>
                                </div>
                                {errors.language && (
                                  <p className="mt-2 text-sm text-red-600">
                                    {errors.language}
                                  </p>
                                )}
                                <p className="mt-2 text-sm text-gray-500">
                                  Choose the primary language for your agent
                                </p>
                              </div>
                            </div>

                            <div className="flex justify-between">
                              <button
                                type="button"
                                onClick={prevStep}
                                className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors duration-200"
                              >
                                <svg
                                  className="-ml-1 mr-2 h-4 w-4"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth="2"
                                    d="M15 19l-7-7 7-7"
                                  />
                                </svg>
                                Previous Step
                              </button>
                              <button
                                type="submit"
                                disabled={loading}
                                className="inline-flex justify-center py-2 px-6 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 transition-colors duration-200"
                              >
                                {loading ? (
                                  <>
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
                                  </>
                                ) : (
                                  "Create Agent"
                                )}
                              </button>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
