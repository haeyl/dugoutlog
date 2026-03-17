import type { Metadata } from "next";
import "./globals.css";
import Navigation from "@/components/Navigation";
import Script from "next/script";

export const metadata: Metadata = {
  title: "덕아웃 로그",
  description: "나만의 야구 직관 일기",
  metadataBase: new URL("https://dugoutlog.vercel.app"),
  openGraph: {
    title: "덕아웃 로그",
    description: "나만의 야구 직관 일기",
    url: "https://dugoutlog.vercel.app",
    siteName: "덕아웃 로그",
    locale: "ko_KR",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "덕아웃 로그",
    description: "나만의 야구 직관 일기",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body suppressHydrationWarning>
        <div className="max-w-md mx-auto min-h-screen pb-20">
          {children}
        </div>
        <Navigation />
        {/* figma-capture */}
        <Script src="https://mcp.figma.com/mcp/html-to-design/capture.js" strategy="afterInteractive" />
      </body>
    </html>
  );
}
