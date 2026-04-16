"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Camera, LoaderCircle, Sparkles, UploadCloud } from "lucide-react";

const loadingStages = [
  "Studying the object like it just walked into the room wearing trouble.",
  "Finding the useful details, dangerous angles, and suspiciously loaded metaphors.",
  "Letting GPT-5.4 write a profile with zero shame and strong word choice.",
  "Pressing the reveal powder, glossing the profile, and saving the scandal.",
];

export function CreateFlow() {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [stageIndex, setStageIndex] = useState(0);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!isGenerating) {
      return;
    }

    const interval = window.setInterval(() => {
      setStageIndex((current) => (current + 1) % loadingStages.length);
    }, 2100);

    return () => window.clearInterval(interval);
  }, [isGenerating]);

  useEffect(() => {
    if (!selectedFile) {
      setPreviewUrl(null);
      return;
    }

    const nextUrl = URL.createObjectURL(selectedFile);
    setPreviewUrl(nextUrl);

    return () => {
      URL.revokeObjectURL(nextUrl);
    };
  }, [selectedFile]);

  const stageLabel = useMemo(() => loadingStages[stageIndex], [stageIndex]);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!selectedFile) {
      setErrorMessage("Pick a photo of one object to generate an Objex.");
      return;
    }

    setIsGenerating(true);
    setErrorMessage(null);
    setStageIndex(0);

    try {
      const formData = new FormData();
      formData.append("image", selectedFile);

      const response = await fetch("/api/objex/generate", {
        method: "POST",
        body: formData,
      });

      const payload = (await response.json()) as { id?: string; error?: string };

      if (!response.ok || !payload.id) {
        throw new Error(payload.error ?? "Generation failed.");
      }

      router.push(`/objex/${payload.id}`);
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Generation failed. Try a clearer object photo.",
      );
      setIsGenerating(false);
    }
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
      <form
        onSubmit={handleSubmit}
        className="soft-shadow rounded-[2rem] border border-[var(--color-border)] bg-white p-5 sm:p-7"
      >
        <div className="mb-6 flex items-start justify-between gap-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-[var(--color-accent)]">
              Upload
            </p>
            <h2 className="mt-2 font-display text-3xl font-semibold tracking-tight">
              Give us one object and questionable intentions.
            </h2>
          </div>
          <div className="rounded-2xl bg-[var(--color-accent-soft)] p-3 text-[var(--color-accent)]">
            <Camera className="h-5 w-5" />
          </div>
        </div>

        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="group flex w-full flex-col items-center justify-center rounded-[1.75rem] border border-dashed border-[var(--color-border-strong)] bg-[linear-gradient(180deg,#fcfeff,#f3fbff)] px-6 py-12 text-center transition hover:border-[var(--color-accent)]"
        >
          <div className="mb-5 rounded-full bg-white p-4 text-[var(--color-accent)] shadow-sm">
            <UploadCloud className="h-7 w-7" />
          </div>
          <p className="text-xl font-semibold text-[var(--color-text)]">
            Upload or capture a real object photo
          </p>
          <p className="mt-2 max-w-md text-sm leading-6 text-[var(--color-text-soft)]">
            Best results come from a single object with clear lighting and a
            clean silhouette. We skip confirmation and go straight to the
            reveal.
          </p>
        </button>

        <input
          ref={inputRef}
          type="file"
          accept="image/png,image/jpeg,image/webp,image/heic,image/heif"
          capture="environment"
          onChange={(event) => {
            const file = event.target.files?.[0] ?? null;
            setSelectedFile(file);
            setErrorMessage(null);
          }}
          className="hidden"
        />

        <div className="mt-5 rounded-[1.5rem] border border-[var(--color-border)] bg-[var(--color-surface-muted)] p-4">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-sm font-medium text-[var(--color-text-soft)]">
                Selected photo
              </p>
              <p className="mt-1 text-base font-semibold text-[var(--color-text)]">
                {selectedFile ? selectedFile.name : "Nothing uploaded yet"}
              </p>
            </div>
            {selectedFile ? (
              <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-[var(--color-accent)]">
                Ready
              </span>
            ) : null}
          </div>
        </div>

        {errorMessage ? (
          <div className="mt-4 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
            {errorMessage}
          </div>
        ) : null}

        <button
          type="submit"
          disabled={!selectedFile || isGenerating}
          className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-full bg-[var(--color-accent)] px-6 py-3.5 text-base font-semibold text-white transition hover:bg-[var(--color-accent-strong)] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isGenerating ? (
            <>
              <LoaderCircle className="h-4 w-4 animate-spin" />
              Generating Objex
            </>
          ) : (
            <>
              <Sparkles className="h-4 w-4" />
              Reveal My Objex
            </>
          )}
        </button>
      </form>

      <div className="space-y-6">
        <div className="soft-shadow overflow-hidden rounded-[2rem] border border-[var(--color-border)] bg-white">
          <div className="border-b border-[var(--color-border)] px-5 py-4">
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-[var(--color-accent)]">
              Preview
            </p>
          </div>
          <div className="p-5">
            <div className="relative aspect-[4/5] overflow-hidden rounded-[1.5rem] bg-[linear-gradient(180deg,#e9f8ff,#f8fcff)]">
              {previewUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={previewUrl}
                  alt="Uploaded object preview"
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full items-center justify-center px-8 text-center text-sm leading-6 text-[var(--color-text-soft)]">
                  Your uploaded object image will appear here before the profile reveal.
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="soft-shadow rounded-[2rem] border border-[var(--color-border)] bg-white p-5">
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-[var(--color-accent)]">
            Generation Flow
          </p>
          <div className="mt-4 space-y-3">
            {loadingStages.map((stage, index) => {
              const active = isGenerating && index === stageIndex;
              const complete = isGenerating && index < stageIndex;

              return (
                <div
                  key={stage}
                  className={`rounded-[1.3rem] border px-4 py-3 transition ${
                    active
                      ? "border-[var(--color-accent)] bg-[var(--color-accent-soft)]"
                      : complete
                        ? "border-emerald-200 bg-emerald-50"
                        : "border-[var(--color-border)] bg-[var(--color-surface-muted)]"
                  }`}
                >
                  <p className="text-sm font-medium text-[var(--color-text)]">
                    {stage}
                  </p>
                </div>
              );
            })}
          </div>
          <div className="mt-5 rounded-[1.5rem] border border-[var(--color-border)] bg-[linear-gradient(135deg,#ffffff,#f5fbff)] p-4">
            <p className="text-sm font-medium text-[var(--color-text-soft)]">
              Live status
            </p>
            <p className="mt-2 text-base font-semibold text-[var(--color-text)]">
              {isGenerating
                ? stageLabel
                : "We’ll identify the object, generate the profile, save it, and route you straight to reveal."}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
