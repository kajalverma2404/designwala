import Link from "next/link";

export default function NotFound() {
  return (
    <main className="min-h-screen bg-white flex flex-col">
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
            className="bg-[#FF9933] hover:bg-[#e8851a] text-white text-sm font-semibold px-4 py-2 rounded-full transition-colors"
          >
            Try Free
          </Link>
        </div>
      </header>

      {/* 404 Content */}
      <div className="flex-1 flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <div className="text-6xl mb-6">🏡</div>

          <p className="text-8xl font-black text-gray-200 mb-4 leading-none">
            404
          </p>

          <h1 className="text-2xl md:text-3xl font-black text-gray-900 mb-3">
            Yeh page nahi mila
            <span className="block text-lg font-semibold text-[#006D77] mt-1">
              Page Not Found
            </span>
          </h1>

          <p className="text-gray-500 mb-2">
            Shayad yeh page move ho gaya
          </p>
          <p className="text-gray-400 text-sm mb-10">
            This page may have moved or no longer exists
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/"
              className="inline-flex items-center justify-center gap-2 bg-[#FF9933] hover:bg-[#e8851a] text-white font-bold px-6 py-3 rounded-2xl transition-all shadow-lg shadow-orange-200 hover:shadow-orange-300"
            >
              ← Go Home
            </Link>
            <Link
              href="/design"
              className="inline-flex items-center justify-center gap-2 bg-white hover:bg-orange-50 text-[#FF9933] font-bold px-6 py-3 rounded-2xl border-2 border-[#FF9933] transition-all"
            >
              <span>📸</span>
              <span>Upload Your Room</span>
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
