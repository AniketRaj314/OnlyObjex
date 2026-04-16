import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "OnlyObjex",
  description:
    "Upload a real object photo and reveal its shamelessly suggestive, hilariously polished Objex profile.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full bg-[var(--color-page)] antialiased">
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
