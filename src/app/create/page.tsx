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
          <Link
            href="/"
            className="rounded-full border border-[var(--color-border)] bg-white px-5 py-2.5 text-sm font-semibold text-[var(--color-text)]"
          >
            Back home
          </Link>
        </div>
      </header>

      <main className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6 lg:py-14">
        <div className="mb-8 max-w-3xl">
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-[var(--color-accent)]">
            Create Objex
          </p>
          <h1 className="mt-3 font-display text-5xl font-semibold tracking-tight">
            Upload a real object. We’ll make it unreasonably confident.
          </h1>
          <p className="mt-4 text-lg leading-8 text-[var(--color-text-soft)]">
            The happy path is simple by design: photo upload, polished loading
            flow, AI generation, save, reveal. No object confirmation step.
          </p>
        </div>

        <CreateFlow />
      </main>
    </div>
  );
}
