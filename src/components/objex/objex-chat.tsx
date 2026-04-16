"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import {
  LoaderCircle,
  MessageCircleMore,
  Mic,
  Send,
  Volume2,
  VolumeX,
} from "lucide-react";
import type { ObjexChatMessage } from "@/lib/schemas/objex";
import type { ObjexVoiceProfile } from "@/lib/schemas/objex";

type ObjexChatProps = {
  objexId: string;
  objectName: string;
  objectType: string;
  initialMessages: ObjexChatMessage[];
  voiceProfile: ObjexVoiceProfile;
};

function getLatestAssistantAudioUrl(messages: ObjexChatMessage[]) {
  for (let index = messages.length - 1; index >= 0; index -= 1) {
    const message = messages[index];

    if (message.role === "assistant" && message.audioPublicUrl) {
      return message.audioPublicUrl;
    }
  }

  return null;
}

export function ObjexChat({
  objexId,
  objectName,
  objectType,
  initialMessages,
  voiceProfile,
}: ObjexChatProps) {
  const [messages, setMessages] = useState(initialMessages);
  const [draft, setDraft] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const [isPending, startTransition] = useTransition();
  const scrollRef = useRef<HTMLDivElement>(null);
  const autoplayedAudioRef = useRef<string | null>(
    getLatestAssistantAudioUrl(initialMessages),
  );

  useEffect(() => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages]);

  useEffect(() => {
    const latestAssistantAudioUrl = getLatestAssistantAudioUrl(messages);

    if (
      !voiceEnabled ||
      !latestAssistantAudioUrl ||
      autoplayedAudioRef.current === latestAssistantAudioUrl
    ) {
      return;
    }

    autoplayedAudioRef.current = latestAssistantAudioUrl;
    const audio = new Audio(latestAssistantAudioUrl);

    void audio.play().catch(() => {
      setErrorMessage("Voice reply is ready below if autoplay was blocked.");
    });

    return () => {
      audio.pause();
      audio.src = "";
    };
  }, [messages, voiceEnabled]);

  function submitMessage() {
    const message = draft.trim();

    if (!message) {
      setErrorMessage("Give your Objex something to work with.");
      return;
    }

    setErrorMessage(null);

    startTransition(async () => {
      try {
        const response = await fetch(`/api/objex/${objexId}/chat`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ message }),
        });

        const payload = (await response.json()) as {
          error?: string;
          messages?: ObjexChatMessage[];
        };

        if (!response.ok || !payload.messages) {
          throw new Error(payload.error ?? "Chat reply failed.");
        }

        const nextMessages = payload.messages;
        setMessages((currentMessages) => [
          ...currentMessages,
          ...nextMessages,
        ]);
        setDraft("");
      } catch (error) {
        setErrorMessage(
          error instanceof Error ? error.message : "Chat reply failed.",
        );
      }
    });
  }

  return (
    <section className="rounded-[1.5rem] border border-[var(--color-border)] bg-white p-4 sm:p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <div className="rounded-xl bg-[var(--color-accent-soft)] p-2.5 text-[var(--color-accent)]">
            <MessageCircleMore className="h-4 w-4" />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[var(--color-accent)]">
              Live Chat
            </p>
            <h2 className="mt-1 text-lg font-semibold text-[var(--color-text)]">
              Text in, voice back
            </h2>
            <p className="mt-1 max-w-2xl text-sm leading-6 text-[var(--color-text-soft)]">
              {objectName} stays in character, answers in text, and speaks each
              reply aloud with its fixed {voiceProfile.voice} voice on{" "}
              {voiceProfile.model}.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setVoiceEnabled((currentValue) => !currentValue)}
          className="inline-flex items-center gap-2 rounded-full border border-[var(--color-border)] bg-[var(--color-surface-muted)] px-3 py-2 text-sm font-semibold text-[var(--color-text)] transition hover:border-[var(--color-accent)] hover:text-[var(--color-accent)]"
        >
          {voiceEnabled ? (
            <Volume2 className="h-4 w-4" />
          ) : (
            <VolumeX className="h-4 w-4" />
          )}
          Voice {voiceEnabled ? "on" : "off"}
        </button>
      </div>

      <div
        ref={scrollRef}
        className="mt-4 max-h-[30rem] space-y-3 overflow-y-auto rounded-[1.4rem] border border-[var(--color-border)] bg-[linear-gradient(180deg,#fcfeff,#f7fbff)] p-3"
      >
        {messages.map((message) => (
          <article
            key={message.id}
            className={`max-w-[90%] rounded-[1.25rem] px-4 py-3 ${
              message.role === "assistant"
                ? "border border-[var(--color-border)] bg-white"
                : "ml-auto bg-[var(--color-accent)] text-white"
            }`}
          >
            <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.18em]">
              {message.role === "assistant" ? objectType : "You"}
            </div>
            <p
              className={`mt-2 text-sm leading-6 ${
                message.role === "assistant"
                  ? "text-[var(--color-text-soft)]"
                  : "text-white/95"
              }`}
            >
              {message.content}
            </p>
            {message.role === "assistant" ? (
              message.audioPublicUrl ? (
                <audio
                  controls
                  preload="metadata"
                  src={message.audioPublicUrl}
                  className="mt-3 w-full"
                />
              ) : (
                <p className="mt-3 flex items-center gap-2 text-xs text-[var(--color-text-soft)]">
                  <Mic className="h-3.5 w-3.5" />
                  Voice was unavailable for this reply.
                </p>
              )
            ) : null}
          </article>
        ))}

        {isPending ? (
          <div className="flex max-w-[90%] items-center gap-3 rounded-[1.25rem] border border-[var(--color-border)] bg-white px-4 py-3 text-sm text-[var(--color-text-soft)]">
            <LoaderCircle className="h-4 w-4 animate-spin text-[var(--color-accent)]" />
            {objectName} is thinking of something inappropriate but presentable.
          </div>
        ) : null}
      </div>

      <div className="mt-4 rounded-[1.4rem] border border-[var(--color-border)] bg-[var(--color-surface-muted)] p-3">
        <label htmlFor="objex-chat-message" className="sr-only">
          Message {objectName}
        </label>
        <textarea
          id="objex-chat-message"
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter" && !event.shiftKey) {
              event.preventDefault();
              submitMessage();
            }
          }}
          rows={3}
          placeholder={`Tell ${objectName} exactly what kind of trouble you have in mind.`}
          className="min-h-28 w-full resize-none rounded-[1.15rem] border border-[var(--color-border)] bg-white px-4 py-3 text-sm leading-6 text-[var(--color-text)] outline-none transition focus:border-[var(--color-accent)]"
        />

        <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs leading-5 text-[var(--color-text-soft)]">
            Replies are shorter now, chat memory carries the running bit, and
            the mic is reserved for voice input next.
          </p>
          <button
            type="button"
            disabled={isPending}
            onClick={submitMessage}
            className="inline-flex items-center justify-center gap-2 rounded-full bg-[var(--color-accent)] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[var(--color-accent-strong)] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isPending ? (
              <LoaderCircle className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
            Send message
          </button>
        </div>

        {errorMessage ? (
          <p className="mt-3 text-sm text-rose-600">{errorMessage}</p>
        ) : null}
      </div>
    </section>
  );
}
