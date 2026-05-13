import { NextRequest, NextResponse } from "next/server";
import OpenAI, { toFile } from "openai";

let _client: OpenAI | null = null;
function getClient(): OpenAI {
  if (!_client) _client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  return _client;
}

export async function POST(req: NextRequest) {
  try {
    const { imageBase64, mimeType, styleName, styleDescription, colors } =
      await req.json();

    if (!imageBase64 || !styleName) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const imageBuffer = Buffer.from(imageBase64, "base64");
    const imageFile = await toFile(imageBuffer, "room.jpg", {
      type: mimeType ?? "image/jpeg",
    });

    const prompt =
      `Redesign this room in ${styleName} style. ${styleDescription} ` +
      `Use these accent colors: ${(colors as string[]).join(", ")}. ` +
      `Keep the room's structure and proportions but transform the decor, ` +
      `furniture, colors, and styling. Make it look realistic, beautiful, and photographic.`;

    const response = await getClient().images.edit({
      model: "gpt-image-1",
      image: imageFile,
      prompt,
      n: 1,
      size: "1024x1024",
    });

    const b64 = response.data?.[0]?.b64_json;
    if (!b64) throw new Error("No image returned");

    return NextResponse.json({ imageBase64: b64 });
  } catch (error) {
    console.error("Visualize error:", error);
    const msg = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
