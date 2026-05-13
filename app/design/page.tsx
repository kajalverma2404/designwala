"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

type HistoryEntry = {
  id: number;
  styleName: string;
  timestamp: string;
  thumbnail: string | null;
};

function resizeForStorage(dataUrl: string, maxWidth: number): Promise<string> {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      const scale = Math.min(1, maxWidth / img.width);
      const canvas = document.createElement("canvas");
      canvas.width = Math.round(img.width * scale);
      canvas.height = Math.round(img.height * scale);
      canvas.getContext("2d")!.drawImage(img, 0, 0, canvas.width, canvas.height);
      resolve(canvas.toDataURL("image/jpeg", 0.7));
    };
    img.onerror = () => resolve(dataUrl); // fallback to original if decode fails
    img.src = dataUrl;
  });
}

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ACCEPTED_TYPES = ["image/jpeg", "image/png", "image/webp"];

export default function DesignPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [roomType, setRoomType] = useState("Living Room");
  const [maxBudget, setMaxBudget] = useState(50000);
  const [history, setHistory] = useState<HistoryEntry[]>([]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const raw = localStorage.getItem("designHistory");
      if (raw) {
        const parsed: HistoryEntry[] = JSON.parse(raw);
        // Most recent first, cap at 3
        setHistory(parsed.slice(-3).reverse());
      }
    } catch {
      // Ignore parse errors
    }
  }, []);

  const clearHistory = () => {
    if (typeof window === "undefined") return;
    localStorage.removeItem("designHistory");
    setHistory([]);
  };

  const validateAndSetFile = (f: File) => {
    setError(null);
    if (!ACCEPTED_TYPES.includes(f.type)) {
      setError("Only JPG, PNG, or WebP images are supported.");
      return;
    }
    if (f.size > MAX_FILE_SIZE) {
      setError("Image must be under 5MB. Please compress and try again.");
      return;
    }
    setFile(f);
    const reader = new FileReader();
    reader.onload = (e) => setPreview(e.target?.result as string);
    reader.readAsDataURL(f);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) validateAndSetFile(f);
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const f = e.dataTransfer.files?.[0];
    if (f) validateAndSetFile(f);
  }, []);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => setIsDragging(false);

  const handleSubmit = async () => {
    if (!file || !preview) return;
    setIsLoading(true);
    setError(null);

    try {
      const base64 = preview.split(",")[1];
      const mimeType = file.type as "image/jpeg" | "image/png" | "image/webp";

      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageBase64: base64, mimeType, roomType, budget: maxBudget }),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.error || "Something went wrong. Please try again.");
      }

      const data = await response.json();
      sessionStorage.setItem("designAnalysis", JSON.stringify(data));
      // Store a downsized thumbnail (600px wide) to stay within sessionStorage quota
      const thumbnail = await resizeForStorage(preview, 600);
      try {
        sessionStorage.setItem("roomImage", thumbnail);
      } catch {
        // If still too large, skip the thumbnail — results page handles null
        sessionStorage.removeItem("roomImage");
      }
      router.push("/results");
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Network error. Please check your connection."
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-white rangoli-pattern">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-orange-100">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <span className="text-2xl">🏡</span>
            <span className="font-bold text-xl text-gray-900">
              Design<span className="text-[#FF9933]">Wala</span>
            </span>
          </Link>
        </div>
      </header>

      <div className="max-w-2xl mx-auto px-4 py-12">
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-black text-gray-900 mb-2">
            Apna Room Upload Karo
          </h1>
          <p className="text-[#006D77] font-medium">Upload Your Room</p>
          <p className="text-gray-500 text-sm mt-2">
            Best results with a well-lit, clear photo of your {roomType.toLowerCase()}
          </p>
        </div>

        {/* Recent Designs History */}
        {history.length > 0 && (
          <div className="mb-8">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm font-bold text-gray-700">
                Recent Designs · हाल के डिज़ाइन
              </p>
              <button
                type="button"
                onClick={clearHistory}
                className="text-xs text-gray-400 hover:text-gray-600 transition-colors"
              >
                Clear history
              </button>
            </div>

            {/* Cards: horizontal scroll on mobile, 3-col grid on desktop */}
            <div className="flex gap-3 overflow-x-auto pb-1 md:grid md:grid-cols-3 md:overflow-visible md:pb-0">
              {history.map((entry) => (
                <div
                  key={entry.id}
                  className="rounded-2xl bg-white border border-gray-100 shadow-sm overflow-hidden flex-shrink-0 w-40 md:w-auto"
                >
                  {entry.thumbnail ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={entry.thumbnail}
                      alt={entry.styleName}
                      className="w-full h-24 object-cover"
                    />
                  ) : (
                    <div className="w-full h-24 bg-gray-100 flex items-center justify-center text-3xl">
                      🏡
                    </div>
                  )}
                  <div className="p-2">
                    <p className="text-xs font-bold text-gray-800 truncate">
                      {entry.styleName}
                    </p>
                    <p className="text-xs text-gray-400">
                      {new Date(entry.timestamp).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "short",
                      })}
                    </p>
                    {entry.thumbnail && (
                      <button
                        type="button"
                        onClick={() => {
                          setPreview(entry.thumbnail);
                          setFile(null);
                        }}
                        className="mt-1 text-xs text-[#006D77] hover:underline font-medium"
                      >
                        View Again →
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Separator */}
            <div className="mt-6 flex items-center gap-3">
              <div className="flex-1 h-px bg-gray-200" />
              <span className="text-xs text-gray-400 whitespace-nowrap">
                or start fresh below
              </span>
              <div className="flex-1 h-px bg-gray-200" />
            </div>
          </div>
        )}

        {/* Upload Zone */}
        {!preview ? (
          <div
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onClick={() => fileInputRef.current?.click()}
            className={`
              relative border-2 border-dashed rounded-3xl p-12 text-center cursor-pointer
              transition-all duration-200
              ${isDragging
                ? "border-[#FF9933] bg-orange-50 scale-[1.01]"
                : "border-gray-200 hover:border-[#FF9933] hover:bg-orange-50/30"
              }
            `}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={handleFileChange}
              className="hidden"
            />
            <div className="flex flex-col items-center gap-4">
              <div className="w-20 h-20 bg-orange-50 rounded-2xl flex items-center justify-center">
                <span className="text-4xl">📸</span>
              </div>
              <div>
                <p className="font-bold text-gray-800 text-lg">
                  Photo Drag karo ya Click karo
                </p>
                <p className="text-gray-500 text-sm mt-1">
                  Drag & drop or click to browse
                </p>
              </div>
              <div className="flex flex-wrap gap-2 justify-center">
                {["JPG", "PNG", "WebP"].map((fmt) => (
                  <span
                    key={fmt}
                    className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full"
                  >
                    {fmt}
                  </span>
                ))}
                <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
                  Max 5MB
                </span>
              </div>
            </div>
          </div>
        ) : (
          <div className="rounded-3xl overflow-hidden border border-gray-100 shadow-sm">
            <div className="relative">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={preview}
                alt="Your room"
                className="w-full object-cover max-h-80"
              />
              <button
                onClick={() => {
                  setPreview(null);
                  setFile(null);
                  setError(null);
                }}
                className="absolute top-3 right-3 bg-white/90 hover:bg-white text-gray-700 rounded-full w-8 h-8 flex items-center justify-center shadow-sm transition-colors text-sm font-bold"
              >
                ✕
              </button>
            </div>
            <div className="p-4 bg-green-50 border-t border-green-100 flex items-center gap-2">
              <span className="text-green-600">✓</span>
              <span className="text-sm text-green-700 font-medium">
                Photo ready — {(file!.size / 1024).toFixed(0)} KB
              </span>
            </div>
          </div>
        )}

        {error && (
          <div className="mt-4 p-4 bg-red-50 border border-red-100 rounded-2xl flex gap-3 items-start">
            <span className="text-red-500 mt-0.5">⚠</span>
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        {/* Tips */}
        <div className="mt-6 p-4 bg-blue-50 rounded-2xl border border-blue-100">
          <p className="text-xs font-bold text-blue-800 mb-2 uppercase tracking-wide">
            Photo Tips · फोटो Tips
          </p>
          <ul className="space-y-1">
            {[
              "Take from a corner to show the full room",
              "Good lighting gives better AI results",
              "Include main furniture in the frame",
            ].map((tip) => (
              <li key={tip} className="text-xs text-blue-700 flex gap-2">
                <span>•</span>
                <span>{tip}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Room Type Selector */}
        <div className="mt-6">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-2">
            Room Type
          </p>
          <div className="flex flex-wrap gap-2">
            {[
              { label: "🛋️ Living Room", value: "Living Room" },
              { label: "🛏️ Bedroom", value: "Bedroom" },
              { label: "🍽️ Dining Room", value: "Dining Room" },
              { label: "🏠 Home Office", value: "Home Office" },
            ].map(({ label, value }) => (
              <button
                key={value}
                type="button"
                onClick={() => setRoomType(value)}
                className={`
                  px-4 py-2 rounded-full text-sm font-medium transition-all
                  ${roomType === value
                    ? "bg-orange-50 text-[#FF9933] border border-[#FF9933]"
                    : "bg-gray-100 text-gray-600 border border-transparent hover:bg-gray-200"
                  }
                `}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Budget Slider */}
        <div className="mt-4">
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wide">
              Max Budget · अधिकतम बजट
            </p>
            <span className="text-base font-black text-[#FF9933]">
              {new Intl.NumberFormat("en-IN", {
                style: "currency",
                currency: "INR",
                maximumFractionDigits: 0,
              }).format(maxBudget)}
            </span>
          </div>

          {/* Slider */}
          <input
            type="range"
            min={5000}
            max={300000}
            step={5000}
            value={maxBudget}
            onChange={(e) => setMaxBudget(Number(e.target.value))}
            className="w-full h-2 rounded-full appearance-none cursor-pointer"
            style={{
              background: `linear-gradient(to right, #FF9933 0%, #FF9933 ${((maxBudget - 5000) / (300000 - 5000)) * 100}%, #e5e7eb ${((maxBudget - 5000) / (300000 - 5000)) * 100}%, #e5e7eb 100%)`,
            }}
          />

          {/* − / + controls and range labels */}
          <div className="flex items-center justify-between mt-2">
            <span className="text-xs text-gray-400">₹5,000</span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setMaxBudget((v) => Math.max(5000, v - 5000))}
                className="w-7 h-7 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600 font-bold text-base flex items-center justify-center transition-colors"
              >
                −
              </button>
              <button
                type="button"
                onClick={() => setMaxBudget((v) => Math.min(300000, v + 5000))}
                className="w-7 h-7 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600 font-bold text-base flex items-center justify-center transition-colors"
              >
                +
              </button>
            </div>
            <span className="text-xs text-gray-400">₹3,00,000</span>
          </div>

          {/* Quick presets */}
          <div className="flex gap-2 mt-3">
            {[10000, 25000, 50000, 100000, 200000].map((v) => (
              <button
                key={v}
                type="button"
                onClick={() => setMaxBudget(v)}
                className={`flex-1 text-xs py-1.5 rounded-lg font-medium transition-all ${
                  maxBudget === v
                    ? "bg-orange-50 text-[#FF9933] border border-[#FF9933]"
                    : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                }`}
              >
                {v >= 100000 ? `₹${v / 100000}L` : `₹${v / 1000}k`}
              </button>
            ))}
          </div>
        </div>

        {/* Submit */}
        <button
          onClick={handleSubmit}
          disabled={!file || isLoading}
          className={`
            mt-6 w-full py-4 rounded-2xl font-bold text-lg transition-all
            flex items-center justify-center gap-3
            ${file && !isLoading
              ? "bg-[#FF9933] hover:bg-[#e8851a] text-white shadow-lg shadow-orange-200 hover:-translate-y-0.5"
              : "bg-gray-100 text-gray-400 cursor-not-allowed"
            }
          `}
        >
          {isLoading ? (
            <>
              <span className="flicker">🪔</span>
              <span>Design ban raha hai…</span>
            </>
          ) : (
            <>
              <span>✨</span>
              <span>
                Design Shuru Karo
                <span className="block text-sm font-normal">
                  Start designing
                </span>
              </span>
            </>
          )}
        </button>

        {isLoading && (
          <div className="mt-4 text-center">
            <p className="text-xs text-gray-400">
              This takes 15–30 seconds · कृपया प्रतीक्षा करें
            </p>
            <div className="mt-3 flex gap-1.5 justify-center">
              {["Modern Indian", "Minimalist", "Vastu-Optimized"].map(
                (style, i) => (
                  <div
                    key={style}
                    className="flex items-center gap-1 text-xs text-gray-500"
                  >
                    {i > 0 && <span className="text-gray-300">·</span>}
                    <span
                      className="animate-pulse bg-gray-200 text-gray-200 inline-block px-2 py-0.5 rounded-full"
                    >
                      {style}
                    </span>
                  </div>
                )
              )}
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
