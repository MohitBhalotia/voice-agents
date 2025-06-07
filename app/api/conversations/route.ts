import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import { z } from "zod";
import twilio from "twilio";
import axios from "axios";
import { v2 as cloudinary } from "cloudinary";
import connectCloudinary from "@/config/cloudinary";

connectCloudinary();
// Define the conversation message schema
const conversationMessageSchema = z.object({
  id: z.string(),
  role: z.enum(["user", "agent"]),
  message: z.string(),
  timestamp: z.string().datetime(),
});

// Define the summary schema

// Define the main conversation data schema
const conversationSchema = z.object({
  id: z.string(),
  agent_id: z.string().uuid(),
  conversation_id: z.string(),
  start_time: z.string().datetime(),
  end_time: z.string().datetime(),
  direction: z.enum(["inbound", "outbound"]),
  call_duration_secs: z.number(),
  //   message_count: z.number(),
  status: z.string(),
  //   call_successful: z.string(),
  summary: z.any(),
  recording_sid: z.string(),
  conversation_history: z.array(conversationMessageSchema),
  to_number: z.string(),
  from_number: z.string(),
});

// Query parameters schema for GET route
// const queryParamsSchema = z.object({
//   page: z
//     .string()
//     .optional()
//     .transform((val) => parseInt(val || "1")),
//   limit: z
//     .string()
//     .optional()
//     .transform((val) => parseInt(val || "10")),
//   sortBy: z
//     .enum(["startTime", "endTime", "durationSeconds"])
//     .optional()
//     .default("startTime"),
//   sortOrder: z.enum(["asc", "desc"]).optional().default("desc"),
// });

export async function POST(req: Request) {
  try {
    const data = await req.json();

    // Validate the incoming data
    const validatedData = conversationSchema.parse(data);
    const user = await prisma.agent.findUnique({
      where: {
        id: validatedData.agent_id,
      },
      select: {
        userId: true,
      },
    });
    const user_id = user?.userId;
    const client = twilio(
      process.env.TWILIO_ACCOUNT_SID,
      process.env.TWILIO_AUTH_TOKEN
    );
    const recording = await client
      .recordings(validatedData.recording_sid)
      .fetch();
    const recordingUrl = `https://api.twilio.com${recording.uri.replace(
      ".json",
      ".mp3"
    )}`;

    const recordingResponse = await axios.get(recordingUrl, {
      responseType: "arraybuffer",
      auth: {
        username: process.env.TWILIO_ACCOUNT_SID!,
        password: process.env.TWILIO_AUTH_TOKEN!,
      },
    });

    // Wrap Cloudinary upload in a Promise
    const uploadResult = await new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          resource_type: "video", // audio/mp3 is uploaded as video
          folder: "twilio_recordings",
          public_id: validatedData.recording_sid,
          format: "mp3",
        },
        (error, result) => {
          if (error) {
            console.error("Cloudinary upload error:", error);
            reject(new Error("Failed to upload recording to Cloudinary"));
          }
          resolve(result);
        }
      );

      // Write the recording data to the upload stream
      uploadStream.end(recordingResponse.data);
    });

    const audioRecordingPath = (uploadResult as any)?.secure_url;

    const callLogData: Prisma.CallLogCreateInput = {
      id: validatedData.id,
      agent: {
        connect: {
          id: validatedData.agent_id,
        },
      },
      user_id: user_id as string,
      sessionId: validatedData.conversation_id,
      startTime: new Date(validatedData.start_time),
      endTime: new Date(validatedData.end_time),
      direction: validatedData.direction,
      durationSeconds: validatedData.call_duration_secs,
      status: validatedData.status,
      callerId: validatedData.from_number,
      audio_recording_path: audioRecordingPath || validatedData.recording_sid,
      metadata: validatedData.summary,
    };

    const callLog = await prisma.callLog.create({
      data: callLogData,
    });

    // Create transcripts for each message in conversation history
    const transcripts = await Promise.all(
      validatedData.conversation_history.map((message) =>
        prisma.callTranscript.create({
          data: {
            callLogId: callLog.id,
            speaker: message.role === "user" ? "user" : "agent",
            messageText: message.message,
            timestamp: new Date(message.timestamp),
          },
        })
      )
    );

    return NextResponse.json({
      success: true,
      callLog,
      transcripts,
    });
  } catch (error) {
    console.error("Error saving conversation:", error);

    // Handle Zod validation errors
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          error: "Invalid request data",
          details: error.errors,
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Failed to save conversation" },
      { status: 500 }
    );
  }
}

export async function GET(req: Request) {
  try {
    const user_id = req.headers.get("user-id");

    if (!user_id) {
      return NextResponse.json(
        {
          error: "User ID is required",
        },
        { status: 400 }
      );
    }

    // Parse and validate query parameters
    // const { searchParams } = new URL(req.url);
    // const queryParams = queryParamsSchema.parse({
    //   page: searchParams.get("page"),
    //   limit: searchParams.get("limit"),
    //   sortBy: searchParams.get("sortBy"),
    //   sortOrder: searchParams.get("sortOrder"),
    // });

    // Calculate pagination
    // const skip = (queryParams.page - 1) * queryParams.limit;

    // Fetch call logs with pagination and sorting
    const callLogs = await prisma.callLog.findMany({
      where: {
        user_id: user_id,
      },
      include: {
        transcripts: {
          orderBy: {
            timestamp: "asc",
          },
        },
      },
    });
    //   orderBy: {
    //   //         orderBy: {
    //   //           timestamp: "asc",
    //   //         },
    //   //       },
    //   //     },
    //   //     orderBy: {
    //   //       [queryParams.sortBy]: queryParams.sortOrder,
    //   //     },
    //   //     skip,
    //   //     take: queryParams.limit,
    // });
    //   prisma.callLog.count({
    //     where: {
    //       user_id: user_id,
    //     },
    //   }),

    // Calculate pagination metadata
    // const totalPages = Math.ceil(total / queryParams.limit);
    // const hasNextPage = queryParams.page < totalPages;
    // const hasPreviousPage = queryParams.page > 1;

    return NextResponse.json({ callLogs });
    //   pagination: {
    //     // currentPage: queryParams.page,
    //     // totalPages,
    //     // totalItems: total,
    //     // itemsPerPage: queryParams.limit,
    //     // hasNextPage,
    //     // hasPreviousPage,
    //   },
  } catch (error) {
    console.error("Error fetching call logs:", error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          error: "Invalid query parameters",
          details: error.errors,
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Failed to fetch call logs" },
      { status: 500 }
    );
  }
}
