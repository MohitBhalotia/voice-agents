"use client";

import { useState, useEffect, useContext } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Upload, Link as LinkIcon, Bot } from "lucide-react";
import { source_type } from "@prisma/client";
import { useAuth } from "@/app/contexts/AuthContext";

interface Agent {
  id: string;
  name: string;
}

export default function AddKnowledgeBasePage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [sourceType, setSourceType] = useState<source_type>(source_type.PDF);
  const [url, setUrl] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [agents, setAgents] = useState<Agent[]>([]);
  const [selectedAgentId, setSelectedAgentId] = useState<string>("");
  const [isDragging, setIsDragging] = useState(false);
  const { user, loading: authLoading } = useAuth();

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
    }
  }, [authLoading, user, router]);
  useEffect(() => {
    if (user) {
      fetchAgents();
    }
  }, [user]);

  const fetchAgents = async () => {
    try {
      const response = await fetch("/api/agents/my-agents", {
        headers: {
          "user-id": user?.id as string,
        },
      });

      if (!response.ok) throw new Error("Failed to fetch agents");
      const data = await response.json();
      console.log(data);

      setAgents(data.agents);
    //   if (data.agents.length > 0) {
    //     setSelectedAgentId(data.agents[0].id);
    //   }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch agents");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAgentId) {
      setError("Please select an agent");
      return;
    }
    setIsUploading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append("name", name);
      formData.append("sourceType", sourceType);
      formData.append("agentId", selectedAgentId);

      if (sourceType === source_type.URL) {
        formData.append("url", url);
      } else if (file) {
        formData.append("file", file);
      }

      const response = await fetch("/api/knowledge-base", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to upload knowledge source");
      }

      router.push("/knowledge-base");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to upload knowledge source"
      );
    } finally {
      setIsUploading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      if (!name) {
        setName(selectedFile.name.replace(/\.[^/.]+$/, ""));
      }
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) {
      setFile(droppedFile);
      if (!name) {
        setName(droppedFile.name.replace(/\.[^/.]+$/, ""));
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100">
      <div className="container mx-auto px-4 py-8">
        <button
          onClick={() => router.back()}
          className="flex items-center text-gray-400 hover:text-white mb-8 transition-colors"
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          Back to Knowledge Base
        </button>

        <div className="max-w-2xl mx-auto">
          <h1 className="text-3xl font-bold text-white mb-2">
            Add Knowledge Source
          </h1>
          <p className="text-gray-400 mb-8">
            Upload a document or provide a URL to add to your knowledge base
          </p>

          {error && (
            <div className="bg-red-900/50 border border-red-700/50 text-red-300 px-6 py-4 rounded-lg mb-6">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label
                htmlFor="agent"
                className="block text-sm font-medium text-gray-300 mb-1"
              >
                Agent
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Bot className="h-5 w-5 text-gray-400" />
                </div>
                <select
                  id="agent"
                  value={selectedAgentId}
                  onChange={(e) => setSelectedAgentId(e.target.value)}
                  className="w-full pl-10 px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-100"
                  required
                >
                  <option value="">Select an agent</option>
                  {agents.map((agent) => (
                    <option key={agent.id} value={agent.id}>
                      {agent.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label
                htmlFor="name"
                className="block text-sm font-medium text-gray-300 mb-1"
              >
                Name
              </label>
              <input
                type="text"
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-100"
                required
              />
            </div>

            <div>
              <label
                htmlFor="sourceType"
                className="block text-sm font-medium text-gray-300 mb-1"
              >
                Source Type
              </label>
              <select
                id="sourceType"
                value={sourceType}
                onChange={(e) => setSourceType(e.target.value as source_type)}
                className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-100"
              >
                <option value={source_type.PDF}>PDF Document</option>
                <option value={source_type.TXT}>Text File</option>
                <option value={source_type.CSV}>CSV File</option>
                <option value={source_type.DOCX}>Word Document</option>
                <option value={source_type.URL}>URL</option>
              </select>
            </div>

            {sourceType === source_type.URL ? (
              <div>
                <label
                  htmlFor="url"
                  className="block text-sm font-medium text-gray-300 mb-1"
                >
                  URL
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <LinkIcon className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="url"
                    id="url"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    className="w-full pl-10 px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-100"
                    required
                    placeholder="https://example.com/document.pdf"
                  />
                </div>
              </div>
            ) : (
              <div>
                <label
                  htmlFor="file"
                  className="block text-sm font-medium text-gray-300 mb-1"
                >
                  File
                </label>
                <div
                  className={`mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-dashed rounded-lg transition-colors ${
                    isDragging
                      ? "border-blue-500 bg-blue-900/20"
                      : "border-gray-700 hover:border-gray-600"
                  }`}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                >
                  <div className="space-y-1 text-center">
                    <Upload className="mx-auto h-12 w-12 text-gray-400" />
                    <div className="flex text-sm text-gray-400">
                      <label
                        htmlFor="file-upload"
                        className="relative cursor-pointer rounded-md font-medium text-blue-400 hover:text-blue-300 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500"
                      >
                        <span>Upload a file</span>
                        <input
                          id="file-upload"
                          name="file-upload"
                          type="file"
                          className="sr-only"
                          onChange={handleFileChange}
                          accept=".pdf,.txt,.csv,.docx"
                          required
                        />
                      </label>
                      <p className="pl-1">or drag and drop</p>
                    </div>
                    <p className="text-xs text-gray-500">
                      {sourceType === source_type.PDF && "PDF up to 10MB"}
                      {sourceType === source_type.TXT && "TXT up to 10MB"}
                      {sourceType === source_type.CSV && "CSV up to 10MB"}
                      {sourceType === source_type.DOCX && "DOCX up to 10MB"}
                    </p>
                  </div>
                </div>
                {file && (
                  <p className="mt-2 text-sm text-gray-400">
                    Selected file: {file.name}
                  </p>
                )}
              </div>
            )}

            <div className="flex justify-end space-x-4">
              <button
                type="button"
                onClick={() => router.back()}
                className="px-4 py-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isUploading}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isUploading ? "Uploading..." : "Upload"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
