import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "企業調査レポートツール",
  description: "企業名を入力してAIが自動でWeb調査し、レポートを生成・保存します",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja">
      <body>{children}</body>
    </html>
  );
}
