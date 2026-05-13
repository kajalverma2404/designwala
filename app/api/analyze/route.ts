import { NextRequest, NextResponse } from "next/server";
import { analyzeRoom } from "@/lib/claude";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { imageBase64, mimeType, roomType = "Living Room", budget = 50000 } = body;

    if (!imageBase64 || typeof imageBase64 !== "string") {
      return NextResponse.json(
        { error: "imageBase64 is required" },
        { status: 400 }
      );
    }

    const validMimeTypes = ["image/jpeg", "image/png", "image/webp"];
    if (!mimeType || !validMimeTypes.includes(mimeType)) {
      return NextResponse.json(
        { error: "mimeType must be image/jpeg, image/png, or image/webp" },
        { status: 400 }
      );
    }

    const analysis = await analyzeRoom(
      imageBase64,
      mimeType as "image/jpeg" | "image/png" | "image/webp",
      roomType,
      budget
    );

    return NextResponse.json(analysis);
  } catch (error) {
    console.error("Design analysis error:", error);

    const message =
      error instanceof Error ? error.message : "Unexpected error";

    if (message.includes("API key")) {
      return NextResponse.json(
        { error: "Service configuration error. Please try again later." },
        { status: 503 }
      );
    }

    if (message.includes("rate") || message.includes("limit")) {
      return NextResponse.json(
        { error: "Too many requests. Please wait a moment and try again." },
        { status: 429 }
      );
    }

    return NextResponse.json(
      { error: "Failed to analyze room. Please try again." },
      { status: 500 }
    );
  }
}
