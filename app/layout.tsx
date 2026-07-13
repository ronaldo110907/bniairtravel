import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import NoticePopup from "@/components/NoticePopup";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "청주공항 출발 전세기 전문 업체",
  description:
    "청주공항 출발 장가계, 백두산, 상해·항주·주가각, 여강 여행 전문. 청주공항출발 전세기와 프리미엄 여행 상품을 만나보세요.",
  keywords: [
    "청주공항 여행",
    "청주공항출발 장가계 여행",
    "청주공항출발 백두산 여행",
    "청주공항출발 상해 항주 주가각 여행",
    "청주공항출발 여행",
    "청주공항출발 전세기",
    "청주공항출발 여강 여행",
    "청주공항출발 동남아"
  ],
  openGraph: {
    title: "프리미엄 여행",
    description:
      "청주공항 출발 전세기 여행 상품과 특별한 여행 일정을 확인하세요.",
    type: "website",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="ko"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        {children}
        <NoticePopup />
      </body>
    </html>
  );
}
