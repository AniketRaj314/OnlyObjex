import Link from "next/link";

export default function NotFound() {
  return (
    <div className="app-shell flex items-center justify-center px-4">
      <div className="soft-shadow w-full max-w-lg rounded-[2rem] border border-[var(--color-border)] bg-white p-8 text-center">
        <p className="text-sm font-semibold uppercase tracking-[0.24em] text-[var(--color-accent)]">
          Missing Objex
        </p>
        <h1 className="mt-4 font-display text-4xl font-semibold tracking-tight">
          This object slipped away.
        </h1>
        <p className="mt-4 text-base leading-7 text-[var(--color-text-soft)]">
          The profile you tried to open doesn’t exist in the local database yet.
        </p>
        <Link
          href="/create"
          className="mt-6 inline-flex rounded-full bg-[var(--color-accent)] px-5 py-3 font-semibold text-white"
        >
          Create a fresh Objex
        </Link>
      </div>
    </div>
  );
}
