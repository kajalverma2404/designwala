"use client";

import { DesignStyle } from "@/lib/claude";

interface StyleCardProps {
  style: DesignStyle;
  index: number;
  isActive: boolean;
  onClick: () => void;
}

const STYLE_META: Record<
  string,
  { emoji: string; hi: string; accentClass: string }
> = {
  "Modern Indian": {
    emoji: "🪔",
    hi: "आधुनिक भारतीय",
    accentClass: "bg-orange-500",
  },
  Minimalist: {
    emoji: "🤍",
    hi: "मिनिमलिस्ट",
    accentClass: "bg-gray-800",
  },
  "Vastu-Optimized": {
    emoji: "🧿",
    hi: "वास्तु अनुकूल",
    accentClass: "bg-teal-600",
  },
};

export default function StyleCard({
  style,
  index,
  isActive,
  onClick,
}: StyleCardProps) {
  const meta = STYLE_META[style.name] ?? {
    emoji: "✨",
    hi: style.name,
    accentClass: "bg-[#FF9933]",
  };

  return (
    <button
      onClick={onClick}
      className={`
        w-full text-left rounded-2xl border-2 p-5 transition-all duration-200
        ${isActive
          ? "border-[#FF9933] shadow-lg shadow-orange-100 bg-white"
          : "border-gray-100 hover:border-orange-200 bg-white hover:shadow-sm"
        }
      `}
    >
      <div className="flex items-start gap-3">
        <div
          className={`
            shrink-0 w-10 h-10 rounded-xl flex items-center justify-center text-lg
            ${isActive ? "bg-orange-50" : "bg-gray-50"}
          `}
        >
          {meta.emoji}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5">
            <span className="text-xs font-bold text-[#FF9933] uppercase tracking-wide">
              Style {String(index + 1).padStart(2, "0")}
            </span>
            {isActive && (
              <span className="text-xs bg-orange-100 text-orange-600 px-1.5 py-0.5 rounded-full font-medium">
                Active
              </span>
            )}
          </div>
          <h3 className="font-bold text-gray-900">{style.name}</h3>
          <p className="text-xs text-[#006D77] font-medium">{meta.hi}</p>
        </div>
      </div>

      {/* Always show a one-line description peek for inactive cards */}
      {!isActive && (
        <p className="mt-2 text-xs text-gray-400 line-clamp-1 pl-[52px]">
          {style.description}
        </p>
      )}

      {isActive && (
        <>
          <p className="mt-3 text-sm text-gray-600 leading-relaxed line-clamp-3">
            {style.description}
          </p>

          {/* Color palette — compact row */}
          <div className="mt-3 flex items-center gap-2">
            <span className="text-xs text-gray-400 font-semibold uppercase tracking-wide shrink-0">
              Palette
            </span>
            <div className="flex gap-1.5">
              {style.colors.map((color, i) => (
                <div
                  key={i}
                  title={color.toUpperCase()}
                  className="w-6 h-6 rounded-lg shadow-sm border border-white/20 cursor-default"
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
            <span className="text-xs text-gray-400 font-mono ml-1">
              {style.colors[0]?.toUpperCase()}
            </span>
          </div>

          {/* Vastu tip callout */}
          {style.name === "Vastu-Optimized" && (
            <div className="mt-4 p-3 bg-teal-50 rounded-xl border border-teal-100 flex gap-2">
              <span className="text-lg shrink-0">🧿</span>
              <div>
                <p className="text-xs font-bold text-teal-800 mb-0.5">
                  Vastu Tip · वास्तु टिप
                </p>
                <p className="text-xs text-teal-700 leading-relaxed">
                  This layout follows Vastu Shastra principles to improve
                  positive energy flow and bring harmony to your home.
                </p>
              </div>
            </div>
          )}
        </>
      )}
    </button>
  );
}
