import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";

export const metadata: Metadata = {
  title: "OnlyObjex",
  description:
    "Upload a real object photo and reveal its shamelessly suggestive, hilariously polished Objex profile.",
  icons: {
    icon: "/brand/onlyobjex-mark.svg",
    shortcut: "/brand/onlyobjex-mark.svg",
    apple: "/brand/onlyobjex-mark.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full bg-[var(--color-page)] antialiased">
      <body className="min-h-full flex flex-col">
        <div className="flex-1">{children}</div>
        <footer className="border-t border-[var(--color-border)]/80 bg-white/92">
          <div className="mx-auto flex w-full max-w-6xl justify-center px-4 py-4 text-center text-sm text-[var(--color-text-soft)] sm:px-6">
            <p>
              vibecoded by{" "}
              <Link
                href="https://aniketraj.me"
                target="_blank"
                rel="noreferrer"
                className="font-semibold text-[var(--color-text)] underline decoration-[var(--color-border-strong)] underline-offset-4 transition hover:text-[var(--color-accent)] hover:decoration-[var(--color-accent)]"
              >
                Aniket Raj
              </Link>{" "}
              and{" "}
              <Link
                href="https://ashwinexe.com"
                target="_blank"
                rel="noreferrer"
                className="font-semibold text-[var(--color-text)] underline decoration-[var(--color-border-strong)] underline-offset-4 transition hover:text-[var(--color-accent)] hover:decoration-[var(--color-accent)]"
              >
                Ashwin Kumar
              </Link>
            </p>
          </div>
        </footer>
      </body>
    </html>
  );
}
