interface AgentConfiguration {
  agentId: string;
  agent_language: string;
  firstMessage: string;
  systemPrompt: string;
  llmModel: string;
  temperature: number;
  tokenLimit: number;
  use_rag: boolean;
  voiceId: string;
  use_flash_call: boolean;
  tts_output_format: string;
  optimize_streaming_latency: boolean;
  voice_stability: number;
  voice_speed: number;
  voice_similarity_boost: number;
  fetch_initiation_webhook_url: string | null;
  post_call_webhook_url: string | null;
  concurrent_calls_limit: number;
  daily_calls_limit: number;
  turn_timeout_seconds: number;
  silence_end_call_timeout_seconds: number;
  max_conversation_duration_seconds: number;
  user_input_audio_format: string;
  store_call_audio: boolean;
  zero_pii_retention: boolean;
  conversation_retention_days: number;
  enable_auth_for_agent_api: boolean;
}

export const buildDeepgramPayload = (config: AgentConfiguration) => {
  return {
    type: "Settings",
    audio: {
      input: {
        encoding: "mulaw",
        sample_rate: 8000,
      },
      output: {
        encoding: "mulaw",
        sample_rate: 8000,
        container: "none",
      },
    },
    agent: {
      language: config.agent_language.toLowerCase(),
      listen: {
        provider: {
          type: "deepgram" as const,
          model: "nova-3",
          keyterms: ["hello", "goodbye"]
        },
      },
      think: {
        provider: {
          type: "open_ai" as const,
          model: "gpt-4o-mini",
          temperature: config.temperature,
        },
        prompt: config.systemPrompt,
      },
      speak: {
        provider: {
          type: "deepgram" as const,
          model: "aura-2-thalia-en",
          //   voice_id: config.voiceId,
          //   stability: config.voice_stability,
          //   speed: config.voice_speed,
          //   similarity_boost: config.voice_similarity_boost,
        },
      },
      greeting: config.firstMessage,
    },
  };
  // llm: {
  //   provider: "openai",
  //   model: "gpt-4o-mini",
  //   temperature: config.temperature,
  //   token_limit: config.tokenLimit,
  // },
  // voice: {
  //   voice_id: config.voiceId,
  //   output_format: config.tts_output_format,
  //   stability: config.voice_stability,
  //   speed: config.voice_speed,
  //   similarity_boost: config.voice_similarity_boost,
  // },
  // rag_enabled: config.use_rag,
  // optimize_latency: config.optimize_streaming_latency,
  // timeouts: {
  //   turn_timeout_seconds: config.turn_timeout_seconds,
  //   silence_timeout_seconds: config.silence_end_call_timeout_seconds,
  //   max_conversation_duration_seconds:
  //     config.max_conversation_duration_seconds,
  // },
  // webhooks: {
  //   on_start: config.fetch_initiation_webhook_url || undefined,
  //   on_end: config.post_call_webhook_url || undefined,
  // },
  // limits: {
  //   concurrent_calls: config.concurrent_calls_limit,
  //   daily_calls: config.daily_calls_limit,
  // },
  // security: {
  //   retain_pii: !config.zero_pii_retention,
  //   conversation_retention_days: config.conversation_retention_days,
  //   auth_required: config.enable_auth_for_agent_api,
  // },
};
