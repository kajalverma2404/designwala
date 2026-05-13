import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

let _client: OpenAI | null = null;
function getClient(): OpenAI {
  if (!_client) _client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  return _client;
}

export interface DesignItem {
  name: string;
  description: string;
}

export interface DesignCategory {
  category: string;
  items: DesignItem[];
}

export async function POST(req: NextRequest) {
  try {
    const { imageBase64, mimeType, styleName } = await req.json();

    if (!imageBase64 || !mimeType) {
      return NextResponse.json(
        { error: "imageBase64 and mimeType are required" },
        { status: 400 }
      );
    }

    const response = await getClient().chat.completions.create({
      model: "gpt-4o",
      max_tokens: 1500,
      response_format: { type: "json_object" },
      messages: [
        {
          role: "user",
          content: [
            {
              type: "image_url",
              image_url: {
                url: `data:${mimeType};base64,${imageBase64}`,
                detail: "high",
              },
            },
            {
              type: "text",
              text: `You are an expert interior designer analyzing a ${styleName || "redesigned"} room.

Identify every visible item in this room — furniture, lighting, textiles, decor, plants, art, etc. Group into categories.

Use these category names where applicable:
- Seating & Furniture
- Lighting & Wall Decor
- Textiles & Floor Coverings
- Tabletop & Decorative Accents
- Storage & Shelving

For each item provide:
- name: a specific, descriptive product name (e.g. "Rust Velvet Mid-Century Sofa", not just "sofa")
- description: one sentence covering its color, material, and design style

Respond ONLY with valid JSON:
{
  "categories": [
    {
      "category": "string",
      "items": [
        { "name": "string", "description": "string" }
      ]
    }
  ]
}`,
            },
          ],
        },
      ],
    });

    const text = response.choices[0]?.message?.content;
    if (!text) throw new Error("No response");

    const { categories } = JSON.parse(text) as { categories: DesignCategory[] };
    return NextResponse.json({ categories });
  } catch (error) {
    console.error("Identify error:", error);
    return NextResponse.json({ error: "Failed to identify items" }, { status: 500 });
  }
}
