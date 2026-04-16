import Link from "next/link";
import Image from "next/image";
import { Eye, Flame, Upload } from "lucide-react";
import { BrandLogo } from "@/components/brand/brand-logo";

const teaserProfiles = [
  {
    name: "Velvet Clamp",
    objectType: "Lamp",
    tagline: "Soft glow. Hard stare. Knows exactly when to switch on.",
  },
  {
    name: "Miss Exposure",
    objectType: "Camera",
    tagline: "Always framing the moment like it owes her something.",
  },
  {
    name: "Sir Foldsalot",
    objectType: "Chair",
    tagline: "Supportive in public. Dangerous in private conversation.",
  },
];

export default function Home() {
  return (
    <div className="app-shell">
      <header className="sticky top-0 z-20 border-b border-[var(--color-border)]/80 bg-white/90 backdrop-blur-xl">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-4 sm:px-6">
          <BrandLogo subtitle="Suggestive profiles for innocent things" priority />
          <Link
            href="/community"
            className="rounded-full border border-[var(--color-border)] bg-white px-5 py-2.5 text-sm font-semibold text-[var(--color-text)] transition hover:border-[var(--color-accent)] hover:text-[var(--color-accent)]"
          >
            Community
          </Link>
          <Link
            href="/create"
            className="rounded-full bg-[var(--color-accent)] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[var(--color-accent-strong)]"
          >
            Create Objex
          </Link>
        </div>
      </header>

      <main className="hero-grid">
        <section className="mx-auto grid w-full max-w-6xl gap-12 px-4 py-12 sm:px-6 lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:py-20">
          <div className="space-y-8">
            <div className="inline-flex items-center gap-2 rounded-full border border-[var(--color-border-strong)] bg-white/90 px-4 py-2 text-sm font-medium text-[var(--color-text-soft)] soft-shadow">
              <Flame className="h-4 w-4 text-[var(--color-accent)]" />
              AI-native creator parody, built for object thirst traps
            </div>
            <div className="space-y-5">
              <h1 className="text-balance font-display text-5xl leading-none tracking-tight text-[var(--color-text)] sm:text-6xl">
                Turn one ordinary object photo into a very dangerous profile.
              </h1>
              <p className="max-w-2xl text-lg leading-8 text-[var(--color-text-soft)] sm:text-xl">
                Upload a real photo. OnlyObjex identifies the object, invents a
                shamelessly witty persona, and reveals it like a premium creator
                page with zero dignity and surprisingly strong copy.
              </p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Link
                href="/create"
                className="inline-flex items-center justify-center gap-2 rounded-full bg-[var(--color-accent)] px-6 py-3.5 text-base font-semibold text-white transition hover:bg-[var(--color-accent-strong)]"
              >
                <Upload className="h-4 w-4" />
                Create Objex
              </Link>
              <a
                href="#teasers"
                className="inline-flex items-center justify-center gap-2 rounded-full border border-[var(--color-border)] bg-white px-6 py-3.5 text-base font-semibold text-[var(--color-text)] transition hover:border-[var(--color-accent)] hover:text-[var(--color-accent)]"
              >
                <Eye className="h-4 w-4" />
                See the vibe
              </a>
              <Link
                href="/community"
                className="inline-flex items-center justify-center rounded-full border border-[var(--color-border)] bg-white px-6 py-3.5 text-base font-semibold text-[var(--color-text)] transition hover:border-[var(--color-accent)] hover:text-[var(--color-accent)]"
              >
                Browse community
              </Link>
            </div>
          </div>

          <div className="relative">
            <div className="absolute -left-8 top-6 h-24 w-24 rounded-full bg-cyan-200/70 blur-3xl" />
            <div className="absolute -right-4 bottom-8 h-28 w-28 rounded-full bg-sky-300/40 blur-3xl" />
            <div className="soft-shadow glass-panel relative overflow-hidden rounded-[2rem] border border-[var(--color-border)] p-4">
              <div className="rounded-[1.6rem] border border-[var(--color-border)] bg-white">
                <div className="border-b border-[var(--color-border)] p-4">
                  <div className="flex items-center gap-3">
                    <div className="h-12 w-12 rounded-2xl bg-[linear-gradient(135deg,#17c1ff,#0095d9)]" />
                    <div>
                      <p className="font-display text-2xl font-semibold">
                        Miss Exposure
                      </p>
                      <p className="text-sm text-[var(--color-text-soft)]">
                        Camera · Available for suspiciously intimate close-ups
                      </p>
                    </div>
                  </div>
                </div>
                <div className="grid gap-4 p-4 sm:grid-cols-[180px_1fr]">
                  <div className="aspect-[4/5] rounded-[1.6rem] bg-[linear-gradient(180deg,#d9f7ff,#eff9ff)] p-3">
                    <div className="flex h-full items-end rounded-[1.25rem] border border-white/70 bg-[radial-gradient(circle_at_top,#93e1ff,#17b2ef_55%,#078bc3)] p-4">
                      <Image
                        src="/brand/onlyobjex-wordmark.svg"
                        alt="OnlyObjex"
                        width={152}
                        height={36}
                        className="h-7 w-auto brightness-[1.6] contrast-[1.1]"
                      />
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="rounded-3xl border border-[var(--color-border)] bg-[var(--color-surface-muted)] p-4">
                      <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--color-accent)]">
                        Tagline
                      </p>
                      <p className="mt-2 text-lg font-semibold">
                        She likes a long look, a tight crop, and the kind of
                        flash that leaves people blinking.
                      </p>
                    </div>
                    <div className="grid gap-3 sm:grid-cols-2">
                      <div className="rounded-3xl border border-[var(--color-border)] p-4">
                        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-emerald-600">
                          Green Flags
                        </p>
                        <p className="mt-2 text-sm leading-6 text-[var(--color-text-soft)]">
                          Great focus. Strong boundaries. Knows every good angle.
                        </p>
                      </div>
                      <div className="rounded-3xl border border-[var(--color-border)] p-4">
                        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-rose-600">
                          Red Flags
                        </p>
                        <p className="mt-2 text-sm leading-6 text-[var(--color-text-soft)]">
                          Will absolutely zoom in on your weaknesses.
                        </p>
                      </div>
                    </div>
                    <div className="rounded-3xl border border-[var(--color-border)] bg-white p-4">
                      <p className="text-sm font-medium text-[var(--color-text-soft)]">
                        Opening line
                      </p>
                      <p className="mt-2 text-base font-semibold">
                        “Relax. I only get this close when there’s something
                        worth developing.” 
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section
          id="teasers"
          className="mx-auto w-full max-w-6xl px-4 pb-16 sm:px-6 lg:pb-24"
        >
          <div className="mb-6 flex items-end justify-between gap-4">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-[var(--color-accent)]">
                Featured Objex
              </p>
              <h2 className="mt-2 font-display text-3xl font-semibold tracking-tight">
                Premium profile energy. Ridiculous object copy.
              </h2>
            </div>
            <Link
              href="/create"
              className="hidden rounded-full border border-[var(--color-border)] bg-white px-5 py-2.5 text-sm font-semibold text-[var(--color-text)] sm:inline-flex"
            >
              Make your own
            </Link>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            {teaserProfiles.map((profile) => (
              <article
                key={profile.name}
                className="soft-shadow rounded-[1.75rem] border border-[var(--color-border)] bg-white p-5"
              >
                <div className="mb-5 flex items-center gap-3">
                  <div className="h-12 w-12 rounded-2xl bg-[linear-gradient(135deg,#d9f7ff,#00aff0)]" />
                  <div>
                    <h3 className="font-display text-2xl font-semibold tracking-tight">
                      {profile.name}
                    </h3>
                    <p className="text-sm text-[var(--color-text-soft)]">
                      {profile.objectType}
                    </p>
                  </div>
                </div>
                <p className="text-base leading-7 text-[var(--color-text-soft)]">
                  {profile.tagline}
                </p>
              </article>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
