import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ChevronDown,
  Globe,
  MessageCircleMore,
} from "lucide-react";
import { getObjexById } from "@/lib/db";
import { BrandLogo } from "@/components/brand/brand-logo";
import { PublishToggle } from "@/components/objex/publish-toggle";

type PageProps = {
  params: Promise<{ id: string }>;
};

function DetailList(props: { title: string; tone: string; items: string[] }) {
  return (
    <details className="rounded-[1.3rem] border border-[var(--color-border)] bg-white">
      <summary className="flex cursor-pointer list-none items-center justify-between px-4 py-3 text-sm font-semibold text-[var(--color-text)]">
        <span className={props.tone}>{props.title}</span>
        <ChevronDown className="h-4 w-4 text-[var(--color-text-soft)]" />
      </summary>
      <div className="space-y-2 border-t border-[var(--color-border)] p-4">
        {props.items.map((item) => (
          <div
            key={item}
            className="rounded-xl bg-[var(--color-surface-muted)] px-3 py-2.5 text-sm leading-6 text-[var(--color-text-soft)]"
          >
            {item}
          </div>
        ))}
      </div>
    </details>
  );
}

export default async function ObjexRevealPage({ params }: PageProps) {
  const { id } = await params;
  const objex = await getObjexById(id);

  if (!objex) {
    notFound();
  }

  return (
    <div className="app-shell">
      <header className="sticky top-0 z-20 border-b border-[var(--color-border)]/80 bg-white/92 backdrop-blur-xl">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-4 sm:px-6">
          <BrandLogo subtitle="Profile reveal" />
          <div className="flex items-center gap-3">
            <Link
              href="/community"
              className="rounded-full border border-[var(--color-border)] bg-white px-4 py-2 text-sm font-semibold text-[var(--color-text)]"
            >
              Community
            </Link>
            <Link
              href="/create"
              className="rounded-full bg-[var(--color-accent)] px-4 py-2 text-sm font-semibold text-white"
            >
              Create another
            </Link>
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6 lg:py-8">
        <section className="soft-shadow overflow-hidden rounded-[1.8rem] border border-[var(--color-border)] bg-white">
          <div className="border-b border-[var(--color-border)] px-4 py-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--color-accent)]">
                  Objex Reveal
                </p>
                <span className="text-xs text-[var(--color-text-soft)]">
                  {new Date(objex.createdAt).toLocaleDateString()}
                </span>
              </div>
              <div className="rounded-full border border-[var(--color-border)] bg-[var(--color-surface-muted)] px-3 py-1.5 text-xs font-medium text-[var(--color-text-soft)]">
                {objex.profile.objectType}
              </div>
            </div>
          </div>

          <div className="grid gap-5 p-4 lg:grid-cols-[280px_1fr] lg:p-5">
            <aside className="space-y-4">
              <div className="relative aspect-[4/5] overflow-hidden rounded-[1.5rem] border border-[var(--color-border)] bg-[linear-gradient(180deg,#edfaff,#ffffff)]">
                <Image
                  src={objex.imagePublicUrl}
                  alt={objex.profile.name}
                  fill
                  className="object-cover"
                />
              </div>

              <details className="rounded-[1.3rem] border border-[var(--color-border)] bg-[var(--color-surface-muted)]">
                <summary className="flex cursor-pointer list-none items-center justify-between px-4 py-3 text-sm font-semibold text-[var(--color-text)]">
                  Signature metaphors
                  <ChevronDown className="h-4 w-4 text-[var(--color-text-soft)]" />
                </summary>
                <div className="flex flex-wrap gap-2 border-t border-[var(--color-border)] p-4">
                  {objex.profile.hidden.signatureMetaphors.map((metaphor) => (
                    <span
                      key={metaphor}
                      className="rounded-full border border-[var(--color-border)] bg-white px-3 py-1.5 text-xs text-[var(--color-text-soft)]"
                    >
                      {metaphor}
                    </span>
                  ))}
                </div>
              </details>
            </aside>

            <div className="space-y-4">
              <section className="rounded-[1.5rem] border border-[var(--color-border)] bg-white p-4 sm:p-5">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[var(--color-accent)]">
                      Creator Profile
                    </p>
                    <h1 className="mt-2 font-display text-4xl font-semibold tracking-tight sm:text-5xl">
                      {objex.profile.name}
                    </h1>
                    <p className="mt-1 text-sm text-[var(--color-text-soft)] sm:text-base">
                      {objex.profile.objectType}
                    </p>
                  </div>
                  <div className="rounded-[1.25rem] border border-[var(--color-border)] bg-[var(--color-accent-soft)] px-3 py-2 text-right">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--color-accent)]">
                      Status
                    </p>
                    <p className="mt-1 text-sm font-semibold text-[var(--color-text)]">
                      {objex.isPublished ? "Published locally" : "Private draft"}
                    </p>
                  </div>
                </div>

                <p className="mt-4 text-base font-semibold leading-7 text-[var(--color-text)]">
                  {objex.profile.tagline}
                </p>

                <div className="mt-4 grid gap-3 sm:grid-cols-[1fr_auto]">
                  <div className="rounded-[1.25rem] border border-[var(--color-border)] bg-[var(--color-surface-muted)] px-4 py-3">
                    <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--color-text-soft)]">
                      Opening line
                    </p>
                    <p className="mt-2 text-base font-semibold leading-7 text-[var(--color-text)]">
                      {objex.profile.openingMessage}
                    </p>
                  </div>
                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-1">
                    <div className="rounded-[1.25rem] border border-[var(--color-border)] px-3 py-3 text-center">
                      <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--color-accent)]">
                        Dark
                      </p>
                      <p className="mt-1 text-2xl font-semibold">
                        {objex.profile.hidden.darknessLevel}
                      </p>
                    </div>
                    <div className="rounded-[1.25rem] border border-[var(--color-border)] px-3 py-3 text-center">
                      <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--color-accent)]">
                        Shameless
                      </p>
                      <p className="mt-1 text-2xl font-semibold">
                        {objex.profile.hidden.shamelessnessLevel}
                      </p>
                    </div>
                  </div>
                </div>
              </section>

              <details className="rounded-[1.3rem] border border-[var(--color-border)] bg-white" open>
                <summary className="flex cursor-pointer list-none items-center justify-between px-4 py-3 text-sm font-semibold text-[var(--color-text)]">
                  Bio
                  <ChevronDown className="h-4 w-4 text-[var(--color-text-soft)]" />
                </summary>
                <div className="border-t border-[var(--color-border)] px-4 py-4">
                  <p className="text-sm leading-7 text-[var(--color-text-soft)]">
                    {objex.profile.bio}
                  </p>
                </div>
              </details>

              <div className="grid gap-3 lg:grid-cols-3">
                <DetailList
                  title="Kinks"
                  tone="text-[var(--color-accent)]"
                  items={objex.profile.kinks}
                />
                <DetailList
                  title="Green Flags"
                  tone="text-emerald-600"
                  items={objex.profile.greenFlags}
                />
                <DetailList
                  title="Red Flags"
                  tone="text-rose-600"
                  items={objex.profile.redFlags}
                />
              </div>

              <details className="rounded-[1.3rem] border border-[var(--color-border)] bg-white">
                <summary className="flex cursor-pointer list-none items-center justify-between px-4 py-3 text-sm font-semibold text-[var(--color-text)]">
                  Voice settings
                  <ChevronDown className="h-4 w-4 text-[var(--color-text-soft)]" />
                </summary>
                <div className="grid gap-3 border-t border-[var(--color-border)] p-4 sm:grid-cols-2">
                  <div className="rounded-xl bg-[var(--color-surface-muted)] p-3">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--color-accent)]">
                      Speaking Style
                    </p>
                    <p className="mt-2 text-sm leading-6 text-[var(--color-text-soft)]">
                      {objex.profile.hidden.speakingStyle}
                    </p>
                  </div>
                  <div className="rounded-xl bg-[var(--color-surface-muted)] p-3">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--color-accent)]">
                      Humor Style
                    </p>
                    <p className="mt-2 text-sm leading-6 text-[var(--color-text-soft)]">
                      {objex.profile.hidden.humorStyle}
                    </p>
                  </div>
                </div>
              </details>

              <section className="rounded-[1.3rem] border border-[var(--color-border)] bg-white p-4">
                <div className="flex items-center gap-3">
                  <div className="rounded-xl bg-[var(--color-accent-soft)] p-2.5 text-[var(--color-accent)]">
                    <MessageCircleMore className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[var(--color-accent)]">
                      Future Chat
                    </p>
                    <p className="mt-1 text-sm text-[var(--color-text-soft)]">
                      Reserved for the next build.
                    </p>
                  </div>
                </div>
                <div className="mt-4 flex flex-col gap-2.5 sm:flex-row">
                  <button
                    type="button"
                    disabled
                    className="rounded-full bg-[var(--color-accent)] px-4 py-2.5 text-sm font-semibold text-white opacity-70"
                  >
                    Chat coming soon
                  </button>
                  {objex.isPublished ? (
                    <Link
                      href="/community"
                      className="inline-flex items-center justify-center gap-2 rounded-full border border-[var(--color-border)] bg-white px-4 py-2.5 text-sm font-semibold text-[var(--color-text)] transition hover:border-[var(--color-accent)] hover:text-[var(--color-accent)]"
                    >
                      <Globe className="h-4 w-4" />
                      View in community
                    </Link>
                  ) : null}
                </div>
              </section>

              <PublishToggle
                id={objex.id}
                initialIsPublished={objex.isPublished}
                initialPublishedAt={objex.publishedAt}
              />
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
