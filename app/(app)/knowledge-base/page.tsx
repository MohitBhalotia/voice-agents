"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Plus,
  FileText,
  Globe,
  AlertCircle,
  CheckCircle2,
  Clock,
  Trash2,
  ExternalLink,
  Bot,
} from "lucide-react";
import { format } from "date-fns";
import { source_type, status } from "@prisma/client";

interface Agent {
  id: string;
  name: string;
}

interface KnowledgeSource {
  id: string;
  name: string;
  sourceType: source_type;
  originalFileName: string | null;
  storagePath: string;
  status: status;
  uploaded_at: string;
  last_indexed_at: string | null;
  metadata: any | null;
  agent: Agent;
}

const statusColors = {
  [status.PENDING]:
    "bg-yellow-900/50 text-yellow-300 border border-yellow-700/50",
  [status.PROCESSING]: "bg-blue-900/50 text-blue-300 border border-blue-700/50",
  [status.ACTIVE]: "bg-green-900/50 text-green-300 border border-green-700/50",
  [status.ERROR]: "bg-red-900/50 text-red-300 border border-red-700/50",
};

const statusIcons = {
  [status.PENDING]: Clock,
  [status.PROCESSING]: Clock,
  [status.ACTIVE]: CheckCircle2,
  [status.ERROR]: AlertCircle,
};

const sourceTypeIcons = {
  [source_type.PDF]: FileText,
  [source_type.TXT]: FileText,
  [source_type.CSV]: FileText,
  [source_type.DOCX]: FileText,
  [source_type.URL]: Globe,
};

export default function KnowledgeBasePage() {
  const router = useRouter();
  const [knowledgeSources, setKnowledgeSources] = useState<KnowledgeSource[]>(
    []
  );
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedSource, setSelectedSource] = useState<KnowledgeSource | null>(
    null
  );
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  useEffect(() => {
    fetchKnowledgeSources();
  }, []);

  const fetchKnowledgeSources = async () => {
    try {
      const response = await fetch("/api/knowledge-base");
      if (!response.ok) throw new Error("Failed to fetch knowledge sources");
      const data = await response.json();
      console.log(data);
      setKnowledgeSources(data);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to fetch knowledge sources"
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const response = await fetch(`/api/knowledge-base/${id}`, {
        method: "DELETE",
      });
      if (!response.ok) throw new Error("Failed to delete knowledge source");
      setKnowledgeSources((sources) =>
        sources.filter((source) => source.id !== id)
      );
      setIsDeleteModalOpen(false);
      setSelectedSource(null);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to delete knowledge source"
      );
    }
  };

  const getStatusIcon = (status: status) => {
    const Icon = statusIcons[status];
    return <Icon className="w-4 h-4" />;
  };

  const getSourceTypeIcon = (type: source_type) => {
    const Icon = sourceTypeIcons[type];
    return <Icon className="w-5 h-5" />;
  };

  const handleViewFile = (source: KnowledgeSource) => {
    if (source.sourceType === source_type.URL) {
      window.open(source.storagePath, "_blank");
    } else {
      window.open(source.storagePath, "_blank");
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-900">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100">
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white">Knowledge Base</h1>
            <p className="text-gray-400 mt-2">
              Manage your knowledge sources and documents
            </p>
          </div>
          <button
            onClick={() => router.push("/knowledge-base/add")}
            className="flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm hover:shadow-md"
          >
            <Plus className="w-5 h-5 mr-2" />
            Add Knowledge Source
          </button>
        </div>

        {error && (
          <div className="bg-red-900/50 border border-red-700/50 text-red-300 px-6 py-4 rounded-lg mb-6 shadow-sm">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {knowledgeSources.map((source) => (
            <div
              key={source.id}
              className="bg-gray-800 rounded-xl shadow-md border border-gray-700 hover:shadow-lg transition-all duration-200 p-6 hover:border-gray-600"
            >
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center">
                  <div className="p-2 bg-gray-700 rounded-lg">
                    {getSourceTypeIcon(source.sourceType)}
                  </div>
                  <h3 className="text-lg font-semibold text-white ml-3">
                    {source.name}
                  </h3>
                </div>
                <button
                  onClick={() => {
                    setSelectedSource(source);
                    setIsDeleteModalOpen(true);
                  }}
                  className="text-gray-400 hover:text-red-400 transition-colors p-1 hover:bg-red-900/50 rounded-lg"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4">
                <div className="flex items-center text-sm text-gray-300">
                  <span className="font-medium mr-2 min-w-[60px]">Agent:</span>
                  <div className="flex items-center bg-gray-700 px-2 py-1 rounded-md">
                    <Bot className="w-4 h-4 mr-1.5 text-blue-400" />
                    <span>{source.agent?.name || "No Agent Assigned"}</span>
                  </div>
                </div>
                <div className="flex items-center text-sm text-gray-300">
                  <span className="font-medium mr-2 min-w-[60px]">Type:</span>
                  <span className="bg-gray-700 px-2 py-1 rounded-md">
                    {source.sourceType}
                  </span>
                </div>
                <div className="flex items-center text-sm text-gray-300">
                  <span className="font-medium mr-2 min-w-[60px]">File:</span>
                  <span className="truncate">
                    {source.originalFileName || "N/A"}
                  </span>
                </div>
                <div className="flex items-center text-sm text-gray-300">
                  <span className="font-medium mr-2 min-w-[60px]">
                    Uploaded:
                  </span>
                  <span className="bg-gray-700 px-2 py-1 rounded-md">
                    {format(new Date(source.uploaded_at), "MMM d, yyyy")}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span
                    className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-medium ${
                      statusColors[source.status]
                    }`}
                  >
                    {getStatusIcon(source.status)}
                    <span className="ml-1.5">{source.status}</span>
                  </span>
                  <button
                    onClick={() => handleViewFile(source)}
                    className="flex items-center text-sm text-blue-400 hover:text-blue-300 transition-colors"
                  >
                    <ExternalLink className="w-4 h-4 mr-1" />
                    View{" "}
                    {source.sourceType === source_type.URL ? "URL" : "File"}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Delete Confirmation Modal */}
        {isDeleteModalOpen && selectedSource && (
          <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50">
            <div className="bg-gray-800 rounded-xl p-6 max-w-md w-full shadow-xl border border-gray-700">
              <h3 className="text-xl font-semibold text-white mb-4">
                Delete Knowledge Source
              </h3>
              <p className="text-gray-300 mb-6">
                Are you sure you want to delete "{selectedSource.name}"? This
                action cannot be undone.
              </p>
              <div className="flex justify-end space-x-4">
                <button
                  onClick={() => {
                    setIsDeleteModalOpen(false);
                    setSelectedSource(null);
                  }}
                  className="px-4 py-2 text-gray-300 hover:text-white hover:bg-gray-700 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleDelete(selectedSource.id)}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
