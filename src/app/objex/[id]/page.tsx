import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Globe, MessageCircleMore, Sparkles } from "lucide-react";
import { getObjexById } from "@/lib/db";
import { PublishToggle } from "@/components/objex/publish-toggle";

type PageProps = {
  params: Promise<{ id: string }>;
};

function DetailList(props: { title: string; tone: string; items: string[] }) {
  return (
    <section className="rounded-[1.6rem] border border-[var(--color-border)] bg-white p-5">
      <p className={`text-xs font-semibold uppercase tracking-[0.24em] ${props.tone}`}>
        {props.title}
      </p>
      <div className="mt-4 space-y-3">
        {props.items.map((item) => (
          <div
            key={item}
            className="rounded-2xl bg-[var(--color-surface-muted)] px-4 py-3 text-sm leading-6 text-[var(--color-text-soft)]"
          >
            {item}
          </div>
        ))}
      </div>
    </section>
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
          <Link href="/" className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[var(--color-accent)] text-white">
              <Sparkles className="h-4 w-4" />
            </div>
            <div>
              <p className="font-display text-xl font-semibold tracking-tight">
                OnlyObjex
              </p>
              <p className="text-sm text-[var(--color-text-soft)]">
                Profile reveal
              </p>
            </div>
          </Link>
          <Link
            href="/community"
            className="rounded-full border border-[var(--color-border)] bg-white px-5 py-2.5 text-sm font-semibold text-[var(--color-text)]"
          >
            Community
          </Link>
          <Link
            href="/create"
            className="rounded-full bg-[var(--color-accent)] px-5 py-2.5 text-sm font-semibold text-white"
          >
            Create another
          </Link>
        </div>
      </header>

      <main className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 lg:py-12">
        <section className="soft-shadow overflow-hidden rounded-[2rem] border border-[var(--color-border)] bg-white">
          <div className="border-b border-[var(--color-border)] px-5 py-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.24em] text-[var(--color-accent)]">
                  Objex Reveal
                </p>
                <p className="mt-2 text-sm text-[var(--color-text-soft)]">
                  Created {new Date(objex.createdAt).toLocaleString()}
                </p>
              </div>
              <div className="rounded-full border border-[var(--color-border)] bg-[var(--color-surface-muted)] px-4 py-2 text-sm font-medium text-[var(--color-text-soft)]">
                {objex.profile.objectType}
              </div>
            </div>
          </div>

          <div className="grid gap-8 p-5 lg:grid-cols-[320px_1fr] lg:p-7">
            <aside className="space-y-5">
              <div className="relative aspect-[4/5] overflow-hidden rounded-[1.8rem] border border-[var(--color-border)] bg-[linear-gradient(180deg,#edfaff,#ffffff)]">
                <Image
                  src={objex.imagePublicUrl}
                  alt={objex.profile.name}
                  fill
                  className="object-cover"
                />
              </div>
              <div className="rounded-[1.6rem] border border-[var(--color-border)] bg-[var(--color-surface-muted)] p-5">
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--color-accent)]">
                  Signature Metaphors
                </p>
                <div className="mt-4 flex flex-wrap gap-2">
                  {objex.profile.hidden.signatureMetaphors.map((metaphor) => (
                    <span
                      key={metaphor}
                      className="rounded-full border border-[var(--color-border)] bg-white px-3 py-2 text-sm text-[var(--color-text-soft)]"
                    >
                      {metaphor}
                    </span>
                  ))}
                </div>
              </div>
            </aside>

            <div className="space-y-6">
              <section className="rounded-[1.8rem] border border-[var(--color-border)] bg-white p-6">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <p className="text-sm font-semibold uppercase tracking-[0.24em] text-[var(--color-accent)]">
                      Creator Profile
                    </p>
                    <h1 className="mt-3 font-display text-5xl font-semibold tracking-tight">
                      {objex.profile.name}
                    </h1>
                    <p className="mt-2 text-lg text-[var(--color-text-soft)]">
                      {objex.profile.objectType}
                    </p>
                  </div>
                  <div className="rounded-[1.6rem] border border-[var(--color-border)] bg-[var(--color-accent-soft)] px-4 py-3 text-right">
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--color-accent)]">
                      Tagline
                    </p>
                    <p className="mt-2 max-w-xs text-sm font-semibold leading-6 text-[var(--color-text)]">
                      {objex.profile.tagline}
                    </p>
                  </div>
                </div>

                <div className="mt-6 rounded-[1.5rem] border border-[var(--color-border)] bg-[var(--color-surface-muted)] p-5">
                  <p className="text-sm leading-8 text-[var(--color-text-soft)]">
                    {objex.profile.bio}
                  </p>
                </div>

                <div className="mt-6 grid gap-4 sm:grid-cols-3">
                  <div className="rounded-[1.4rem] border border-[var(--color-border)] p-4">
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--color-accent)]">
                      Darkness
                    </p>
                    <p className="mt-3 text-3xl font-semibold">
                      {objex.profile.hidden.darknessLevel}/10
                    </p>
                  </div>
                  <div className="rounded-[1.4rem] border border-[var(--color-border)] p-4">
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--color-accent)]">
                      Shamelessness
                    </p>
                    <p className="mt-3 text-3xl font-semibold">
                      {objex.profile.hidden.shamelessnessLevel}/10
                    </p>
                  </div>
                  <div className="rounded-[1.4rem] border border-[var(--color-border)] p-4">
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--color-accent)]">
                      Speaking Style
                    </p>
                    <p className="mt-3 text-sm leading-6 text-[var(--color-text-soft)]">
                      {objex.profile.hidden.speakingStyle}
                    </p>
                  </div>
                </div>
              </section>

              <div className="grid gap-4 lg:grid-cols-3">
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

              <section className="rounded-[1.8rem] border border-[var(--color-border)] bg-white p-6">
                <div className="flex items-center gap-3">
                  <div className="rounded-2xl bg-[var(--color-accent-soft)] p-3 text-[var(--color-accent)]">
                    <MessageCircleMore className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold uppercase tracking-[0.24em] text-[var(--color-accent)]">
                      Opening Message
                    </p>
                    <p className="mt-1 text-sm text-[var(--color-text-soft)]">
                      Reserved for future chat, already doing damage now.
                    </p>
                  </div>
                </div>
                <div className="mt-5 rounded-[1.5rem] border border-[var(--color-border)] bg-[var(--color-surface-muted)] px-5 py-4">
                  <p className="text-lg font-semibold leading-8 text-[var(--color-text)]">
                    {objex.profile.openingMessage}
                  </p>
                </div>
                <div className="mt-5 flex flex-col gap-3 sm:flex-row">
                  <button
                    type="button"
                    disabled
                    className="rounded-full bg-[var(--color-accent)] px-5 py-3 text-sm font-semibold text-white opacity-70"
                  >
                    Chat coming soon
                  </button>
                  {objex.isPublished ? (
                    <Link
                      href="/community"
                      className="inline-flex items-center justify-center gap-2 rounded-full border border-[var(--color-border)] bg-white px-5 py-3 text-sm font-semibold text-[var(--color-text)] transition hover:border-[var(--color-accent)] hover:text-[var(--color-accent)]"
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
