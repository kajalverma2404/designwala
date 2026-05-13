"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { DesignAnalysis, formatPrice } from "@/lib/claude";
import StyleCard from "@/components/StyleCard";
import ProductGrid from "@/components/ProductGrid";
import WhatsAppShare from "@/components/WhatsAppShare";
import ComparisonSlider from "@/components/ComparisonSlider";
import LoadingDiya from "@/components/LoadingDiya";

type VizState = "idle" | "loading" | "done" | "error";

interface VizEntry {
  state: VizState;
  dataUrl: string | null;
}

// Short display names + emojis for the mobile bottom tab bar
const MOBILE_TAB_META = [
  { emoji: "🪔", short: "Indian" },
  { emoji: "🤍", short: "Minimal" },
  { emoji: "🧿", short: "Vastu" },
];

// Save a design history entry to localStorage (max 5 entries)
function saveHistoryEntry(
  styleName: string,
  thumbnail: string | null
): void {
  try {
    const raw = localStorage.getItem("designHistory");
    const history: Array<{
      id: number;
      styleName: string;
      timestamp: string;
      thumbnail: string | null;
    }> = raw ? JSON.parse(raw) : [];

    const entry = {
      id: Date.now(),
      styleName,
      timestamp: new Date().toISOString(),
      thumbnail,
    };

    // Prepend new entry, keep max 5
    const updated = [entry, ...history].slice(0, 5);
    localStorage.setItem("designHistory", JSON.stringify(updated));
  } catch {
    // localStorage may be unavailable in SSR or restricted contexts — ignore
  }
}

export default function ResultsPage() {
  const router = useRouter();
  const [analysis, setAnalysis] = useState<DesignAnalysis | null>(null);
  const [roomImage, setRoomImage] = useState<string | null>(null);
  const [activeStyle, setActiveStyle] = useState(0);
  const [maxBudget, setMaxBudget] = useState(50000);
  // Per-style product overrides when user re-fetches with a custom budget
  const [styleProducts, setStyleProducts] = useState<Record<number, DesignAnalysis["styles"][0]["products"]>>({});
  const [reselecting, setReselecting] = useState(false);
  const [reselectError, setReselectError] = useState<string | null>(null);
  const [viz, setViz] = useState<VizEntry[]>([
    { state: "idle", dataUrl: null },
    { state: "idle", dataUrl: null },
    { state: "idle", dataUrl: null },
  ]);

  // Track whether history has been saved (once per page load)
  const historySaved = useRef(false);

  useEffect(() => {
    const stored = sessionStorage.getItem("designAnalysis");
    const img = sessionStorage.getItem("roomImage");
    if (!stored) {
      router.replace("/design");
      return;
    }
    try {
      const parsed = JSON.parse(stored) as DesignAnalysis;
      setAnalysis(parsed);
      setRoomImage(img);

      // Save history entry once after loading (use first style name as label)
      if (!historySaved.current) {
        historySaved.current = true;
        saveHistoryEntry(parsed.styles[0]?.name ?? "Design", img);
      }
    } catch {
      router.replace("/design");
    }
  }, [router]);

  const fetchViz = useCallback(
    async (index: number, styles: DesignAnalysis["styles"], thumbnail: string) => {
      setViz((prev) => {
        const next = [...prev];
        next[index] = { state: "loading", dataUrl: null };
        return next;
      });

      try {
        const style = styles[index];
        const base64 = thumbnail.split(",")[1];

        const res = await fetch("/api/visualize", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            imageBase64: base64,
            mimeType: "image/jpeg",
            styleName: style.name,
            styleDescription: style.description,
            colors: style.colors,
          }),
        });

        if (!res.ok) throw new Error("API error");
        const data = await res.json();
        const dataUrl = `data:image/png;base64,${data.imageBase64}`;

        setViz((prev) => {
          const next = [...prev];
          next[index] = { state: "done", dataUrl };
          return next;
        });
      } catch {
        setViz((prev) => {
          const next = [...prev];
          next[index] = { state: "error", dataUrl: null };
          return next;
        });
      }
    },
    []
  );

  // Trigger visualization when style becomes active and hasn't been fetched yet
  useEffect(() => {
    if (!analysis || !roomImage) return;
    if (viz[activeStyle].state === "idle") {
      fetchViz(activeStyle, analysis.styles, roomImage);
    }
  }, [activeStyle, analysis, roomImage, viz, fetchViz]);

  const handleReselect = useCallback(async () => {
    if (!analysis) return;
    setReselecting(true);
    setReselectError(null);
    const style = analysis.styles[activeStyle];
    try {
      const res = await fetch("/api/reselect", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          styleName: style.name,
          maxBudget,
          styleDescription: style.description,
        }),
      });
      if (!res.ok) throw new Error("Failed");
      const data = await res.json();
      setStyleProducts((prev) => ({ ...prev, [activeStyle]: data.products }));
    } catch {
      setReselectError("Could not fetch products. Please try again.");
    } finally {
      setReselecting(false);
    }
  }, [analysis, activeStyle, maxBudget]);

  // Download design as JPEG using canvas
  const handleDownload = useCallback(async () => {
    if (!analysis || !currentVizRef.current) return;
    const currentViz = currentVizRef.current;
    if (currentViz.state !== "done" || !currentViz.dataUrl) return;
    if (!currentStyleRef.current) return;

    const style = currentStyleRef.current;
    const products = style.products.slice(0, 3);

    const canvas = document.createElement("canvas");
    const W = 1080;
    const H = 1350;
    canvas.width = W;
    canvas.height = H;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Background
    ctx.fillStyle = "#FAFAF9";
    ctx.fillRect(0, 0, W, H);

    // Load AI image
    const loadImage = (src: string) =>
      new Promise<HTMLImageElement>((resolve, reject) => {
        const img = new Image();
        img.crossOrigin = "anonymous";
        img.onload = () => resolve(img);
        img.onerror = reject;
        img.src = src;
      });

    try {
      const aiImg = await loadImage(currentViz.dataUrl);

      // Draw AI image (top portion)
      const imgH = Math.round(H * 0.52);
      ctx.save();
      ctx.beginPath();
      ctx.roundRect(24, 24, W - 48, imgH - 24, 20);
      ctx.clip();
      ctx.drawImage(aiImg, 24, 24, W - 48, imgH - 24);
      ctx.restore();

      // Gradient overlay at bottom of image for readability
      const grad = ctx.createLinearGradient(0, imgH - 120, 0, imgH);
      grad.addColorStop(0, "rgba(0,0,0,0)");
      grad.addColorStop(1, "rgba(0,0,0,0.45)");
      ctx.save();
      ctx.beginPath();
      ctx.roundRect(24, imgH - 120, W - 48, 120, [0, 0, 20, 20]);
      ctx.fillStyle = grad;
      ctx.fill();
      ctx.restore();

      // Style name on image
      ctx.fillStyle = "#FFFFFF";
      ctx.font = "bold 44px system-ui, sans-serif";
      ctx.fillText(style.name, 48, imgH - 36);

      // Section: Products
      const productsY = imgH + 20;
      ctx.fillStyle = "#111827";
      ctx.font = "bold 36px system-ui, sans-serif";
      ctx.fillText("Top Picks · बेहतरीन प्रोडक्ट्स", 36, productsY + 40);

      products.forEach((p, i) => {
        const yBase = productsY + 70 + i * 120;

        // Card background
        ctx.fillStyle = "#FFFFFF";
        ctx.save();
        ctx.beginPath();
        ctx.roundRect(24, yBase, W - 48, 108, 14);
        ctx.shadowColor = "rgba(0,0,0,0.06)";
        ctx.shadowBlur = 10;
        ctx.fill();
        ctx.restore();

        // Product name
        ctx.fillStyle = "#111827";
        ctx.font = "bold 28px system-ui, sans-serif";
        const nameText =
          p.name.length > 38 ? p.name.slice(0, 36) + "…" : p.name;
        ctx.fillText(nameText, 48, yBase + 38);

        // Hindi name
        ctx.fillStyle = "#006D77";
        ctx.font = "500 22px system-ui, sans-serif";
        const hiText =
          p.name_hi.length > 42 ? p.name_hi.slice(0, 40) + "…" : p.name_hi;
        ctx.fillText(hiText, 48, yBase + 68);

        // Price (right aligned)
        ctx.fillStyle = "#111827";
        ctx.font = "bold 30px system-ui, sans-serif";
        const priceStr = formatPrice(p.price_inr);
        const priceW = ctx.measureText(priceStr).width;
        ctx.fillText(priceStr, W - 48 - priceW, yBase + 68);
      });

      // Branding footer bar
      const footerY = H - 80;
      ctx.fillStyle = "#FF9933";
      ctx.fillRect(0, footerY, W, 80);

      ctx.fillStyle = "#FFFFFF";
      ctx.font = "bold 36px system-ui, sans-serif";
      ctx.fillText("🏡 DesignWala", 36, footerY + 52);

      ctx.font = "500 24px system-ui, sans-serif";
      ctx.fillStyle = "rgba(255,255,255,0.85)";
      const tagline = "AI Interior Design · designwala.in";
      const tagW = ctx.measureText(tagline).width;
      ctx.fillText(tagline, W - 36 - tagW, footerY + 52);

      // Trigger download
      const url = canvas.toDataURL("image/jpeg", 0.9);
      const a = document.createElement("a");
      a.href = url;
      a.download = `designwala-${style.name.toLowerCase().replace(/\s+/g, "-")}.jpg`;
      a.click();
    } catch {
      // If image loading fails (CORS etc.) silently ignore
    }
  }, [analysis]);

  // Refs so the download handler always has the latest values without stale closure issues
  const currentVizRef = useRef<VizEntry | null>(null);
  const currentStyleRef = useRef<DesignAnalysis["styles"][0] | null>(null);

  if (!analysis) {
    return (
      <main className="min-h-screen bg-white flex items-center justify-center">
        <LoadingDiya
          size="lg"
          message="Aapka design load ho raha hai…"
          subMessage="Loading your design plan"
        />
      </main>
    );
  }

  const currentStyle = analysis.styles[activeStyle];
  const currentViz = viz[activeStyle];
  // Use re-fetched products if available, otherwise fall back to AI originals
  const displayedProducts = styleProducts[activeStyle] ?? currentStyle.products;

  // Keep refs in sync with render values
  currentVizRef.current = currentViz;
  currentStyleRef.current = currentStyle;

  const downloadReady = currentViz.state === "done" && !!currentViz.dataUrl;

  return (
    // Add pb-16 on mobile to prevent the sticky bottom tab bar from overlapping content
    <main className="min-h-screen bg-gray-50 pb-16 md:pb-0">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-orange-100">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <span className="text-2xl">🏡</span>
            <span className="font-bold text-xl text-gray-900">
              Design<span className="text-[#FF9933]">Wala</span>
            </span>
          </Link>
          <Link
            href="/design"
            className="text-sm text-[#FF9933] font-semibold hover:underline"
          >
            ← Naya Design
          </Link>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Page heading */}
        <div className="mb-6">
          <div className="inline-flex items-center gap-2 bg-green-50 text-green-700 text-xs font-semibold px-3 py-1 rounded-full mb-3 border border-green-100">
            <span>✓</span>
            <span>Design Ready! · डिज़ाइन तैयार है!</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-black text-gray-900">
            Aapka Design Plan
          </h1>
          <p className="text-[#006D77] font-medium text-sm">
            Your Personalized Design Plan
          </p>
        </div>

        <div className="grid lg:grid-cols-[320px,1fr] gap-6">
          {/* Left sidebar: style selector */}
          <aside className="space-y-3 lg:sticky lg:top-16 lg:self-start lg:max-h-[calc(100vh-5rem)] lg:overflow-y-auto lg:pr-1">
            {/* Room photo thumbnail */}
            {roomImage && (
              <div className="rounded-2xl overflow-hidden border border-gray-100 shadow-sm">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={roomImage}
                  alt="Your room"
                  className="w-full object-cover max-h-48"
                />
                <div className="px-3 py-2 bg-white border-t border-gray-50">
                  <p className="text-xs text-gray-500 font-medium">
                    Aapka Room · Your Room
                  </p>
                </div>
              </div>
            )}

            <div>
              <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-2 px-1">
                Design Styles
              </p>
              {analysis.styles.map((style, i) => (
                <div key={style.name} className="mb-2">
                  <StyleCard
                    style={style}
                    index={i}
                    isActive={activeStyle === i}
                    onClick={() => setActiveStyle(i)}
                  />
                </div>
              ))}
            </div>

            {/* Action buttons: WhatsApp share + Download */}
            <div className="pt-2 flex flex-col gap-2">
              <WhatsAppShare style={currentStyle} />

              {/* Download button */}
              <div title={downloadReady ? undefined : "Generate visualization first · पहले विज़ुअलाइज़ेशन बनाएं"}>
                <button
                  onClick={downloadReady ? handleDownload : undefined}
                  disabled={!downloadReady}
                  className={`
                    w-full inline-flex items-center justify-center gap-2 font-bold text-sm px-5 py-2.5 rounded-xl transition-colors shadow-sm
                    ${downloadReady
                      ? "bg-[#006D77] hover:bg-[#005a63] text-white cursor-pointer"
                      : "bg-gray-100 text-gray-400 cursor-not-allowed"
                    }
                  `}
                >
                  <span>📥</span>
                  <span>Download · डाउनलोड करें</span>
                </button>
              </div>
            </div>
          </aside>

          {/* Main content */}
          <section>
            {/* AI Visualization */}
            <div className="mb-6 rounded-2xl overflow-hidden border border-gray-100 shadow-sm bg-white">
              <div className="flex items-center justify-between px-4 pt-4 pb-2">
                <div>
                  <p className="font-bold text-gray-900 text-sm">
                    AI Redesign · {currentStyle.name}
                  </p>
                  <p className="text-xs text-gray-400">
                    AI-generated visualization · एआई विज़ुअलाइज़ेशन
                  </p>
                </div>
                {currentViz.state === "loading" && (
                  <span className="flicker text-xl">🪔</span>
                )}
                {currentViz.state === "done" && (
                  <span className="text-xs bg-green-50 text-green-600 font-semibold px-2 py-0.5 rounded-full border border-green-100">
                    ✓ Generated
                  </span>
                )}
              </div>

              {/* Visualization image area */}
              {currentViz.state === "loading" && (
                <div className="shimmer w-full h-72 flex flex-col items-center justify-center gap-3">
                  <LoadingDiya
                    size="md"
                    message="Redesign ban raha hai…"
                    subMessage={`Generating your ${currentStyle.name} room (15–30 sec)`}
                  />
                </div>
              )}

              {currentViz.state === "done" && currentViz.dataUrl && (
                <div className="relative">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={currentViz.dataUrl}
                    alt={`${currentStyle.name} redesign`}
                    className="w-full object-cover max-h-96"
                  />
                  <div className="absolute bottom-3 right-3">
                    <span className="text-xs bg-black/60 text-white px-2 py-1 rounded-lg backdrop-blur-sm">
                      ✨ AI Concept · अवधारणा
                    </span>
                  </div>
                </div>
              )}

              {currentViz.state === "error" && (
                <div className="w-full h-40 flex flex-col items-center justify-center gap-2 bg-gray-50">
                  <p className="text-sm text-gray-400">
                    Visualization unavailable
                  </p>
                  <button
                    onClick={() =>
                      roomImage &&
                      fetchViz(activeStyle, analysis.styles, roomImage)
                    }
                    className="text-xs text-[#FF9933] font-semibold hover:underline"
                  >
                    Retry · फिर कोशिश करो
                  </button>
                </div>
              )}

              {currentViz.state === "idle" && (
                <div className="w-full h-40 flex items-center justify-center bg-gray-50">
                  <p className="text-sm text-gray-400">Preparing…</p>
                </div>
              )}

              {/* Before / After comparison slider (replaces thumbnail strip) */}
              {currentViz.state === "done" && roomImage && currentViz.dataUrl && (
                <div className="border-t border-gray-100">
                  <div className="px-4 py-2">
                    <p className="text-xs text-gray-500 font-semibold">
                      Drag to compare · खींचकर तुलना करें
                    </p>
                  </div>
                  <ComparisonSlider
                    beforeSrc={roomImage}
                    afterSrc={currentViz.dataUrl}
                    altBefore="Before · पहले"
                    altAfter="After · बाद में"
                  />
                </div>
              )}
            </div>

            {/* Product grid header */}
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-xl font-black text-gray-900">
                  {currentStyle.name} Products
                </h2>
                <p className="text-sm text-gray-500">
                  6 curated picks to bring this style to life ·{" "}
                  <span className="text-[#006D77]">6 बेहतरीन प्रोडक्ट्स</span>
                </p>
              </div>

              {/* Style tabs — desktop only */}
              <div className="hidden md:flex items-center gap-1 bg-gray-100 rounded-xl p-1">
                {analysis.styles.map((s, i) => (
                  <button
                    key={s.name}
                    onClick={() => setActiveStyle(i)}
                    className={`
                      text-xs font-semibold px-3 py-1.5 rounded-lg transition-all
                      ${activeStyle === i
                        ? "bg-white text-gray-900 shadow-sm"
                        : "text-gray-500 hover:text-gray-700"
                      }
                    `}
                  >
                    {s.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Budget slider — re-fetch products for this style */}
            <div className="mb-5 p-4 bg-white rounded-2xl border border-gray-100 shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <p className="text-xs font-bold text-gray-500 uppercase tracking-wide">
                    Budget · बजट
                  </p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    Set a budget and refetch products for this style
                  </p>
                </div>
                <span className="text-base font-black text-[#FF9933]">
                  {new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(maxBudget)}
                </span>
              </div>

              <input
                type="range"
                min={5000}
                max={300000}
                step={5000}
                value={maxBudget}
                onChange={(e) => setMaxBudget(Number(e.target.value))}
                className="w-full h-2 rounded-full appearance-none cursor-pointer mb-3"
                style={{
                  background: `linear-gradient(to right, #FF9933 0%, #FF9933 ${((maxBudget - 5000) / (300000 - 5000)) * 100}%, #e5e7eb ${((maxBudget - 5000) / (300000 - 5000)) * 100}%, #e5e7eb 100%)`,
                }}
              />

              <div className="flex items-center gap-2">
                <button onClick={() => setMaxBudget(v => Math.max(5000, v - 5000))}
                  className="w-7 h-7 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600 font-bold flex items-center justify-center shrink-0">−</button>
                <div className="flex gap-1.5 flex-1">
                  {[10000, 25000, 50000, 100000, 200000].map(v => (
                    <button key={v} onClick={() => setMaxBudget(v)}
                      className={`flex-1 text-xs py-1.5 rounded-lg font-medium transition-all ${maxBudget === v ? "bg-orange-50 text-[#FF9933] border border-[#FF9933]" : "bg-gray-100 text-gray-500 hover:bg-gray-200"}`}>
                      {v >= 100000 ? `₹${v/100000}L` : `₹${v/1000}k`}
                    </button>
                  ))}
                </div>
                <button onClick={() => setMaxBudget(v => Math.min(300000, v + 5000))}
                  className="w-7 h-7 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600 font-bold flex items-center justify-center shrink-0">+</button>
              </div>

              {reselectError && (
                <p className="text-xs text-red-500 mt-2">{reselectError}</p>
              )}

              <button
                onClick={handleReselect}
                disabled={reselecting}
                className={`mt-3 w-full py-2.5 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2 ${
                  reselecting
                    ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                    : "bg-[#FF9933] hover:bg-[#e8851a] text-white shadow-sm shadow-orange-200"
                }`}
              >
                {reselecting ? (
                  <><span className="flicker">🪔</span><span>Finding products…</span></>
                ) : (
                  <><span>🔍</span><span>Find Products for this Budget</span></>
                )}
              </button>
            </div>

            <ProductGrid products={displayedProducts} />

            {/* Total estimate */}
            <div className="mt-6 p-4 bg-white rounded-2xl border border-gray-100 shadow-sm flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Estimated Total</p>
                <p className="text-xs text-gray-400">
                  Sabhi 6 products · All 6 products
                </p>
              </div>
              <div className="text-right">
                <p className="text-xl font-black text-gray-900">
                  {new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(
                    displayedProducts.reduce((sum, p) => sum + p.price_inr, 0)
                  )}
                </p>
                <p className="text-xs text-gray-400">approx.</p>
              </div>
            </div>

            {/* Re-design CTA */}
            <div className="mt-6 p-5 bg-gradient-to-br from-[#FF9933] to-[#e8851a] rounded-2xl text-white">
              <p className="font-bold text-lg mb-1">Try Another Room?</p>
              <p className="text-orange-100 text-sm mb-3">
                दूसरा कमरा try करो · Free hai!
              </p>
              <Link
                href="/design"
                className="inline-flex items-center gap-2 bg-white text-[#FF9933] font-bold text-sm px-4 py-2 rounded-xl hover:bg-orange-50 transition-colors"
              >
                <span>📸</span>
                <span>Upload New Room</span>
              </Link>
            </div>
          </section>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-gray-100 py-6 px-4 text-center text-sm text-gray-400 mt-8">
        <p>
          <span className="font-semibold text-gray-700">
            Design<span className="text-[#FF9933]">Wala</span>
          </span>{" "}
          · Made with ❤️ for Indian homes · Powered by OpenAI
        </p>
      </footer>

      {/* Mobile bottom sticky tab bar — visible only on small screens */}
      <nav
        aria-label="Style switcher"
        className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-gray-100 shadow-lg flex md:hidden"
      >
        {analysis.styles.map((s, i) => {
          const meta = MOBILE_TAB_META[i] ?? { emoji: "✨", short: s.name };
          const isActive = activeStyle === i;
          return (
            <button
              key={s.name}
              onClick={() => setActiveStyle(i)}
              className={`
                flex-1 flex flex-col items-center justify-center py-2.5 gap-0.5 transition-colors
                ${isActive ? "text-[#FF9933]" : "text-gray-400 hover:text-gray-600"}
              `}
            >
              <span className="text-xl leading-none">{meta.emoji}</span>
              <span
                className={`text-[10px] font-bold leading-none ${isActive ? "text-[#FF9933]" : "text-gray-500"}`}
              >
                {meta.short}
              </span>
              {/* Active indicator dot */}
              {isActive && (
                <span className="w-1 h-1 rounded-full bg-[#FF9933] mt-0.5" />
              )}
            </button>
          );
        })}
      </nav>
    </main>
  );
}
