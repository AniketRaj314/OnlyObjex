"use client";

import Image from "next/image";
import { useEffect, useMemo, useState, useTransition } from "react";
import {
  Copy,
  Film,
  LoaderCircle,
  Search,
  Sparkles,
  WandSparkles,
  X,
} from "lucide-react";
import {
  sceneGenerationRequestSchema,
  sceneRenderJobSchema,
  scenePlannerResponseSchema,
  type SceneRenderJob,
  type ScenePlannerResponse,
  type StoredObjex,
} from "@/lib/schemas/objex";
import { sceneMoodModifiers, sceneScenarioPresets } from "@/lib/scenes";

function snippet(input: string, maxLength: number) {
  if (input.length <= maxLength) {
    return input;
  }

  return `${input.slice(0, maxLength).trimEnd()}...`;
}

function ObjexPickerCard(props: {
  objex: StoredObjex;
  selected: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      onClick={props.onSelect}
      className={`flex w-full items-start gap-3 rounded-[1.2rem] border p-3 text-left transition ${
        props.selected
          ? "border-[var(--color-accent)] bg-[var(--color-accent-soft)]"
          : "border-[var(--color-border)] bg-white hover:border-[var(--color-accent)]"
      }`}
    >
      <div className="relative h-16 w-16 overflow-hidden rounded-[1rem] border border-[var(--color-border)] bg-[linear-gradient(180deg,#e8f9ff,#ffffff)]">
        <Image
          src={props.objex.imagePublicUrl}
          alt={props.objex.profile.name}
          fill
          className="object-cover"
        />
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-2">
          <div>
            <p className="font-semibold text-[var(--color-text)]">
              {props.objex.profile.name}
            </p>
            <p className="text-xs text-[var(--color-text-soft)]">
              {props.objex.profile.objectType}
            </p>
          </div>
          {props.objex.isPublished ? (
            <span className="rounded-full bg-[var(--color-accent-soft)] px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-[var(--color-accent)]">
              Public
            </span>
          ) : (
            <span className="rounded-full border border-[var(--color-border)] bg-white px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-[var(--color-text-soft)]">
              Draft
            </span>
          )}
        </div>
        <p className="mt-2 text-sm leading-6 text-[var(--color-text-soft)]">
          {snippet(props.objex.profile.tagline, 100)}
        </p>
      </div>
    </button>
  );
}

function PickerColumn(props: {
  title: string;
  subtitle: string;
  query: string;
  onQueryChange: (value: string) => void;
  options: StoredObjex[];
  selectedId: string | null;
  blockedId?: string | null;
  onSelect: (id: string) => void;
  allowClear?: boolean;
  onClear?: () => void;
}) {
  return (
    <section className="rounded-[1.5rem] border border-[var(--color-border)] bg-white p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[var(--color-accent)]">
            {props.title}
          </p>
          <p className="mt-1 text-sm text-[var(--color-text-soft)]">
            {props.subtitle}
          </p>
        </div>
        {props.allowClear && props.onClear ? (
          <button
            type="button"
            onClick={props.onClear}
            className="rounded-full border border-[var(--color-border)] bg-white px-3 py-1.5 text-xs font-semibold text-[var(--color-text)]"
          >
            Solo scene
          </button>
        ) : null}
      </div>

      <div className="relative mt-4">
        <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--color-text-soft)]" />
        <input
          value={props.query}
          onChange={(event) => props.onQueryChange(event.target.value)}
          placeholder="Search by name, type, or tagline"
          className="w-full rounded-full border border-[var(--color-border)] bg-[var(--color-surface-muted)] py-3 pl-11 pr-11 text-sm text-[var(--color-text)] outline-none transition focus:border-[var(--color-accent)] focus:bg-white"
        />
        {props.query ? (
          <button
            type="button"
            onClick={() => props.onQueryChange("")}
            className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-1 text-[var(--color-text-soft)] transition hover:text-[var(--color-text)]"
          >
            <X className="h-4 w-4" />
          </button>
        ) : null}
      </div>

      <div className="mt-4 max-h-[24rem] space-y-3 overflow-y-auto pr-1">
        {props.options.length === 0 ? (
          <div className="rounded-[1.2rem] border border-dashed border-[var(--color-border)] bg-[var(--color-surface-muted)] px-4 py-5 text-sm leading-6 text-[var(--color-text-soft)]">
            Nothing matches that search.
          </div>
        ) : (
          props.options.map((objex) => (
            <div
              key={objex.id}
              className={props.blockedId === objex.id ? "opacity-45" : ""}
            >
              <ObjexPickerCard
                objex={objex}
                selected={props.selectedId === objex.id}
                onSelect={() => {
                  if (props.blockedId === objex.id) {
                    return;
                  }

                  props.onSelect(objex.id);
                }}
              />
            </div>
          ))
        )}
      </div>
    </section>
  );
}

function ResultSection(props: { title: string; items: string[]; tone?: string }) {
  return (
    <section className="rounded-[1.35rem] border border-[var(--color-border)] bg-white p-4">
      <p className={`text-xs font-semibold uppercase tracking-[0.22em] ${props.tone ?? "text-[var(--color-accent)]"}`}>
        {props.title}
      </p>
      <div className="mt-3 space-y-2">
        {props.items.map((item) => (
          <div
            key={item}
            className="rounded-[1rem] bg-[var(--color-surface-muted)] px-3 py-2.5 text-sm leading-6 text-[var(--color-text-soft)]"
          >
            {item}
          </div>
        ))}
      </div>
    </section>
  );
}

export function SceneStudio({ objexRoster }: { objexRoster: StoredObjex[] }) {
  const [primaryQuery, setPrimaryQuery] = useState("");
  const [secondaryQuery, setSecondaryQuery] = useState("");
  const [primaryId, setPrimaryId] = useState<string | null>(objexRoster[0]?.id ?? null);
  const [secondaryId, setSecondaryId] = useState<string | null>(null);
  const [scenarioPreset, setScenarioPreset] = useState<string>(sceneScenarioPresets[0]);
  const [customScenarioNote, setCustomScenarioNote] = useState("");
  const [moodModifier, setMoodModifier] = useState<string | null>(null);
  const [result, setResult] = useState<ScenePlannerResponse | null>(null);
  const [renderJob, setRenderJob] = useState<SceneRenderJob | null>(null);
  const [copied, setCopied] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [renderErrorMessage, setRenderErrorMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [isRenderPending, startRenderTransition] = useTransition();

  const primaryOptions = useMemo(() => {
    const normalized = primaryQuery.trim().toLowerCase();
    return objexRoster.filter((objex) => {
      if (!normalized) {
        return true;
      }

      return [
        objex.profile.name,
        objex.profile.objectType,
        objex.profile.tagline,
        objex.profile.bio,
      ]
        .join(" ")
        .toLowerCase()
        .includes(normalized);
    });
  }, [primaryQuery, objexRoster]);

  const secondaryOptions = useMemo(() => {
    const normalized = secondaryQuery.trim().toLowerCase();
    return objexRoster.filter((objex) => {
      if (!normalized) {
        return true;
      }

      return [
        objex.profile.name,
        objex.profile.objectType,
        objex.profile.tagline,
        objex.profile.bio,
      ]
        .join(" ")
        .toLowerCase()
        .includes(normalized);
    });
  }, [secondaryQuery, objexRoster]);

  const primaryObjex =
    objexRoster.find((candidate) => candidate.id === primaryId) ?? null;
  const secondaryObjex =
    objexRoster.find((candidate) => candidate.id === secondaryId) ?? null;

  useEffect(() => {
    if (!renderJob || !["queued", "in_progress"].includes(renderJob.status)) {
      return;
    }

    const intervalId = window.setInterval(async () => {
      try {
        const response = await fetch(`/api/scenes/render/${renderJob.id}`);
        const payload = await response.json();

        if (!response.ok) {
          throw new Error(
            payload?.error ?? "Could not refresh video render status.",
          );
        }

        const nextJob = sceneRenderJobSchema.parse(payload);
        setRenderJob(nextJob);

        if (nextJob.status === "failed" && nextJob.error?.message) {
          setRenderErrorMessage(nextJob.error.message);
        }
      } catch (error) {
        setRenderErrorMessage(
          error instanceof Error
            ? error.message
            : "Could not refresh video render status.",
        );
      }
    }, 10000);

    return () => {
      window.clearInterval(intervalId);
    };
  }, [renderJob]);

  function submitScene() {
    if (!primaryObjex) {
      setErrorMessage("Pick a primary Objex first.");
      return;
    }

    if (secondaryObjex && secondaryObjex.id === primaryObjex.id) {
      setErrorMessage("Use a different secondary Objex or switch to a solo scene.");
      return;
    }

    setErrorMessage(null);
    setCopied(false);
    setRenderJob(null);
    setRenderErrorMessage(null);

    startTransition(async () => {
      try {
        const requestBody = sceneGenerationRequestSchema.parse({
          primaryObjexId: primaryObjex.id,
          secondaryObjexId: secondaryObjex?.id ?? null,
          scenarioPreset,
          customScenarioNote,
          moodModifier,
        });

        const response = await fetch("/api/scenes/generate", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(requestBody),
        });

        const payload = (await response.json()) as
          | ({ error?: string } & Partial<ScenePlannerResponse>)
          | undefined;

        if (!response.ok) {
          throw new Error(payload?.error ?? "Scene generation failed.");
        }

        setResult(scenePlannerResponseSchema.parse(payload));
      } catch (error) {
        setErrorMessage(
          error instanceof Error ? error.message : "Scene generation failed.",
        );
      }
    });
  }

  async function copyPrompt() {
    if (!result) {
      return;
    }

    await navigator.clipboard.writeText(result.plan.finalSoraPrompt);
    setCopied(true);

    window.setTimeout(() => {
      setCopied(false);
    }, 1800);
  }

  function confirmAndRenderScene() {
    if (!result) {
      return;
    }

    setRenderErrorMessage(null);

    startRenderTransition(async () => {
      try {
        const response = await fetch("/api/scenes/render", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            finalSoraPrompt: result.plan.finalSoraPrompt,
          }),
        });

        const payload = await response.json();

        if (!response.ok) {
          throw new Error(payload?.error ?? "Video generation failed to start.");
        }

        setRenderJob(sceneRenderJobSchema.parse(payload));
      } catch (error) {
        setRenderErrorMessage(
          error instanceof Error
            ? error.message
            : "Video generation failed to start.",
        );
      }
    });
  }

  return (
    <div className="space-y-6">
      <section className="rounded-[1.9rem] border border-[var(--color-border)] bg-white p-5 sm:p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--color-accent)]">
              Scene Generation
            </p>
            <h2 className="mt-2 text-2xl font-semibold tracking-tight text-[var(--color-text)] sm:text-3xl">
              Drop one or two Objex into a prestige-grade scandal.
            </h2>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-[var(--color-text-soft)] sm:text-base">
              Build a cinematic scene treatment and a render-ready Sora prompt
              without turning the product into a debug console.
            </p>
          </div>

          <button
            type="button"
            onClick={submitScene}
            disabled={isPending || !primaryObjex}
            className="inline-flex items-center justify-center gap-2 rounded-full bg-[var(--color-accent)] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[var(--color-accent-strong)] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isPending ? (
              <LoaderCircle className="h-4 w-4 animate-spin" />
            ) : (
              <WandSparkles className="h-4 w-4" />
            )}
            Generate scene
          </button>
        </div>

        <div className="mt-5 grid gap-4 xl:grid-cols-2">
          <PickerColumn
            title="Primary Objex"
            subtitle="The lead object carrying the scene."
            query={primaryQuery}
            onQueryChange={setPrimaryQuery}
            options={primaryOptions}
            selectedId={primaryId}
            blockedId={secondaryId}
            onSelect={setPrimaryId}
          />
          <PickerColumn
            title="Secondary Objex"
            subtitle="Optional co-star, rival, ex, accomplice, or workplace problem."
            query={secondaryQuery}
            onQueryChange={setSecondaryQuery}
            options={secondaryOptions}
            selectedId={secondaryId}
            blockedId={primaryId}
            onSelect={setSecondaryId}
            allowClear
            onClear={() => setSecondaryId(null)}
          />
        </div>

        <div className="mt-5 grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
          <section className="rounded-[1.35rem] border border-[var(--color-border)] bg-[var(--color-surface-muted)] p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[var(--color-accent)]">
              Scenario Preset
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              {sceneScenarioPresets.map((preset) => {
                const active = preset === scenarioPreset;

                return (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => setScenarioPreset(preset)}
                    className={`rounded-full px-3.5 py-2 text-sm font-medium transition ${
                      active
                        ? "bg-[var(--color-accent)] text-white"
                        : "border border-[var(--color-border)] bg-white text-[var(--color-text-soft)] hover:border-[var(--color-accent)] hover:text-[var(--color-accent)]"
                    }`}
                  >
                    {preset}
                  </button>
                );
              })}
            </div>

            <label className="mt-4 block">
              <span className="text-xs font-semibold uppercase tracking-[0.22em] text-[var(--color-accent)]">
                Custom Note
              </span>
              <textarea
                value={customScenarioNote}
                onChange={(event) => setCustomScenarioNote(event.target.value)}
                rows={4}
                placeholder="Add one extra twist, staging note, or emotional problem."
                className="mt-3 w-full resize-none rounded-[1.15rem] border border-[var(--color-border)] bg-white px-4 py-3 text-sm leading-6 text-[var(--color-text)] outline-none transition focus:border-[var(--color-accent)]"
              />
            </label>
          </section>

          <section className="rounded-[1.35rem] border border-[var(--color-border)] bg-white p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[var(--color-accent)]">
              Mood Modifier
            </p>
            <div className="mt-3 grid gap-2">
              {sceneMoodModifiers.map((option) => {
                const active = option === moodModifier;

                return (
                  <button
                    key={option}
                    type="button"
                    onClick={() =>
                      setMoodModifier((current) =>
                        current === option ? null : option,
                      )
                    }
                    className={`rounded-[1rem] px-3 py-2.5 text-left text-sm font-medium transition ${
                      active
                        ? "bg-[var(--color-accent-soft)] text-[var(--color-text)] ring-1 ring-[var(--color-accent)]"
                        : "border border-[var(--color-border)] bg-[var(--color-surface-muted)] text-[var(--color-text-soft)] hover:border-[var(--color-accent)]"
                    }`}
                  >
                    {option}
                  </button>
                );
              })}
            </div>
            <p className="mt-4 text-sm leading-6 text-[var(--color-text-soft)]">
              Keep it empty for the default product voice, or tilt the planner
              darker, funnier, more chaotic, or more luxurious.
            </p>
          </section>
        </div>
      </section>

      {errorMessage ? (
        <div className="rounded-[1.35rem] border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          {errorMessage}
        </div>
      ) : null}

      {result ? (
        <section className="rounded-[1.9rem] border border-[var(--color-border)] bg-white p-5 sm:p-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--color-accent)]">
                Generated Scene Plan
              </p>
              <h3 className="mt-2 text-2xl font-semibold tracking-tight text-[var(--color-text)] sm:text-3xl">
                {result.scenarioPreset}
                {result.moodModifier ? `, ${result.moodModifier}` : ""}
              </h3>
              <p className="mt-2 max-w-3xl text-sm leading-6 text-[var(--color-text-soft)] sm:text-base">
                {result.plan.scenePremise}
              </p>
            </div>
            <div className="rounded-[1.25rem] border border-[var(--color-border)] bg-[var(--color-surface-muted)] px-4 py-3">
              <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--color-accent)]">
                Cast
              </p>
              <p className="mt-1 text-sm font-semibold text-[var(--color-text)]">
                {result.participants.map((item) => item.name).join(" x ")}
              </p>
            </div>
          </div>

          <div className="mt-5 flex flex-wrap items-center gap-3 rounded-[1.35rem] border border-[var(--color-border)] bg-[var(--color-surface-muted)] p-4">
            <div className="min-w-0 flex-1">
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[var(--color-accent)]">
                Render Step
              </p>
              <p className="mt-1 text-sm leading-6 text-[var(--color-text-soft)]">
                Confirm the treatment, then render a real Sora teaser. Current
                API clip lengths top out at 12 seconds, so this runs as a fast
                premium teaser rather than a 30-second short.
              </p>
            </div>
            <button
              type="button"
              onClick={confirmAndRenderScene}
              disabled={isRenderPending}
              className="inline-flex items-center justify-center gap-2 rounded-full bg-[var(--color-accent)] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[var(--color-accent-strong)] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isRenderPending ? (
                <LoaderCircle className="h-4 w-4 animate-spin" />
              ) : (
                <Film className="h-4 w-4" />
              )}
              {renderJob ? "Render again" : "Confirm and render video"}
            </button>
          </div>

          <div className="mt-5 grid gap-4 lg:grid-cols-2">
            <section className="rounded-[1.35rem] border border-[var(--color-border)] bg-[var(--color-surface-muted)] p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[var(--color-accent)]">
                Relationship Dynamic
              </p>
              <p className="mt-3 text-sm leading-7 text-[var(--color-text-soft)]">
                {result.plan.relationshipDynamic}
              </p>
            </section>
            <ResultSection title="Visual Style" items={result.plan.visualStyle} />
          </div>

          <div className="mt-4 grid gap-4 lg:grid-cols-2">
            <ResultSection title="Environment" items={result.plan.environment} />
            <section className="rounded-[1.35rem] border border-[var(--color-border)] bg-white p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[var(--color-accent)]">
                Object Depiction
              </p>
              <div className="mt-3 grid gap-3">
                <div className="rounded-[1rem] bg-[var(--color-surface-muted)] px-3 py-3">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--color-accent)]">
                    Primary Objex
                  </p>
                  <p className="mt-2 text-sm leading-6 text-[var(--color-text-soft)]">
                    {result.plan.objectDepiction.primaryObjex}
                  </p>
                </div>
                <div className="rounded-[1rem] bg-[var(--color-surface-muted)] px-3 py-3">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--color-accent)]">
                    Secondary Objex
                  </p>
                  <p className="mt-2 text-sm leading-6 text-[var(--color-text-soft)]">
                    {result.plan.objectDepiction.secondaryObjex}
                  </p>
                </div>
              </div>
            </section>
          </div>

          <div className="mt-4 grid gap-4 lg:grid-cols-2">
            <ResultSection title="Camera Plan" items={result.plan.cameraPlan} />
            <ResultSection title="Lighting Plan" items={result.plan.lightingPlan} />
            <ResultSection title="Motion Plan" items={result.plan.motionPlan} />
            <ResultSection title="Sound Plan" items={result.plan.soundPlan} />
          </div>

          <div className="mt-4 grid gap-4 lg:grid-cols-[0.8fr_1.2fr]">
            <ResultSection
              title="Dialogue Snippets"
              items={result.plan.dialogueSnippets}
            />
            <section className="rounded-[1.35rem] border border-[var(--color-border)] bg-white p-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[var(--color-accent)]">
                    Final Sora Prompt
                  </p>
                  <p className="mt-1 text-sm text-[var(--color-text-soft)]">
                    Copy-friendly and ready for the render step when we plug it in.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => void copyPrompt()}
                  className="inline-flex items-center gap-2 rounded-full border border-[var(--color-border)] bg-[var(--color-surface-muted)] px-4 py-2 text-sm font-semibold text-[var(--color-text)] transition hover:border-[var(--color-accent)] hover:text-[var(--color-accent)]"
                >
                  <Copy className="h-4 w-4" />
                  {copied ? "Copied" : "Copy prompt"}
                </button>
              </div>
              <div className="mt-4 rounded-[1.15rem] border border-[var(--color-border)] bg-[var(--color-surface-muted)] p-4">
                <pre className="whitespace-pre-wrap break-words font-sans text-sm leading-7 text-[var(--color-text-soft)]">
                  {result.plan.finalSoraPrompt}
                </pre>
              </div>
            </section>
          </div>

          <div className="mt-4">
            <ResultSection
              title="Avoid List"
              tone="text-rose-600"
              items={result.plan.avoidList}
            />
          </div>

          {renderErrorMessage ? (
            <div className="mt-4 rounded-[1.35rem] border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
              {renderErrorMessage}
            </div>
          ) : null}

          {renderJob ? (
            <section className="mt-4 rounded-[1.35rem] border border-[var(--color-border)] bg-white p-4">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[var(--color-accent)]">
                    Video Render
                  </p>
                  <h4 className="mt-2 text-xl font-semibold tracking-tight text-[var(--color-text)]">
                    {renderJob.status === "completed"
                      ? "Teaser ready"
                      : renderJob.status === "failed"
                        ? "Render failed"
                        : "Rendering teaser"}
                  </h4>
                  <p className="mt-2 text-sm leading-6 text-[var(--color-text-soft)]">
                    Model {renderJob.model}, {renderJob.seconds}s, {renderJob.size}.
                  </p>
                </div>
                <div className="rounded-[1.25rem] border border-[var(--color-border)] bg-[var(--color-surface-muted)] px-4 py-3">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--color-accent)]">
                    Progress
                  </p>
                  <p className="mt-1 text-sm font-semibold text-[var(--color-text)]">
                    {renderJob.progress}%
                  </p>
                </div>
              </div>

              <div className="mt-4 h-3 overflow-hidden rounded-full bg-[var(--color-surface-muted)]">
                <div
                  className="h-full rounded-full bg-[var(--color-accent)] transition-all"
                  style={{ width: `${renderJob.progress}%` }}
                />
              </div>

              {renderJob.status === "completed" && renderJob.videoPublicUrl ? (
                <div className="mt-5 overflow-hidden rounded-[1.25rem] border border-[var(--color-border)] bg-[var(--color-surface-muted)] p-3">
                  <video
                    controls
                    preload="metadata"
                    src={renderJob.videoPublicUrl}
                    className="w-full rounded-[1rem] bg-black"
                  />
                </div>
              ) : (
                <div className="mt-5 rounded-[1.25rem] border border-dashed border-[var(--color-border)] bg-[var(--color-surface-muted)] px-4 py-4 text-sm leading-6 text-[var(--color-text-soft)]">
                  {renderJob.status === "failed"
                    ? renderJob.error?.message ??
                      "The render failed before a video could be delivered."
                    : "The teaser is queued with Sora now. This panel will update automatically until the finished MP4 is ready."}
                </div>
              )}
            </section>
          ) : null}
        </section>
      ) : null}

      {!result ? (
        <section className="rounded-[1.6rem] border border-[var(--color-border)] bg-white p-6 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[var(--color-accent-soft)] text-[var(--color-accent)]">
            <Sparkles className="h-6 w-6" />
          </div>
          <h3 className="mt-4 text-2xl font-semibold tracking-tight text-[var(--color-text)]">
            Scene treatment first. Rendering next.
          </h3>
          <p className="mx-auto mt-3 max-w-2xl text-sm leading-7 text-[var(--color-text-soft)] sm:text-base">
            Generate the cinematic plan, inspect the staging and Sora prompt,
            then we can plug in actual video rendering without redesigning the
            product around a temporary prototype.
          </p>
        </section>
      ) : null}
    </div>
  );
}
