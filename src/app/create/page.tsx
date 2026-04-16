import Link from "next/link";
import { CreateFlow } from "@/components/create/create-flow";

export default function CreatePage() {
  return (
    <div className="app-shell">
      <header className="sticky top-0 z-20 border-b border-[var(--color-border)]/80 bg-white/90 backdrop-blur-xl">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-4 sm:px-6">
          <Link href="/" className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-2xl bg-[var(--color-accent)]" />
            <div>
              <p className="font-display text-xl font-semibold tracking-tight">
                OnlyObjex
              </p>
              <p className="text-sm text-[var(--color-text-soft)]">
                Upload / generate / reveal
              </p>
            </div>
          </Link>
          <div className="flex items-center gap-3">
            <Link
              href="/community"
              className="rounded-full border border-[var(--color-border)] bg-white px-4 py-2 text-sm font-semibold text-[var(--color-text)]"
            >
              Community
            </Link>
            <Link
              href="/"
              className="rounded-full border border-[var(--color-border)] bg-white px-4 py-2 text-sm font-semibold text-[var(--color-text)]"
            >
              Back home
            </Link>
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6 lg:py-8">
        <div className="mb-5 max-w-2xl">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--color-accent)]">
            Create Objex
          </p>
          <h1 className="mt-2 font-display text-4xl font-semibold tracking-tight sm:text-5xl">
            Upload the photo. Let the object flirt later.
          </h1>
          <p className="mt-3 text-sm leading-6 text-[var(--color-text-soft)] sm:text-base">
            Minimal first slice: photo upload, loading, save, reveal.
          </p>
        </div>

        <CreateFlow />
      </main>
    </div>
  );
}
