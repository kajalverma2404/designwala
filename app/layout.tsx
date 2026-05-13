import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://designwala.in"),
  title: "DesignWala — Apna Ghar, Apna Style",
  description:
    "AI-powered interior design for Indian homes. Upload your room photo and get personalized design recommendations in Modern Indian, Minimalist, and Vastu-Optimized styles.",
  keywords: "interior design, Indian home decor, Vastu, AI design, home makeover",
  icons: {
    icon: "/favicon.svg",
  },
  openGraph: {
    title: "DesignWala — Apna Ghar, Apna Style",
    description: "Transform your space with AI-powered Indian interior design",
    type: "website",
    images: [{ url: "/og-image.png" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "DesignWala — Apna Ghar, Apna Style",
    description: "Transform your space with AI-powered Indian interior design",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased min-h-screen">{children}</body>
    </html>
  );
}
