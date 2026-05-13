"use client";

import Link from "next/link";
import { useState } from "react";

/* ── FAQ data ─────────────────────────────────────────────────────────────── */
const FAQ_ITEMS = [
  {
    q: "Do you store my photos?",
    a: "No. Your photo is sent to OpenAI for analysis and immediately discarded. We store nothing.",
  },
  {
    q: "Is it really free?",
    a: "Yes, completely free. No registration, no credit card.",
  },
  {
    q: "Which rooms work best?",
    a: "Living rooms and bedrooms give the best results. Make sure the photo is well-lit and shows the full room.",
  },
  {
    q: "Can I use it on my phone?",
    a: "Yes, works on all devices. Just take a photo directly from your phone camera.",
  },
];

/* ── Accordion item ───────────────────────────────────────────────────────── */
function FAQItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border border-gray-100 rounded-2xl overflow-hidden bg-white shadow-sm">
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between px-6 py-5 text-left"
        aria-expanded={open}
      >
        <span className="font-semibold text-gray-900 text-base">{q}</span>
        <span
          className={`ml-4 flex-shrink-0 w-7 h-7 flex items-center justify-center rounded-full bg-orange-50 text-[#FF9933] font-bold text-lg transition-transform duration-200 ${
            open ? "rotate-45" : ""
          }`}
        >
          +
        </span>
      </button>
      {open && (
        <div className="px-6 pb-5 text-gray-500 text-sm leading-relaxed border-t border-gray-50 pt-4">
          {a}
        </div>
      )}
    </div>
  );
}

/* ── Page ─────────────────────────────────────────────────────────────────── */
export default function HomePage() {
  return (
    <main className="min-h-screen bg-white rangoli-pattern overflow-hidden">
      {/* ── Header ──────────────────────────────────────────────────────── */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-orange-100">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🏡</span>
            <span className="font-bold text-xl text-gray-900">
              Design<span className="text-[#FF9933]">Wala</span>
            </span>
          </div>
          <Link
            href="/design"
            className="bg-[#FF9933] hover:bg-[#e8851a] text-white text-sm font-semibold px-4 py-2 rounded-full transition-colors"
          >
            Try Free
          </Link>
        </div>
      </header>

      {/* ── Hero ────────────────────────────────────────────────────────── */}
      <section className="relative max-w-6xl mx-auto px-4 pt-16 pb-24 text-center">
        {/* Decorative circles */}
        <div className="absolute top-8 left-8 w-64 h-64 rounded-full bg-orange-50 -z-10 blur-3xl opacity-60" />
        <div className="absolute bottom-8 right-8 w-80 h-80 rounded-full bg-teal-50 -z-10 blur-3xl opacity-60" />

        {/* Badge row */}
        <div className="flex flex-wrap items-center justify-center gap-3 mb-6">
          <div className="inline-flex items-center gap-2 bg-orange-50 text-[#FF9933] text-xs font-semibold px-4 py-1.5 rounded-full border border-orange-100">
            <span>✨</span>
            <span>AI-Powered · Free · Instant Results</span>
          </div>
          <div className="inline-flex items-center gap-2 bg-teal-50 text-[#006D77] text-xs font-semibold px-4 py-1.5 rounded-full border border-teal-100">
            <span>🏠</span>
            <span>1,200+ rooms designed</span>
          </div>
        </div>

        <h1 className="text-5xl md:text-7xl font-black text-gray-900 leading-tight mb-4">
          <span className="block">Design</span>
          <span className="block text-[#FF9933]">Wala</span>
        </h1>

        <p className="text-xl md:text-2xl font-semibold text-[#006D77] mb-3">
          अपना घर, अपना Style
        </p>
        <p className="text-base md:text-lg text-gray-600 mb-2">
          <em>Apna Ghar, Apna Style</em>
        </p>

        <p className="max-w-xl mx-auto text-gray-500 mt-4 mb-10 text-base leading-relaxed">
          Upload a photo of your room and get instant AI-powered design
          makeovers — Modern Indian, Minimalist, and Vastu-Optimized — complete
          with real product recommendations you can shop right now.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center items-center">
          <Link
            href="/design"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-[#FF9933] hover:bg-[#e8851a] text-white font-bold text-lg px-8 py-4 rounded-2xl transition-all shadow-lg shadow-orange-200 hover:shadow-orange-300 hover:-translate-y-0.5"
          >
            <span>📸</span>
            <span>Upload Your Room</span>
          </Link>
          <a
            href="#how-it-works"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-white hover:bg-gray-50 text-gray-700 font-semibold text-lg px-8 py-4 rounded-2xl border border-gray-200 transition-all"
          >
            <span>▶</span>
            <span>How it Works</span>
          </a>
        </div>

        {/* Style badges */}
        <div className="flex flex-wrap gap-2 justify-center mt-10">
          {[
            { emoji: "🪔", label: "Modern Indian", hi: "आधुनिक भारतीय" },
            { emoji: "🤍", label: "Minimalist", hi: "मिनिमलिस्ट" },
            { emoji: "🧿", label: "Vastu-Optimized", hi: "वास्तु अनुकूल" },
          ].map((style) => (
            <div
              key={style.label}
              className="flex items-center gap-2 bg-white border border-gray-100 rounded-full px-4 py-2 shadow-sm"
            >
              <span>{style.emoji}</span>
              <span className="text-sm font-medium text-gray-700">
                {style.label}
              </span>
              <span className="text-xs text-gray-400">· {style.hi}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ── Stats bar ───────────────────────────────────────────────────── */}
      <section className="border-y border-gray-100 bg-white py-6 px-4">
        <div className="max-w-4xl mx-auto grid grid-cols-2 md:grid-cols-4 divide-x divide-gray-100">
          {[
            { value: "3", label: "Design Styles" },
            { value: "50+", label: "Real Products" },
            { value: "IKEA & Amazon", label: "Supported Stores" },
            { value: "Free", label: "Forever — no catch" },
          ].map((stat) => (
            <div key={stat.label} className="text-center px-4 py-2">
              <div className="text-xl md:text-2xl font-black text-[#FF9933]">
                {stat.value}
              </div>
              <div className="text-xs md:text-sm text-gray-500 mt-0.5">
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Example gallery ─────────────────────────────────────────────── */}
      <section className="py-20 px-4 bg-orange-50/40">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-black text-gray-900 mb-2">
              See What&apos;s Possible
            </h2>
            <p className="text-[#006D77] font-semibold">
              देखें क्या हो सकता है
            </p>
            <p className="text-gray-500 mt-2 text-sm max-w-lg mx-auto">
              Three distinct transformations, tailored for Indian homes. Every
              style comes with curated product picks you can buy today.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {/* Modern Indian */}
            <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
              <div className="h-36 flex items-center justify-center text-6xl bg-gradient-to-br from-orange-50 to-amber-100 relative">
                🪔
                <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-2">
                  {["#FF9933", "#8B4513", "#FFD700", "#006D77"].map((c) => (
                    <span
                      key={c}
                      className="w-5 h-5 rounded-full border-2 border-white shadow-sm"
                      style={{ background: c }}
                    />
                  ))}
                </div>
              </div>
              <div className="p-5">
                <div className="text-xs font-bold text-[#FF9933] mb-1 tracking-wide uppercase">
                  Style 01
                </div>
                <h3 className="font-black text-gray-900 text-lg mb-0.5">
                  Modern Indian
                </h3>
                <p className="text-xs text-[#006D77] font-semibold mb-3">
                  आधुनिक भारतीय
                </p>
                <ul className="space-y-1.5 text-sm text-gray-600">
                  <li className="flex items-start gap-2">
                    <span className="text-[#FF9933] font-bold mt-0.5">✓</span>
                    Rich terracotta &amp; saffron tones with brass accents
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-[#FF9933] font-bold mt-0.5">✓</span>
                    Handcrafted textiles and block-print cushions
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-[#FF9933] font-bold mt-0.5">✓</span>
                    Warm ambient lighting for festive evenings
                  </li>
                </ul>
              </div>
            </div>

            {/* Minimalist */}
            <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
              <div className="h-36 flex items-center justify-center text-6xl bg-gradient-to-br from-gray-50 to-slate-100 relative">
                🤍
                <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-2">
                  {["#F5F5F0", "#C8C8C0", "#2D2D2D", "#006D77"].map((c) => (
                    <span
                      key={c}
                      className="w-5 h-5 rounded-full border-2 border-white shadow-sm"
                      style={{ background: c }}
                    />
                  ))}
                </div>
              </div>
              <div className="p-5">
                <div className="text-xs font-bold text-[#FF9933] mb-1 tracking-wide uppercase">
                  Style 02
                </div>
                <h3 className="font-black text-gray-900 text-lg mb-0.5">
                  Minimalist
                </h3>
                <p className="text-xs text-[#006D77] font-semibold mb-3">
                  मिनिमलिस्ट
                </p>
                <ul className="space-y-1.5 text-sm text-gray-600">
                  <li className="flex items-start gap-2">
                    <span className="text-[#FF9933] font-bold mt-0.5">✓</span>
                    Neutral palette — whites, warm greys, natural wood
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-[#FF9933] font-bold mt-0.5">✓</span>
                    Clutter-free surfaces, clean geometric lines
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-[#FF9933] font-bold mt-0.5">✓</span>
                    Multi-functional furniture that breathes
                  </li>
                </ul>
              </div>
            </div>

            {/* Vastu-Optimized */}
            <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
              <div className="h-36 flex items-center justify-center text-6xl bg-gradient-to-br from-teal-50 to-cyan-100 relative">
                🧿
                <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-2">
                  {["#006D77", "#83C5BE", "#EDF6F9", "#FF9933"].map((c) => (
                    <span
                      key={c}
                      className="w-5 h-5 rounded-full border-2 border-white shadow-sm"
                      style={{ background: c }}
                    />
                  ))}
                </div>
              </div>
              <div className="p-5">
                <div className="text-xs font-bold text-[#FF9933] mb-1 tracking-wide uppercase">
                  Style 03
                </div>
                <h3 className="font-black text-gray-900 text-lg mb-0.5">
                  Vastu-Optimized
                </h3>
                <p className="text-xs text-[#006D77] font-semibold mb-3">
                  वास्तु अनुकूल
                </p>
                <ul className="space-y-1.5 text-sm text-gray-600">
                  <li className="flex items-start gap-2">
                    <span className="text-[#FF9933] font-bold mt-0.5">✓</span>
                    Directional layout following Vastu Shastra principles
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-[#FF9933] font-bold mt-0.5">✓</span>
                    Calming teal &amp; aqua tones that promote harmony
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-[#FF9933] font-bold mt-0.5">✓</span>
                    Energy-flow tips for every corner of the room
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── How it works ────────────────────────────────────────────────── */}
      <section id="how-it-works" className="bg-gray-50 py-20 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-black text-gray-900 mb-2">
              Kaise Kaam Karta Hai?
            </h2>
            <p className="text-gray-500">How does it work?</p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                step: "01",
                emoji: "📱",
                title: "Photo Upload Karo",
                titleEn: "Upload Your Photo",
                desc: "Apne living room ki photo kheechi ya upload karo.",
                descEn: "Take or upload a photo of your living room.",
              },
              {
                step: "02",
                emoji: "🤖",
                title: "AI Design Kare",
                titleEn: "AI Does the Magic",
                desc: "Hamara AI aapke room ko 3 alag styles mein redesign karta hai.",
                descEn:
                  "Our AI redesigns your room in 3 distinct style variants.",
              },
              {
                step: "03",
                emoji: "🛍️",
                title: "Shop Karo",
                titleEn: "Shop the Look",
                desc: "Amazon aur Flipkart pe products ko seedha kharido.",
                descEn: "Buy recommended products directly on Amazon & Flipkart.",
              },
            ].map((item) => (
              <div
                key={item.step}
                className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 text-center"
              >
                <div className="inline-flex items-center justify-center w-12 h-12 bg-orange-50 rounded-xl mb-4">
                  <span className="text-2xl">{item.emoji}</span>
                </div>
                <div className="text-xs font-bold text-[#FF9933] mb-1">
                  STEP {item.step}
                </div>
                <h3 className="font-bold text-gray-900 text-lg mb-0.5">
                  {item.title}
                </h3>
                <p className="text-xs text-[#006D77] font-medium mb-2">
                  {item.titleEn}
                </p>
                <p className="text-sm text-gray-500 leading-relaxed">
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Features ────────────────────────────────────────────────────── */}
      <section className="py-20 px-4 max-w-5xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-black text-gray-900 mb-2">
            Kya Milta Hai?
          </h2>
          <p className="text-gray-500">What you get</p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            {
              emoji: "🎨",
              title: "3 Design Styles",
              desc: "Modern Indian, Minimalist & Vastu-Optimized",
            },
            {
              emoji: "🛒",
              title: "18 Products",
              desc: "6 curated picks per style with prices",
            },
            {
              emoji: "📱",
              title: "WhatsApp Share",
              desc: "Share your design plan instantly",
            },
            {
              emoji: "🧿",
              title: "Vastu Tips",
              desc: "Expert Vastu guidance for each room",
            },
          ].map((feature) => (
            <div
              key={feature.title}
              className="p-5 rounded-2xl bg-white border border-gray-100 shadow-sm hover:shadow-md transition-shadow"
            >
              <span className="text-3xl mb-3 block">{feature.emoji}</span>
              <h4 className="font-bold text-gray-900 mb-1">{feature.title}</h4>
              <p className="text-sm text-gray-500">{feature.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── CTA ─────────────────────────────────────────────────────────── */}
      <section className="bg-gradient-to-br from-[#FF9933] to-[#e8851a] py-20 px-4 text-center">
        <h2 className="text-3xl md:text-4xl font-black text-white mb-3">
          Ready to Transform Your Home?
        </h2>
        <p className="text-orange-100 mb-2 text-lg">अपना घर बदलो, अभी!</p>
        <p className="text-orange-200 mb-8 text-sm">
          Free hai, koi registration nahi
        </p>
        <Link
          href="/design"
          className="inline-flex items-center gap-2 bg-white text-[#FF9933] font-bold text-lg px-10 py-4 rounded-2xl hover:bg-orange-50 transition-colors shadow-xl"
        >
          <span>📸</span>
          <span>Start Designing Free</span>
        </Link>
      </section>

      {/* ── FAQ ─────────────────────────────────────────────────────────── */}
      <section className="py-20 px-4 bg-white">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-3xl md:text-4xl font-black text-gray-900 mb-2">
              Frequently Asked Questions
            </h2>
            <p className="text-[#006D77] font-semibold">
              अक्सर पूछे जाने वाले सवाल
            </p>
          </div>
          <div className="space-y-3">
            {FAQ_ITEMS.map((item) => (
              <FAQItem key={item.q} q={item.q} a={item.a} />
            ))}
          </div>
        </div>
      </section>

      {/* ── Footer ──────────────────────────────────────────────────────── */}
      <footer className="border-t border-gray-100 py-8 px-4 text-center text-sm text-gray-400">
        <div className="mb-2">
          <span className="font-semibold text-gray-700">
            Design<span className="text-[#FF9933]">Wala</span>
          </span>{" "}
          · Made with ❤️ for Indian homes
        </div>
        <p className="text-xs">Powered by OpenAI · अपना घर, अपना Style</p>
      </footer>
    </main>
  );
}
