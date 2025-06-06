"use client";

import { useEffect, useState } from "react";
import { format } from "date-fns";
import { motion, AnimatePresence } from "framer-motion";
import {
  Phone,
  Clock,
  Calendar,
  User,
  ArrowUpRight,
  ArrowDownLeft,
  Search,
  Filter,
  Download,
  Play,
  Pause,
  Volume2,
  VolumeX,
  Info,
  X,
} from "lucide-react";
import { useAuth } from "@/app/contexts/AuthContext";

interface CallLog {
  id: string;
  sessionId: string;
  startTime: string;
  endTime: string;
  direction: "inbound" | "outbound";
  durationSeconds: number;
  status: string;
  callerId: string;
  audio_recording_path: string;
  metadata: any;
  transcripts: {
    id: string;
    speaker: string;
    messageText: string;
    timestamp: string;
  }[];
}

export default function CallHistory() {
  const [callLogs, setCallLogs] = useState<CallLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCall, setSelectedCall] = useState<CallLog | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentAudio, setCurrentAudio] = useState<HTMLAudioElement | null>(
    null
  );
  const [metadataDialog, setMetadataDialog] = useState<{
    open: boolean;
    metadata: any;
  } | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      fetchCallLogs();
    }
  }, [user]);

  const fetchCallLogs = async () => {
    try {
      const response = await fetch("/api/conversations", {
        headers: {
          "user-id": user?.id as string,
        },
      });
      if (!response.ok) throw new Error("Failed to fetch call logs");
      const data = await response.json();
      //   console.log(data.callLogs);
      setCallLogs(data.callLogs);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
  };

  const handlePlayAudio = (audioPath: string) => {
    if (currentAudio) {
      currentAudio.pause();
      currentAudio.currentTime = 0;
    }

    const audio = new Audio(`/api/audio/${audioPath}`);
    audio.play();
    setCurrentAudio(audio);
    setIsPlaying(true);

    audio.onended = () => {
      setIsPlaying(false);
      setCurrentAudio(null);
    };
  };

  const filteredCalls = callLogs.filter(
    (call) =>
      call.callerId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      call.sessionId.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-red-500 text-xl">{error}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
            Call History
          </h1>
          <div className="flex gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                type="text"
                placeholder="Search calls..."
                className="bg-gray-800 text-white pl-10 pr-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <button className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Filter
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-1 space-y-4">
            {filteredCalls.map((call) => (
              <motion.div
                key={call.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-gray-800 rounded-xl p-6 hover:bg-gray-700 transition-colors cursor-pointer w-full max-w-2xl mx-auto"
              >
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-3">
                    {call.direction === "inbound" ? (
                      <ArrowDownLeft className="h-5 w-5 text-green-500" />
                    ) : (
                      <ArrowUpRight className="h-5 w-5 text-blue-500" />
                    )}
                    <div>
                      <p className="font-medium">{call.callerId}</p>
                      <p className="text-sm text-gray-400">{call.sessionId}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-sm text-gray-400 font-mono">
                          {format(
                            new Date(call.startTime),
                            "MMM d, yyyy, h:mm a"
                          )}
                        </span>
                        <button
                          onClick={() =>
                            setMetadataDialog({
                              open: true,
                              metadata: call.metadata,
                            })
                          }
                          className="bg-gray-700 hover:bg-gray-600 p-1 rounded-lg"
                          title="View Metadata"
                        >
                          <Info className="h-5 w-5" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="mt-3 flex items-center gap-4 text-sm text-gray-400">
                  <div className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    {formatDuration(call.durationSeconds)}
                  </div>
                  <div className="flex items-center gap-1">
                    <Phone className="h-4 w-4" />
                    {call.status}
                  </div>
                </div>
                <button
                  className="mt-4 w-full bg-blue-600 hover:bg-blue-700 py-2 rounded-lg font-semibold"
                  onClick={() => setSelectedCall(call)}
                >
                  View Chat & Details
                </button>
              </motion.div>
            ))}
          </div>

          {selectedCall && (
            <div className="md:col-span-2 bg-gray-800 rounded-xl p-6 relative">
              <button
                className="absolute top-6 right-28 bg-gray-700 hover:bg-gray-600 p-2 rounded-full z-20 shadow-lg"
                onClick={() => setSelectedCall(null)}
                title="Close"
              >
                <X className="h-5 w-5" />
              </button>
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h2 className="text-xl font-semibold">Call Details</h2>
                  <p className="text-gray-400">{selectedCall.sessionId}</p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() =>
                      handlePlayAudio(selectedCall.audio_recording_path)
                    }
                    className="bg-blue-600 hover:bg-blue-700 p-2 rounded-lg"
                  >
                    {isPlaying ? (
                      <Pause className="h-5 w-5" />
                    ) : (
                      <Play className="h-5 w-5" />
                    )}
                  </button>
                  <button className="bg-gray-700 hover:bg-gray-600 p-2 rounded-lg">
                    <Download className="h-5 w-5" />
                  </button>
                </div>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gray-700 p-3 rounded-lg">
                    <p className="text-sm text-gray-400">Start Time</p>
                    <p>{format(new Date(selectedCall.startTime), "PPpp")}</p>
                  </div>
                  <div className="bg-gray-700 p-3 rounded-lg">
                    <p className="text-sm text-gray-400">Duration</p>
                    <p>{formatDuration(selectedCall.durationSeconds)}</p>
                  </div>
                </div>

                <div className="mt-6">
                  <h3 className="text-lg font-semibold mb-3">Transcript</h3>
                  <div className="space-y-3 max-h-[400px] overflow-y-auto">
                    {selectedCall.transcripts.map((transcript) => (
                      <div
                        key={transcript.id}
                        className={`p-3 rounded-lg max-w-[80%] ${
                          transcript.speaker === "user"
                            ? "bg-blue-900/30 ml-auto"
                            : "bg-gray-700 mr-auto"
                        }`}
                      >
                        <div className="flex justify-between items-start mb-1">
                          <span className="font-medium">
                            {transcript.speaker === "user" ? "User" : "Agent"}
                          </span>
                          <span className="text-sm text-gray-400">
                            {format(
                              new Date(transcript.timestamp),
                              "h:mm:ss a"
                            )}
                          </span>
                        </div>
                        <p className="text-gray-200">
                          {transcript.messageText}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Metadata Modal */}
      <AnimatePresence>
        {metadataDialog?.open && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="bg-gray-800 rounded-xl p-6 max-w-2xl w-full relative shadow-2xl"
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
            >
              <button
                className="absolute top-4 right-4 bg-gray-700 hover:bg-gray-600 p-2 rounded-full z-10"
                onClick={() => setMetadataDialog(null)}
                title="Close"
              >
                <X className="h-5 w-5" />
              </button>
              <h3 className="text-lg font-semibold mb-4">Call Metadata</h3>
              <pre className="text-sm text-gray-300 overflow-auto max-h-96">
                {JSON.stringify(metadataDialog.metadata, null, 2)}
              </pre>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
