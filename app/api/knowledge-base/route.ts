import { NextResponse } from "next/server";
import { v2 as cloudinary } from "cloudinary";
import { z } from "zod";
import prisma from "@/lib/prisma";
import connectCloudinary from "@/config/cloudinary";
import axios from "axios";
import { source_type, status } from "@prisma/client";

// Initialize cloudinary
connectCloudinary();

// Validation schema for the request
const uploadSchema = z
  .object({
    agentId: z.string().uuid(),
    name: z.string().min(1),
    sourceType: z.nativeEnum(source_type),
    url: z.string().url().optional().nullable(),
    file: z.any().optional().nullable(),
  })
  .refine(
    (data) => {
      if (data.sourceType === source_type.URL) {
        return !!data.url;
      }
      return !!data.file;
    },
    {
      message:
        "URL is required for URL source type, file is required for other source types",
      path: ["sourceType"],
    }
  );

export async function GET() {
  try {
    // Fetch all knowledge sources for the agent
    const knowledgeSources = await prisma.knowledgeSource.findMany({
      orderBy: {
        uploaded_at: "desc",
      },
      select: {
        id: true,
        agent: {
          select: {
            name: true,
          },
        },
        name: true,
        sourceType: true,
        originalFileName: true,
        storagePath: true,
        status: true,
        uploaded_at: true,
        last_indexed_at: true,
        metadata: true,
      },
    });

    return NextResponse.json(knowledgeSources, { status: 200 });
  } catch (error) {
    console.error("Error fetching knowledge sources:", error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation error", details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Failed to fetch knowledge sources" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const agentId = formData.get("agentId") as string;
    const name = formData.get("name") as string;
    const sourceType = formData.get("sourceType") as source_type;
    const url = formData.get("url") as string | null;
    const file = formData.get("file") as File | null;

    const validatedData = uploadSchema.parse({
      agentId,
      name,
      sourceType,
      url,
      file,
    });

    const knowledgeSource = await prisma.knowledgeSource.create({
      data: {
        agentId: validatedData.agentId,
        name: validatedData.name,
        sourceType: validatedData.sourceType,
        originalFileName: "",
        storagePath: "",
        status: status.PENDING,
      },
    });

    try {
      await prisma.knowledgeSource.update({
        where: { id: knowledgeSource.id },
        data: { status: status.PROCESSING },
      });

      let cloudinaryUrl = "";
      let originalFileName: string | undefined;

      if (sourceType === source_type.URL && validatedData.url) {
        const response = await axios.get(validatedData.url, {
          responseType: "arraybuffer",
          headers: { Accept: "application/pdf" },
        });

        const contentType = response.headers["content-type"];
        if (!contentType || !contentType.includes("pdf")) {
          throw new Error(
            "The provided URL does not point to a valid PDF file."
          );
        }

        const buffer = Buffer.from(response.data);
        const fileName =
          validatedData.url.split("/").pop()?.split("?")[0] || "document";
        const nameWithoutExt = fileName.replace(/\.[^/.]+$/, "");

        await new Promise<void>((resolve, reject) => {
          cloudinary.uploader
            .upload_stream(
              {
                resource_type: "raw",
                public_id: `documents/${nameWithoutExt}.pdf`,
                use_filename: false,
                unique_filename: false,
                overwrite: true,
              },
              (error, result) => {
                if (error) return reject(error);
                if (!result?.secure_url)
                  return reject(
                    new Error("Cloudinary did not return a secure URL")
                  );
                cloudinaryUrl = result.secure_url;
                resolve();
              }
            )
            .end(buffer);
        });

        originalFileName = `${nameWithoutExt}.pdf`;
      } else if (validatedData.file) {
        const bytes = await validatedData.file.arrayBuffer();
        const buffer = Buffer.from(bytes);

        const rawName = validatedData.file.name || "uploaded_file";
        const nameWithoutExt = rawName.replace(/\.[^/.]+$/, "");

        await new Promise<void>((resolve, reject) => {
          cloudinary.uploader
            .upload_stream(
              {
                resource_type: "raw",
                public_id: `documents/${nameWithoutExt}.pdf`,
                use_filename: false,
                unique_filename: false,
                overwrite: true,
              },
              (error, result) => {
                if (error) return reject(error);
                if (!result?.secure_url)
                  return reject(
                    new Error("Cloudinary did not return a secure URL")
                  );
                cloudinaryUrl = result.secure_url;
                resolve();
              }
            )
            .end(buffer);
        });

        originalFileName = rawName;
      } else {
        throw new Error("Neither URL nor file was provided.");
      }

      if (!cloudinaryUrl) {
        throw new Error("Failed to upload file to Cloudinary.");
      }

      console.log(
        JSON.stringify({
          agentId: validatedData.agentId,
          documents: [cloudinaryUrl],
        })
      );

      const response = await fetch("http://localhost:8000/process-documents", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          agent_id: validatedData.agentId,
          documents: [cloudinaryUrl],
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.detail || "Failed to process document");
      }

      const processResult = await response.json();
      console.log("Document processing result:", processResult);

      const updatedSource = await prisma.knowledgeSource.update({
        where: { id: knowledgeSource.id },
        data: {
          originalFileName: originalFileName || "",
          storagePath: cloudinaryUrl,
          status: status.ACTIVE,
          last_indexed_at: new Date(),
          metadata: {
            processingResult: processResult,
          },
        },
      });

      return NextResponse.json(updatedSource, { status: 201 });
    } catch (error) {
      await prisma.knowledgeSource.update({
        where: { id: knowledgeSource.id },
        data: {
          status: status.ERROR,
          metadata: {
            error: error instanceof Error ? error.message : "Unknown error",
          },
        },
      });

      throw error;
    }
  } catch (error) {
    console.error("Error uploading document:", error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation error", details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Failed to upload document" },
      { status: 500 }
    );
  }
}
