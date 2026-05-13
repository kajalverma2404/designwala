import OpenAI from "openai";
import {
  PRODUCT_CATALOG,
  formatCatalogForPrompt,
  getProductById,
} from "./products";

export interface Product {
  id: string;
  name: string;
  name_hi: string;
  brand: string;
  category: string;
  price_inr: number;
  url: string;
  reason: string;
}

export interface DesignStyle {
  name: string;
  description: string;
  colors: string[];
  products: Product[];
}

export interface DesignAnalysis {
  styles: DesignStyle[];
}

// Internal AI response before we expand product IDs
interface RawStyle {
  name: string;
  description: string;
  colors: string[];
  selections: { product_id: string; reason: string }[];
}
interface RawAnalysis {
  styles: RawStyle[];
}

function buildSystemPrompt(roomType: string, maxBudget: number): string {
  const budgetLabel = new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(maxBudget);

  // Filter catalog to products within budget; fall back to full catalog if too few match
  const inBudget = PRODUCT_CATALOG.filter((p) => p.price_inr <= maxBudget);
  const catalog = inBudget.length >= 12
    ? inBudget.map((p) => `[${p.id}] ${p.name} | ${p.brand} | ₹${p.price_inr.toLocaleString("en-IN")} | ${p.category} | ${p.description}`).join("\n")
    : formatCatalogForPrompt();

  return `You are an expert Indian interior designer. Analyze the uploaded room photo and select products from the catalog below to create 3 design variants.

Room type: ${roomType}
Maximum budget per style: ${budgetLabel} total across all 6 products

Only select products whose price_inr fits within the budget. Prioritize the best value items.

PRODUCT CATALOG (filtered to your budget):
${catalog}

Respond ONLY with valid JSON matching this exact structure:
{
  "styles": [
    {
      "name": string,
      "description": string (2-3 sentences, warm and inspiring),
      "colors": string[] (exactly 3 hex color codes),
      "selections": [
        { "product_id": string (must be an ID from the catalog above), "reason": string (one sentence why it fits this style and room) }
      ] (exactly 6 selections, pick diverse categories)
    }
  ] (exactly 3 styles in order: "Modern Indian", "Minimalist", "Vastu-Optimized")
}

For Modern Indian: bold colors, Indian motifs, artisanal warmth, saffron/teal accents.
For Minimalist: clean lines, neutral whites/grays, clutter-free, functional.
For Vastu-Optimized: natural materials, auspicious items, energy flow, earth tones.

Only use product IDs from the catalog. Pick 6 distinct products per style covering different categories (bed/sofa, storage, lighting, textiles, decor, etc.).`;
}

let _client: OpenAI | null = null;
function getClient(): OpenAI {
  if (!_client) _client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  return _client;
}

function expandSelections(raw: RawAnalysis): DesignAnalysis {
  return {
    styles: raw.styles.map((style) => ({
      name: style.name,
      description: style.description,
      colors: style.colors,
      products: style.selections
        .map((sel) => {
          const catalogItem = getProductById(sel.product_id);
          if (!catalogItem) return null;
          return {
            id: catalogItem.id,
            name: catalogItem.name,
            name_hi: catalogItem.name_hi,
            brand: catalogItem.brand,
            category: catalogItem.category,
            price_inr: catalogItem.price_inr,
            url: catalogItem.url,
            reason: sel.reason,
          } satisfies Product;
        })
        .filter((p): p is Product => p !== null),
    })),
  };
}

export async function analyzeRoom(
  imageBase64: string,
  mimeType: "image/jpeg" | "image/png" | "image/webp",
  roomType: string,
  budget: number
): Promise<DesignAnalysis> {
  const makeRequest = async (): Promise<DesignAnalysis> => {
    const response = await getClient().chat.completions.create({
      model: "gpt-4o",
      max_tokens: 4096,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: buildSystemPrompt(roomType, budget) },
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
              text: "Analyze this room and select 6 products per style from the catalog. Return only valid JSON.",
            },
          ],
        },
      ],
    });

    const text = response.choices[0]?.message?.content;
    if (!text) throw new Error("No text response from OpenAI");

    const raw = JSON.parse(text) as RawAnalysis;

    if (!raw.styles || raw.styles.length !== 3) {
      throw new Error("Invalid response: expected 3 styles");
    }
    for (const style of raw.styles) {
      if (!style.selections || style.selections.length < 4) {
        throw new Error(`Too few selections for style ${style.name}`);
      }
      if (!style.colors || style.colors.length !== 3) {
        throw new Error(`Missing colors for style ${style.name}`);
      }
    }

    return expandSelections(raw);
  };

  try {
    return await makeRequest();
  } catch (firstError) {
    if (
      firstError instanceof Error &&
      (firstError.message.includes("JSON") ||
        firstError.message.includes("Invalid response") ||
        firstError.message.includes("Too few"))
    ) {
      return await makeRequest();
    }
    throw firstError;
  }
}

export function formatPrice(price: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(price);
}

// Keep these for any legacy use
export function buildAmazonUrl(productName: string): string {
  return `https://www.amazon.in/s?k=${encodeURIComponent(productName)}`;
}
export function buildFlipkartUrl(productName: string): string {
  return `https://www.flipkart.com/search?q=${encodeURIComponent(productName)}`;
}
