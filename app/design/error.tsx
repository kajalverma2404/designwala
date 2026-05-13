"use client";

import Link from "next/link";

export default function DesignError({ reset }: { reset: () => void }) {
  return (
    <main className="min-h-screen bg-white flex flex-col items-center justify-center px-4 text-center">
      <span className="text-5xl mb-4">⚠️</span>
      <h2 className="text-xl font-black text-gray-900 mb-2">Page Error</h2>
      <p className="text-gray-500 text-sm mb-6">Something went wrong loading this page.</p>
      <div className="flex gap-3">
        <button onClick={reset} className="bg-[#FF9933] text-white font-bold px-5 py-2.5 rounded-xl">
          Retry
        </button>
        <Link href="/" className="bg-gray-100 text-gray-700 font-semibold px-5 py-2.5 rounded-xl">
          Home
        </Link>
      </div>
    </main>
  );
}
