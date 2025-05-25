import axios from "axios";
import { buildDeepgramPayload } from "@/utils/buildPayload";

import { WebSocket, WebSocketServer } from "ws";
import http from "http";

export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  const { configuration } = await req.json();
  const agentId = params.id;
  const DEEPGRAM_API_KEY = process.env.DEEPGRAM_API_KEY;
  if (!DEEPGRAM_API_KEY) {
    throw new Error("DEEPGRAM_API_KEY environment variable is not set");
  }

  // Constants
  const BUFFER_SIZE = 20 * 160; // 0.4s of audio

  // Create HTTP server
  const server = http.createServer();
  const PORT = 3000;
  // WebSocket Server
  const wss = new WebSocketServer({ server });

  console.log(`WebSocket server started at ws://localhost:${PORT}`);

  wss.on("connection", (twilio_ws, req) => {
    console.log(twilio_ws);
    console.log(req);
    const path = req.url;

    console.log(`Incoming connection on path: ${path}`);
    const config = buildDeepgramPayload(configuration);
    if (path === "/twilio") {
      handleTwilio(twilio_ws, config);
    }
  });

  function connectToSTS(): Promise<WebSocket> {
    return new Promise((resolve, reject) => {
      const sts_ws = new WebSocket(
        "wss://agent.deepgram.com/v1/agent/converse",
        {
          headers: {
            "Sec-WebSocket-Protocol": `token,${DEEPGRAM_API_KEY}`,
          },
        }
      );

      sts_ws.on("open", () => resolve(sts_ws));
      sts_ws.on("error", reject);
    });
  }

  async function handleTwilio(
    twilio_ws: WebSocket,
    config: any
  ) {
    const audioQueue = [];
    const streamsidQueue: string[] = [];

    const sts_ws = await connectToSTS();

    // Send config

    sts_ws.send(JSON.stringify(config));

    // Buffer for inbound audio
    let inbuffer = Buffer.alloc(0);

    twilio_ws.on("message", async (data) => {
      try {
        const message = JSON.parse(data.toString());

        switch (message.event) {
          case "start":
            const streamSid = message.start.streamSid;
            streamsidQueue.push(streamSid);
            break;

          case "media":
            if (message.media.track === "inbound") {
              const audioChunk = Buffer.from(message.media.payload, "base64");
              inbuffer = Buffer.concat([inbuffer, audioChunk]);

              while (inbuffer.length >= BUFFER_SIZE) {
                const chunk = inbuffer.slice(0, BUFFER_SIZE);
                inbuffer = inbuffer.slice(BUFFER_SIZE);
                audioQueue.push(chunk);
                sts_ws.send(chunk);
              }
            }
            break;

          case "stop":
            console.log("Stopping session...");
            twilio_ws.close();
            break;
        }
      } catch (err) {
        console.error(
          "Twilio parse error:",
          err instanceof Error ? err.message : String(err)
        );
      }
    });

    sts_ws.on("message", async (message) => {
      try {
        const streamSid = streamsidQueue[0];
        if (typeof message === "string") {
          const decoded = JSON.parse(message);

          if (decoded.type === "UserStartedSpeaking") {
            const clearMessage = {
              event: "clear",
              streamSid: streamSid,
            };
            twilio_ws.send(JSON.stringify(clearMessage));
          }

          console.log("[STS MSG]", decoded);
          return;
        }

        // Binary - TTS audio
        const payload = Buffer.from(Buffer.from(message as Buffer)).toString(
          "base64"
        );
        const mediaMessage = {
          event: "media",
          streamSid: streamSid,
          media: {
            payload: payload,
          },
        };
        twilio_ws.send(JSON.stringify(mediaMessage));
      } catch (err) {
        console.error(
          "STS parse error:",
          err instanceof Error ? err.message : String(err)
        );
      }
    });

    twilio_ws.on("close", () => {
      console.log("Twilio connection closed");
      sts_ws.close();
    });

    sts_ws.on("close", () => {
      console.log("STS connection closed");
    });
  }
}
