import Link from "next/link";
import { Sparkles } from "lucide-react";
import { BrandLogo } from "@/components/brand/brand-logo";
import { ChemistryStudio } from "@/components/chemistry/chemistry-studio";
import { listPublishedObjex } from "@/lib/db";

export default async function ChemistryPage() {
  const publishedObjex = await listPublishedObjex();

  return (
    <div className="app-shell">
      <header className="sticky top-0 z-20 border-b border-[var(--color-border)]/80 bg-white/92 backdrop-blur-xl">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-4 sm:px-6">
          <BrandLogo subtitle="Two-Objex chemistry" />
          <div className="flex items-center gap-3">
            <Link
              href="/community"
              className="rounded-full border border-[var(--color-border)] bg-white px-4 py-2 text-sm font-semibold text-[var(--color-text)]"
            >
              Community
            </Link>
            <Link
              href="/scenes"
              className="rounded-full border border-[var(--color-border)] bg-white px-4 py-2 text-sm font-semibold text-[var(--color-text)]"
            >
              Scenes
            </Link>
            <Link
              href="/create"
              className="rounded-full bg-[var(--color-accent)] px-4 py-2 text-sm font-semibold text-white"
            >
              Create Objex
            </Link>
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6 lg:py-8">
        <section className="mb-6 rounded-[1.9rem] border border-[var(--color-border)] bg-white p-6">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--color-accent)]">
                Chemistry
              </p>
              <h1 className="mt-2 font-display text-4xl font-semibold tracking-tight sm:text-5xl">
                Let two Objex meet and make it weird immediately.
              </h1>
              <p className="mt-3 max-w-3xl text-sm leading-6 text-[var(--color-text-soft)] sm:text-base">
                Choose two published Objex, generate their first conversation,
                and hear the whole exchange in their fixed voices.
              </p>
            </div>

            <div className="rounded-[1.4rem] border border-[var(--color-border)] bg-[var(--color-surface-muted)] px-5 py-4">
              <div className="flex items-center gap-2 text-[var(--color-accent)]">
                <Sparkles className="h-4 w-4" />
                <p className="text-xs font-semibold uppercase tracking-[0.2em]">
                  Published roster
                </p>
              </div>
              <p className="mt-2 text-3xl font-semibold text-[var(--color-text)]">
                {publishedObjex.length}
              </p>
            </div>
          </div>
        </section>

        {publishedObjex.length < 2 ? (
          <section className="rounded-[1.9rem] border border-[var(--color-border)] bg-white p-8 text-center">
            <h2 className="font-display text-3xl font-semibold tracking-tight text-[var(--color-text)]">
              Chemistry needs at least two published Objex.
            </h2>
            <p className="mx-auto mt-3 max-w-2xl text-base leading-7 text-[var(--color-text-soft)]">
              Publish a couple of Objex from their reveal pages and this room
              starts getting interesting.
            </p>
            <div className="mt-6 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Link
                href="/create"
                className="rounded-full bg-[var(--color-accent)] px-5 py-3 font-semibold text-white"
              >
                Create Objex
              </Link>
              <Link
                href="/community"
                className="rounded-full border border-[var(--color-border)] bg-white px-5 py-3 font-semibold text-[var(--color-text)]"
              >
                Browse community
              </Link>
            </div>
          </section>
        ) : (
          <ChemistryStudio publishedObjex={publishedObjex} />
        )}
      </main>
    </div>
  );
}
