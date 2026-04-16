"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Globe, LoaderCircle, LockKeyhole } from "lucide-react";

type PublishToggleProps = {
  id: string;
  initialIsPublished: boolean;
  initialPublishedAt: string | null;
};

export function PublishToggle({
  id,
  initialIsPublished,
  initialPublishedAt,
}: PublishToggleProps) {
  const router = useRouter();
  const [isPublished, setIsPublished] = useState(initialIsPublished);
  const [publishedAt, setPublishedAt] = useState(initialPublishedAt);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function togglePublish(nextState: boolean) {
    setFeedback(null);

    startTransition(async () => {
      try {
        const response = await fetch(`/api/objex/${id}/publish`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ isPublished: nextState }),
        });

        const payload = (await response.json()) as {
          error?: string;
          isPublished?: boolean;
          publishedAt?: string | null;
        };

        if (!response.ok) {
          throw new Error(payload.error ?? "Publish update failed.");
        }

        setIsPublished(Boolean(payload.isPublished));
        setPublishedAt(payload.publishedAt ?? null);
        setFeedback(
          nextState
            ? "Published to the local community page."
            : "Unpublished from the local community page.",
        );
        router.refresh();
      } catch (error) {
        setFeedback(
          error instanceof Error ? error.message : "Publish update failed.",
        );
      }
    });
  }

  return (
    <section className="rounded-[1.8rem] border border-[var(--color-border)] bg-white p-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-[var(--color-accent)]">
            Local Publish
          </p>
          <h2 className="mt-2 font-display text-3xl font-semibold tracking-tight">
            {isPublished ? "Already causing a scene." : "Ready for the community page."}
          </h2>
          <p className="mt-3 max-w-2xl text-sm leading-7 text-[var(--color-text-soft)]">
            Publishing keeps this Objex local to the project and adds it to
            `/community`. No regeneration, no cloud sync, no extra drama.
          </p>
        </div>
        <div
          className={`rounded-full px-4 py-2 text-sm font-semibold ${
            isPublished
              ? "border border-emerald-200 bg-emerald-50 text-emerald-700"
              : "border border-[var(--color-border)] bg-[var(--color-surface-muted)] text-[var(--color-text-soft)]"
          }`}
        >
          {isPublished ? "Published" : "Private"}
        </div>
      </div>

      <div className="mt-5 flex flex-col gap-3 sm:flex-row">
        <button
          type="button"
          disabled={isPending || isPublished}
          onClick={() => togglePublish(true)}
          className="inline-flex items-center justify-center gap-2 rounded-full bg-[var(--color-accent)] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[var(--color-accent-strong)] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isPending && !isPublished ? (
            <LoaderCircle className="h-4 w-4 animate-spin" />
          ) : (
            <Globe className="h-4 w-4" />
          )}
          Publish to community
        </button>
        <button
          type="button"
          disabled={isPending || !isPublished}
          onClick={() => togglePublish(false)}
          className="inline-flex items-center justify-center gap-2 rounded-full border border-[var(--color-border)] bg-white px-5 py-3 text-sm font-semibold text-[var(--color-text)] transition hover:border-[var(--color-accent)] hover:text-[var(--color-accent)] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isPending && isPublished ? (
            <LoaderCircle className="h-4 w-4 animate-spin" />
          ) : (
            <LockKeyhole className="h-4 w-4" />
          )}
          Unpublish
        </button>
      </div>

      <div className="mt-5 rounded-[1.4rem] border border-[var(--color-border)] bg-[var(--color-surface-muted)] px-4 py-3">
        <p className="text-sm font-medium text-[var(--color-text-soft)]">
          {feedback
            ? feedback
            : publishedAt
              ? `Published ${new Date(publishedAt).toLocaleString()}.`
              : "Still private. Publish when this object is ready for an audience."}
        </p>
      </div>
    </section>
  );
}
