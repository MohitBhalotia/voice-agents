// import { buildDeepgramPayload } from "@/utils/buildPayload";
// import { WebSocket, WebSocketServer } from "ws";
// import http from "http";
// import { NextResponse } from "next/server";

// // Constants
// const BUFFER_SIZE = 20 * 160; // 0.4s of audio
// const PORT = 6000;

// const DEEPGRAM_API_KEY = process.env.DEEPGRAM_API_KEY;
// if (!DEEPGRAM_API_KEY) {
//   throw new Error("DEEPGRAM_API_KEY environment variable is not set");
// }

// // Singleton server instance
// let server: http.Server | null = null;
// let wss: WebSocketServer | null = null;

// function connectToSTS(): Promise<WebSocket> {
//   return new Promise((resolve, reject) => {
//     const sts_ws = new WebSocket("wss://agent.deepgram.com/v1/agent/converse", [
//       "token",
//       DEEPGRAM_API_KEY!,
//     ]);

//     sts_ws.on("open", () => resolve(sts_ws));
//     sts_ws.on("error", reject);
//   });
// }

// async function handleTwilio(twilio_ws: WebSocket) {
//   const audioQueue: Buffer[] = [];
//   const streamsidQueue: string[] = [];

//   try {
//     const sts_ws = await connectToSTS();
//     console.log("Connected to STS");

//     // Send config
//     const configMessage = {
//       type: "Settings",
//       audio: {
//         input: {
//           encoding: "mulaw",
//           sample_rate: 8000,
//         },
//         output: {
//           encoding: "mulaw",
//           sample_rate: 8000,
//           container: "none",
//         },
//       },
//       agent: {
//         language: "en",
//         listen: {
//           provider: {
//             type: "deepgram",
//             model: "nova-3",
//             keyterms: ["hello", "goodbye"],
//           },
//         },
//         think: {
//           provider: {
//             type: "open_ai",
//             model: "gpt-4o-mini",
//             temperature: 0.7,
//           },
//           prompt: "You are a helpful AI assistant focused on customer service.",
//         },
//         speak: {
//           provider: {
//             type: "deepgram",
//             model: "aura-2-thalia-en",
//           },
//         },
//         greeting: "Hello! How can I help you today?",
//       },
//     };

//     sts_ws.send(JSON.stringify(configMessage));
//     console.log("Sent config to STS");

//     // Buffer for inbound audio
//     let inbuffer = Buffer.alloc(0);

//     // Handle Twilio messages
//     twilio_ws.on("message", async (data) => {
//       try {
//         const message = JSON.parse(data.toString());
//         console.log("Received Twilio message:", message.event);

//         switch (message.event) {
//           case "start":
//             const streamSid = message.start.streamSid;
//             console.log("Got stream SID:", streamSid);
//             streamsidQueue.push(streamSid);
//             break;

//           case "media":
//             if (message.media.track === "inbound") {
//               const audioChunk = Buffer.from(message.media.payload, "base64");
//               inbuffer = Buffer.concat([inbuffer, audioChunk]);

//               while (inbuffer.length >= BUFFER_SIZE) {
//                 const chunk = inbuffer.slice(0, BUFFER_SIZE);
//                 inbuffer = inbuffer.slice(BUFFER_SIZE);
//                 audioQueue.push(chunk);
//                 sts_ws.send(chunk);
//               }
//             }
//             break;

//           case "stop":
//             console.log("Stream stopped");
//             twilio_ws.close();
//             break;
//         }
//       } catch (err) {
//         console.error("Error processing Twilio message:", err);
//       }
//     });

//     // Handle STS messages
//     sts_ws.on("message", async (message) => {
//       try {
//         const streamSid = streamsidQueue[0];
//         if (typeof message === "string") {
//           const decoded = JSON.parse(message);
//           console.log("Received STS message:", decoded);

//           if (decoded.type === "UserStartedSpeaking") {
//             const clearMessage = {
//               event: "clear",
//               streamSid: streamSid,
//             };
//             twilio_ws.send(JSON.stringify(clearMessage));
//           }
//           return;
//         }

//         // Binary - TTS audio
//         const payload = Buffer.from(message as Buffer).toString("base64");
//         const mediaMessage = {
//           event: "media",
//           streamSid: streamSid,
//           media: {
//             payload: payload,
//           },
//         };
//         twilio_ws.send(JSON.stringify(mediaMessage));
//       } catch (err) {
//         console.error("Error processing STS message:", err);
//       }
//     });

//     twilio_ws.on("close", () => {
//       console.log("Twilio connection closed");
//       sts_ws.close();
//     });

//     sts_ws.on("close", () => {
//       console.log("STS connection closed");
//     });
//   } catch (error) {
//     console.error("Error in handleTwilio:", error);
//   }
// }

// function getOrCreateServer() {
//   if (!server) {
//     console.log("Creating new WebSocket server...");
//     server = http.createServer();
//     wss = new WebSocketServer({ server });

//     wss.on("connection", (ws, req) => {
//       const path = req.url;
//       console.log(`New connection on path: ${path}`);

//       if (path === "/twilio") {
//         console.log("Starting Twilio handler");
//         handleTwilio(ws);
//       }
//     });

//     server.listen(PORT, () => {
//       console.log(`WebSocket server started at ws://localhost:${PORT}`);
//     });

//     server.on("error", (error) => {
//       console.error("Server error:", error);
//       if ((error as any).code === "EADDRINUSE") {
//         console.error(`Port ${PORT} is already in use`);
//       }
//     });
//   }
//   return { server, wss };
// }

// export async function POST(req: Request) {
//   try {
//     const { configuration } = await req.json();
//     const { server, wss } = getOrCreateServer();

//     if (!server || !wss) {
//       throw new Error("Failed to create WebSocket server");
//     }

//     return NextResponse.json({
//       message: "WebSocket server is running",
//       wsUrl: `ws://localhost:${PORT}`,
//       status: 200,
//     });
//   } catch (error) {
//     console.error("Error in POST handler:", error);
//     return NextResponse.json(
//       { error: "Failed to start WebSocket server" },
//       { status: 500 }
//     );
//   }
// }
