"use client";

import Image from "next/image";
import { useEffect, useMemo, useRef, useState, useTransition } from "react";
import {
  LoaderCircle,
  PauseCircle,
  PlayCircle,
  Search,
  Sparkles,
  Volume2,
  VolumeX,
  X,
} from "lucide-react";
import type {
  ChemistryConversationResponse,
  StoredObjex,
} from "@/lib/schemas/objex";
import { chemistryConversationResponseSchema } from "@/lib/schemas/objex";
import { resolveObjexVoiceProfile } from "@/lib/voice-profile";

function snippet(input: string, maxLength: number) {
  if (input.length <= maxLength) {
    return input;
  }

  return `${input.slice(0, maxLength).trimEnd()}...`;
}

function formatDuration(turns: ChemistryConversationResponse["turns"]) {
  const total = turns.reduce(
    (sum, turn) => sum + (turn.estimatedDurationSeconds ?? 0),
    0,
  );
  const minutes = Math.floor(total / 60);
  const seconds = total % 60;

  if (minutes === 0) {
    return `~${seconds}s`;
  }

  return `~${minutes}:${String(seconds).padStart(2, "0")}`;
}

type ChemistryStudioProps = {
  publishedObjex: StoredObjex[];
};

function ObjexOptionCard(props: {
  objex: StoredObjex;
  selected: boolean;
  disabled?: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      onClick={props.onSelect}
      disabled={props.disabled}
      className={`flex w-full items-start gap-3 rounded-[1.25rem] border p-3 text-left transition ${
        props.selected
          ? "border-[var(--color-accent)] bg-[var(--color-accent-soft)]"
          : "border-[var(--color-border)] bg-white hover:border-[var(--color-accent)]"
      } ${props.disabled ? "cursor-not-allowed opacity-50" : ""}`}
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
          {props.selected ? (
            <span className="rounded-full bg-[var(--color-accent)] px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-white">
              Selected
            </span>
          ) : null}
        </div>
        <p className="mt-2 text-sm leading-6 text-[var(--color-text-soft)]">
          {snippet(props.objex.profile.tagline, 92)}
        </p>
      </div>
    </button>
  );
}

function SelectorColumn(props: {
  title: string;
  query: string;
  onQueryChange: (value: string) => void;
  options: StoredObjex[];
  selectedId: string | null;
  blockedId: string | null;
  onSelect: (id: string) => void;
}) {
  return (
    <section className="rounded-[1.5rem] border border-[var(--color-border)] bg-white p-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[var(--color-accent)]">
            {props.title}
          </p>
          <p className="mt-1 text-sm text-[var(--color-text-soft)]">
            Pick a published Objex with a voice worth hearing.
          </p>
        </div>
      </div>

      <div className="relative mt-4">
        <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--color-text-soft)]" />
        <input
          value={props.query}
          onChange={(event) => props.onQueryChange(event.target.value)}
          placeholder="Search by name, object, or tagline"
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

      <div className="mt-4 max-h-[23rem] space-y-3 overflow-y-auto pr-1">
        {props.options.length === 0 ? (
          <div className="rounded-[1.25rem] border border-dashed border-[var(--color-border)] bg-[var(--color-surface-muted)] px-4 py-5 text-sm leading-6 text-[var(--color-text-soft)]">
            Nothing matches that search. Try a broader vibe.
          </div>
        ) : (
          props.options.map((objex) => (
            <ObjexOptionCard
              key={objex.id}
              objex={objex}
              selected={props.selectedId === objex.id}
              disabled={props.blockedId === objex.id}
              onSelect={() => props.onSelect(objex.id)}
            />
          ))
        )}
      </div>
    </section>
  );
}

function PairPreview(props: { left: StoredObjex; right: StoredObjex }) {
  const participants = [props.left, props.right].map((objex) => ({
    objex,
    voice: resolveObjexVoiceProfile({
      objexId: objex.id,
      profile: objex.profile,
    }),
  }));

  return (
    <section className="rounded-[1.6rem] border border-[var(--color-border)] bg-white p-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[var(--color-accent)]">
            Pair Preview
          </p>
          <h2 className="mt-1 text-xl font-semibold text-[var(--color-text)]">
            {props.left.profile.name} x {props.right.profile.name}
          </h2>
        </div>
        <div className="rounded-full border border-[var(--color-border)] bg-[var(--color-surface-muted)] px-3 py-1.5 text-xs font-medium text-[var(--color-text-soft)]">
          Published chemistry only
        </div>
      </div>

      <div className="mt-4 grid gap-4 md:grid-cols-2">
        {participants.map(({ objex, voice }) => (
          <div
            key={objex.id}
            className="grid grid-cols-[5rem_1fr] gap-3 rounded-[1.25rem] border border-[var(--color-border)] bg-[var(--color-surface-muted)] p-3"
          >
            <div className="relative h-20 w-20 overflow-hidden rounded-[1rem] border border-[var(--color-border)] bg-white">
              <Image
                src={objex.imagePublicUrl}
                alt={objex.profile.name}
                fill
                className="object-cover"
              />
            </div>
            <div className="min-w-0">
              <p className="font-semibold text-[var(--color-text)]">
                {objex.profile.name}
              </p>
              <p className="text-xs text-[var(--color-text-soft)]">
                {objex.profile.objectType}
              </p>
              <p className="mt-2 text-sm leading-6 text-[var(--color-text-soft)]">
                {snippet(objex.profile.tagline, 100)}
              </p>
              <div className="mt-3 flex flex-wrap gap-2 text-[11px] font-semibold uppercase tracking-[0.16em]">
                <span className="rounded-full bg-white px-2.5 py-1 text-[var(--color-accent)]">
                  {voice.voice}
                </span>
                <span className="rounded-full bg-white px-2.5 py-1 text-[var(--color-text-soft)]">
                  {voice.model}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

export function ChemistryStudio({ publishedObjex }: ChemistryStudioProps) {
  const [leftQuery, setLeftQuery] = useState("");
  const [rightQuery, setRightQuery] = useState("");
  const [leftId, setLeftId] = useState<string | null>(
    publishedObjex[0]?.id ?? null,
  );
  const [rightId, setRightId] = useState<string | null>(
    publishedObjex[1]?.id ?? null,
  );
  const [scene, setScene] = useState<ChemistryConversationResponse | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const [currentTurnId, setCurrentTurnId] = useState<string | null>(null);
  const [isPlayingFullScene, setIsPlayingFullScene] = useState(false);
  const [isPending, startTransition] = useTransition();
  const fullSceneAudioRef = useRef<HTMLAudioElement | null>(null);

  const leftOptions = useMemo(() => {
    const normalized = leftQuery.trim().toLowerCase();

    return publishedObjex.filter((objex) => {
      if (!normalized) {
        return true;
      }

      return [
        objex.profile.name,
        objex.profile.objectType,
        objex.profile.tagline,
      ]
        .join(" ")
        .toLowerCase()
        .includes(normalized);
    });
  }, [leftQuery, publishedObjex]);

  const rightOptions = useMemo(() => {
    const normalized = rightQuery.trim().toLowerCase();

    return publishedObjex.filter((objex) => {
      if (!normalized) {
        return true;
      }

      return [
        objex.profile.name,
        objex.profile.objectType,
        objex.profile.tagline,
      ]
        .join(" ")
        .toLowerCase()
        .includes(normalized);
    });
  }, [rightQuery, publishedObjex]);

  const leftObjex =
    publishedObjex.find((candidate) => candidate.id === leftId) ?? null;
  const rightObjex =
    publishedObjex.find((candidate) => candidate.id === rightId) ?? null;

  useEffect(() => {
    return () => {
      fullSceneAudioRef.current?.pause();
      fullSceneAudioRef.current = null;
    };
  }, []);

  function stopFullScenePlayback() {
    fullSceneAudioRef.current?.pause();
    fullSceneAudioRef.current = null;
    setCurrentTurnId(null);
    setIsPlayingFullScene(false);
  }

  function playFullScene() {
    if (!scene || !voiceEnabled) {
      return;
    }

    const playableTurns = scene.turns.filter((turn) => turn.audioPublicUrl);

    if (playableTurns.length === 0) {
      setErrorMessage(
        "The chemistry transcript is ready, but voice clips were unavailable.",
      );
      return;
    }

    stopFullScenePlayback();

    const audio = new Audio();
    fullSceneAudioRef.current = audio;
    setIsPlayingFullScene(true);

    let turnIndex = 0;

    const playNext = () => {
      const nextTurn = playableTurns[turnIndex];

      if (!nextTurn?.audioPublicUrl) {
        stopFullScenePlayback();
        return;
      }

      setCurrentTurnId(nextTurn.id);
      audio.src = nextTurn.audioPublicUrl;
      audio.currentTime = 0;
      audio.muted = !voiceEnabled;
      turnIndex += 1;

      void audio.play().catch(() => {
        setErrorMessage(
          "Full-scene playback was blocked. Try the turn controls below.",
        );
        stopFullScenePlayback();
      });
    };

    audio.onended = () => {
      if (turnIndex >= playableTurns.length) {
        stopFullScenePlayback();
        return;
      }

      playNext();
    };

    audio.onerror = () => {
      if (turnIndex >= playableTurns.length) {
        stopFullScenePlayback();
        return;
      }

      playNext();
    };

    playNext();
  }

  function submitScene() {
    if (!leftObjex || !rightObjex || leftObjex.id === rightObjex.id) {
      setErrorMessage("Choose two different published Objex first.");
      return;
    }

    setErrorMessage(null);
    stopFullScenePlayback();

    startTransition(async () => {
      try {
        const response = await fetch("/api/conversations/generate", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            leftObjexId: leftObjex.id,
            rightObjexId: rightObjex.id,
          }),
        });

        const payload = (await response.json()) as
          | ({ error?: string } & Partial<ChemistryConversationResponse>)
          | undefined;

        if (!response.ok) {
          throw new Error(payload?.error ?? "Chemistry generation failed.");
        }

        setScene(
          chemistryConversationResponseSchema.parse(
            payload,
          ) as ChemistryConversationResponse,
        );
      } catch (error) {
        setErrorMessage(
          error instanceof Error
            ? error.message
            : "Chemistry generation failed.",
        );
      }
    });
  }

  return (
    <div className="space-y-6">
      <section className="rounded-[1.9rem] border border-[var(--color-border)] bg-white p-5 sm:p-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--color-accent)]">
              Pair Generator
            </p>
            <h2 className="mt-2 text-2xl font-semibold tracking-tight text-[var(--color-text)] sm:text-3xl">
              Pick two published Objex and let them misbehave.
            </h2>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-[var(--color-text-soft)] sm:text-base">
              First-time chemistry, six turns, one minute of loaded conversation,
              and each voice stays faithful to its fixed profile.
            </p>
          </div>

          <button
            type="button"
            disabled={
              isPending || !leftObjex || !rightObjex || leftId === rightId
            }
            onClick={submitScene}
            className="inline-flex items-center justify-center gap-2 rounded-full bg-[var(--color-accent)] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[var(--color-accent-strong)] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isPending ? (
              <LoaderCircle className="h-4 w-4 animate-spin" />
            ) : (
              <Sparkles className="h-4 w-4" />
            )}
            Generate chemistry
          </button>
        </div>

        <div className="mt-5 grid gap-4 xl:grid-cols-2">
          <SelectorColumn
            title="Objex A"
            query={leftQuery}
            onQueryChange={setLeftQuery}
            options={leftOptions}
            selectedId={leftId}
            blockedId={rightId}
            onSelect={setLeftId}
          />
          <SelectorColumn
            title="Objex B"
            query={rightQuery}
            onQueryChange={setRightQuery}
            options={rightOptions}
            selectedId={rightId}
            blockedId={leftId}
            onSelect={setRightId}
          />
        </div>
      </section>

      {leftObjex && rightObjex ? (
        <PairPreview left={leftObjex} right={rightObjex} />
      ) : null}

      {errorMessage ? (
        <div className="rounded-[1.4rem] border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          {errorMessage}
        </div>
      ) : null}

      {scene ? (
        <section className="rounded-[1.9rem] border border-[var(--color-border)] bg-white p-5 sm:p-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--color-accent)]">
                Generated Scene
              </p>
              <h3 className="mt-2 text-2xl font-semibold tracking-tight text-[var(--color-text)]">
                {scene.title ?? `${scene.participants[0].name} x ${scene.participants[1].name}`}
              </h3>
              <p className="mt-2 text-sm leading-6 text-[var(--color-text-soft)]">
                {scene.turns.length} turns, alternating from the first line,
                with a spoken runtime of {formatDuration(scene.turns)}.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  setVoiceEnabled((current) => {
                    if (current) {
                      stopFullScenePlayback();
                    }

                    return !current;
                  });
                }}
                className="inline-flex items-center gap-2 rounded-full border border-[var(--color-border)] bg-[var(--color-surface-muted)] px-4 py-2 text-sm font-semibold text-[var(--color-text)] transition hover:border-[var(--color-accent)] hover:text-[var(--color-accent)]"
              >
                {voiceEnabled ? (
                  <Volume2 className="h-4 w-4" />
                ) : (
                  <VolumeX className="h-4 w-4" />
                )}
                Voice {voiceEnabled ? "on" : "off"}
              </button>
              <button
                type="button"
                onClick={isPlayingFullScene ? stopFullScenePlayback : playFullScene}
                disabled={!voiceEnabled}
                className="inline-flex items-center gap-2 rounded-full bg-[var(--color-accent)] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[var(--color-accent-strong)] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isPlayingFullScene ? (
                  <PauseCircle className="h-4 w-4" />
                ) : (
                  <PlayCircle className="h-4 w-4" />
                )}
                {isPlayingFullScene ? "Stop full scene" : "Play full scene"}
              </button>
            </div>
          </div>

          <div className="mt-5 space-y-4">
            {scene.turns.map((turn, index) => {
              const participant = scene.participants.find(
                (item) => item.id === turn.speakerObjexId,
              );

              if (!participant) {
                return null;
              }

              const isActive = currentTurnId === turn.id;

              return (
                <article
                  key={turn.id}
                  className={`rounded-[1.4rem] border p-4 transition ${
                    isActive
                      ? "border-[var(--color-accent)] bg-[var(--color-accent-soft)]"
                      : "border-[var(--color-border)] bg-[var(--color-surface-muted)]"
                  }`}
                >
                  <div className="grid gap-4 md:grid-cols-[auto_1fr_auto] md:items-start">
                    <div className="flex items-center gap-3">
                      <div className="relative h-14 w-14 overflow-hidden rounded-[1rem] border border-[var(--color-border)] bg-white">
                        <Image
                          src={participant.imagePublicUrl}
                          alt={participant.name}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <div>
                        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--color-accent)]">
                          Turn {index + 1}
                        </p>
                        <p className="font-semibold text-[var(--color-text)]">
                          {participant.name}
                        </p>
                        <p className="text-xs text-[var(--color-text-soft)]">
                          {participant.objectType}
                        </p>
                      </div>
                    </div>

                    <div>
                      <p className="text-base leading-7 text-[var(--color-text)]">
                        {turn.text}
                      </p>
                      <p className="mt-2 text-xs text-[var(--color-text-soft)]">
                        {turn.estimatedDurationSeconds}s spoken
                      </p>
                    </div>

                    <div className="min-w-0 md:w-64">
                      {turn.audioPublicUrl ? (
                        <audio
                          controls
                          preload="metadata"
                          muted={!voiceEnabled}
                          src={turn.audioPublicUrl}
                          className="w-full"
                        />
                      ) : (
                        <div className="rounded-[1rem] border border-dashed border-[var(--color-border)] bg-white px-3 py-3 text-xs leading-5 text-[var(--color-text-soft)]">
                          Voice clip unavailable for this line, but the transcript
                          is still perfectly scandalous.
                        </div>
                      )}
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        </section>
      ) : null}
    </div>
  );
}
