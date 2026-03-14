import type { Metadata } from "next";
import "./globals.css";
import Navigation from "@/components/Navigation";

export const metadata: Metadata = {
  title: "Dugout Log",
  description: "나만의 야구 직관 일기",
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
      </body>
    </html>
  );
}
