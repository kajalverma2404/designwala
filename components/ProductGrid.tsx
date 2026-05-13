"use client";

import { Product, formatPrice } from "@/lib/claude";

interface ProductGridProps {
  products: Product[];
}

const CATEGORY_ICONS: Record<string, string> = {
  Bed: "🛏️",
  Sofa: "🛋️",
  Chair: "🪑",
  "Dining Table": "🍽️",
  "Coffee Table": "☕",
  "Side Table": "🪵",
  "TV Unit": "📺",
  Shelving: "📚",
  Dresser: "🪞",
  Lighting: "💡",
  Curtains: "🪟",
  Rug: "🏠",
  Cushion: "🛋️",
  Bedding: "🛏️",
  Mattress: "😴",
  Plants: "🪴",
  "Wall Art": "🖼️",
  Decor: "✨",
  "Spiritual Decor": "🙏",
};

const BRAND_STYLES: Record<string, { bg: string; label: string }> = {
  IKEA: { bg: "bg-[#0058A3] hover:bg-[#004e91]", label: "View on IKEA" },
  Amazon: { bg: "bg-[#FF9900] hover:bg-[#e68a00]", label: "View on Amazon" },
  Pepperfry: { bg: "bg-[#F15A22] hover:bg-[#d44d1a]", label: "View on Pepperfry" },
  "Urban Ladder": { bg: "bg-[#2D6A4F] hover:bg-[#245a43]", label: "View on Urban Ladder" },
  Fabindia: { bg: "bg-[#8B1A1A] hover:bg-[#7a1616]", label: "View on Fabindia" },
  WoodenStreet: { bg: "bg-[#6B3A2A] hover:bg-[#5c3023]", label: "View on WoodenStreet" },
  Wakefit: { bg: "bg-[#7B2D8B] hover:bg-[#6a2678]", label: "View on Wakefit" },
  Flipkart: { bg: "bg-[#2874F0] hover:bg-[#1f63d4]", label: "View on Flipkart" },
};

export default function ProductGrid({ products }: ProductGridProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {products.map((product) => {
        const brandStyle = BRAND_STYLES[product.brand] ?? {
          bg: "bg-gray-700 hover:bg-gray-800",
          label: "View Product",
        };

        return (
          <div
            key={product.id}
            className="relative bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow p-4 flex flex-col"
          >
            <div className="relative flex flex-col flex-1">
              <span className="absolute top-0 right-0 text-2xl opacity-70">
                {CATEGORY_ICONS[product.category] ?? "🏡"}
              </span>

              {/* Brand + Category */}
              <div className="flex items-center gap-2 mb-3">
                <span className="text-xs bg-orange-50 text-[#FF9933] font-semibold px-2.5 py-0.5 rounded-full capitalize">
                  {product.category}
                </span>
                <span className="text-xs text-gray-400 font-medium">
                  {product.brand}
                </span>
              </div>

              {/* Product name */}
              <h4 className="font-bold text-gray-900 text-sm leading-snug mb-0.5">
                {product.name}
              </h4>
              <p className="text-xs text-[#006D77] font-medium mb-2">
                {product.name_hi}
              </p>

              {/* Why this fits */}
              <p className="text-xs text-gray-500 leading-relaxed flex-1">
                {product.reason}
              </p>

              {/* Price + CTA */}
              <div className="mt-3 pt-3 border-t border-gray-50 flex items-center justify-between gap-3">
                <p className="text-lg font-black text-gray-900 shrink-0">
                  {formatPrice(product.price_inr)}
                </p>
                <a
                  href={product.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`flex-1 flex items-center justify-center gap-1.5 ${brandStyle.bg} text-white text-xs font-bold py-2 px-3 rounded-xl transition-colors`}
                >
                  <span>↗</span>
                  <span>{brandStyle.label}</span>
                </a>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
