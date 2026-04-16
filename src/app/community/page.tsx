import Image from "next/image";
import Link from "next/link";
import { Globe, Sparkles } from "lucide-react";
import { listPublishedObjex } from "@/lib/db";

function snippet(input: string, maxLength = 120) {
  if (input.length <= maxLength) {
    return input;
  }

  return `${input.slice(0, maxLength).trimEnd()}...`;
}

export default async function CommunityPage() {
  const publishedObjex = await listPublishedObjex();

  return (
    <div className="app-shell">
      <header className="sticky top-0 z-20 border-b border-[var(--color-border)]/80 bg-white/92 backdrop-blur-xl">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-4 sm:px-6">
          <Link href="/" className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[var(--color-accent)] text-white">
              <Sparkles className="h-4 w-4" />
            </div>
            <div>
              <p className="font-display text-xl font-semibold tracking-tight">
                OnlyObjex
              </p>
              <p className="text-sm text-[var(--color-text-soft)]">
                Local community
              </p>
            </div>
          </Link>
          <div className="flex items-center gap-3">
            <Link
              href="/create"
              className="rounded-full bg-[var(--color-accent)] px-5 py-2.5 text-sm font-semibold text-white"
            >
              Create Objex
            </Link>
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6 lg:py-12">
        <section className="mb-8 flex flex-col gap-5 rounded-[2rem] border border-[var(--color-border)] bg-white p-6 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-[var(--color-accent)]">
              Community
            </p>
            <h1 className="mt-3 font-display text-5xl font-semibold tracking-tight">
              Browse the published Objex roster.
            </h1>
            <p className="mt-4 max-w-3xl text-lg leading-8 text-[var(--color-text-soft)]">
              A local-only browse page for the boldest object profiles in this
              project. Newest published profiles rise to the top.
            </p>
          </div>
          <div className="rounded-[1.5rem] border border-[var(--color-border)] bg-[var(--color-surface-muted)] px-5 py-4">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--color-accent)]">
              Published now
            </p>
            <p className="mt-2 text-3xl font-semibold">{publishedObjex.length}</p>
          </div>
        </section>

        {publishedObjex.length === 0 ? (
          <section className="soft-shadow rounded-[2rem] border border-[var(--color-border)] bg-white p-8 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[var(--color-accent-soft)] text-[var(--color-accent)]">
              <Globe className="h-6 w-6" />
            </div>
            <h2 className="mt-5 font-display text-3xl font-semibold tracking-tight">
              Nobody has gone public yet.
            </h2>
            <p className="mx-auto mt-3 max-w-2xl text-base leading-7 text-[var(--color-text-soft)]">
              Create an Objex, publish it from the reveal page, and it will show
              up here without leaving local project storage.
            </p>
            <Link
              href="/create"
              className="mt-6 inline-flex rounded-full bg-[var(--color-accent)] px-5 py-3 font-semibold text-white"
            >
              Make the first one
            </Link>
          </section>
        ) : (
          <section className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {publishedObjex.map((objex) => (
              <Link
                key={objex.id}
                href={`/objex/${objex.id}`}
                className="soft-shadow group overflow-hidden rounded-[2rem] border border-[var(--color-border)] bg-white transition hover:-translate-y-1 hover:border-[var(--color-border-strong)]"
              >
                <div className="relative aspect-[4/3] overflow-hidden bg-[linear-gradient(180deg,#e7f8ff,#ffffff)]">
                  <Image
                    src={objex.imagePublicUrl}
                    alt={objex.profile.name}
                    fill
                    className="object-cover transition duration-300 group-hover:scale-[1.03]"
                  />
                </div>
                <div className="space-y-4 p-5">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h2 className="font-display text-3xl font-semibold tracking-tight">
                        {objex.profile.name}
                      </h2>
                      <p className="mt-1 text-sm text-[var(--color-text-soft)]">
                        {objex.profile.objectType}
                      </p>
                    </div>
                    <span className="rounded-full bg-[var(--color-accent-soft)] px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-[var(--color-accent)]">
                      Public
                    </span>
                  </div>
                  <p className="text-sm font-semibold leading-6 text-[var(--color-text)]">
                    {snippet(objex.profile.tagline, 96)}
                  </p>
                  <p className="text-sm leading-7 text-[var(--color-text-soft)]">
                    {snippet(objex.profile.bio, 150)}
                  </p>
                  <div className="flex items-center justify-between border-t border-[var(--color-border)] pt-4">
                    <p className="text-xs font-medium uppercase tracking-[0.16em] text-[var(--color-text-soft)]">
                      Published{" "}
                      {new Date(objex.publishedAt ?? objex.createdAt).toLocaleDateString()}
                    </p>
                    <span className="text-sm font-semibold text-[var(--color-accent)]">
                      Open profile
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </section>
        )}
      </main>
    </div>
  );
}
