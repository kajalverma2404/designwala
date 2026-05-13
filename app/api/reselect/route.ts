import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import { PRODUCT_CATALOG, getProductById } from "@/lib/products";
import { Product, formatPrice } from "@/lib/claude";

let _client: OpenAI | null = null;
function getClient(): OpenAI {
  if (!_client) _client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  return _client;
}

export async function POST(req: NextRequest) {
  try {
    const { styleName, maxBudget, styleDescription } = await req.json();

    if (!styleName || !maxBudget) {
      return NextResponse.json({ error: "styleName and maxBudget are required" }, { status: 400 });
    }

    // Filter catalog to products within budget
    const inBudget = PRODUCT_CATALOG.filter((p) => p.price_inr <= maxBudget);
    const catalog = (inBudget.length >= 8 ? inBudget : PRODUCT_CATALOG)
      .map((p) => `[${p.id}] ${p.name} | ${p.brand} | ₹${p.price_inr.toLocaleString("en-IN")} | ${p.category} | ${p.description}`)
      .join("\n");

    const budgetLabel = new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(maxBudget);

    const prompt = `You are an expert Indian interior designer selecting products for a ${styleName} room redesign.
Budget: max ${budgetLabel} total across all 6 products.
${styleDescription ? `Style vision: ${styleDescription}` : ""}

From the catalog below, pick exactly 6 products that best suit this style within budget. Cover diverse categories.

CATALOG:
${catalog}

Respond ONLY with valid JSON:
{ "selections": [ { "product_id": string, "reason": string } ] }`;

    const response = await getClient().chat.completions.create({
      model: "gpt-4o",
      max_tokens: 1024,
      response_format: { type: "json_object" },
      messages: [{ role: "user", content: prompt }],
    });

    const text = response.choices[0]?.message?.content;
    if (!text) throw new Error("No response");

    const { selections } = JSON.parse(text) as {
      selections: { product_id: string; reason: string }[];
    };

    const products: Product[] = selections
      .map((sel) => {
        const item = getProductById(sel.product_id);
        if (!item) return null;
        return {
          id: item.id,
          name: item.name,
          name_hi: item.name_hi,
          brand: item.brand,
          category: item.category,
          price_inr: item.price_inr,
          url: item.url,
          reason: sel.reason,
        } satisfies Product;
      })
      .filter((p): p is Product => p !== null);

    return NextResponse.json({ products });
  } catch (error) {
    console.error("Reselect error:", error);
    return NextResponse.json({ error: "Failed to reselect products" }, { status: 500 });
  }
}
