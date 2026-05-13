"use client";

import { useEffect } from "react";
import Link from "next/link";

export default function ResultsError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Results page error:", error);
  }, [error]);

  return (
    <main className="min-h-screen bg-white flex flex-col items-center justify-center px-4 text-center">
      <span className="text-5xl mb-6">😔</span>
      <h1 className="text-2xl font-black text-gray-900 mb-2">
        Kuch galat ho gaya
      </h1>
      <p className="text-[#006D77] font-medium mb-1">Something went wrong</p>
      <p className="text-gray-500 text-sm mb-8 max-w-sm">
        Your design could not be loaded. This sometimes happens due to a network
        issue. Please try again.
      </p>
      <div className="flex flex-col sm:flex-row gap-3">
        <button
          onClick={reset}
          className="inline-flex items-center justify-center gap-2 bg-[#FF9933] hover:bg-[#e8851a] text-white font-bold px-6 py-3 rounded-2xl transition-colors"
        >
          Try Again · फिर कोशिश करें
        </button>
        <Link
          href="/design"
          className="inline-flex items-center justify-center gap-2 bg-white border border-gray-200 text-gray-700 font-semibold px-6 py-3 rounded-2xl hover:bg-gray-50 transition-colors"
        >
          ← Upload New Room
        </Link>
      </div>
    </main>
  );
}
