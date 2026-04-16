"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Camera,
  CameraOff,
  ChevronDown,
  LoaderCircle,
  Sparkles,
  UploadCloud,
  X,
} from "lucide-react";

const loadingStages = [
  "Studying the object like it just walked into the room wearing trouble.",
  "Finding the useful details and loaded metaphors.",
  "Letting GPT-5.4 write something dangerously self-aware.",
  "Saving the scandal and preparing the reveal.",
];

export function CreateFlow() {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [stageIndex, setStageIndex] = useState(0);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [isCameraLoading, setIsCameraLoading] = useState(false);

  useEffect(() => {
    if (!isGenerating) {
      return;
    }

    const interval = window.setInterval(() => {
      setStageIndex((current) => (current + 1) % loadingStages.length);
    }, 1800);

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

  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  const stageLabel = useMemo(() => loadingStages[stageIndex], [stageIndex]);

  function stopCamera() {
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
  }

  async function openCamera() {
    setCameraError(null);

    if (
      typeof navigator === "undefined" ||
      !navigator.mediaDevices ||
      !navigator.mediaDevices.getUserMedia
    ) {
      cameraInputRef.current?.click();
      return;
    }

    setIsCameraLoading(true);

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: { ideal: "environment" },
        },
        audio: false,
      });

      stopCamera();
      streamRef.current = stream;
      setIsCameraOpen(true);

      requestAnimationFrame(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          void videoRef.current.play().catch(() => undefined);
        }
      });
    } catch {
      cameraInputRef.current?.click();
      setCameraError(
        "Live camera access was unavailable here, so your browser may use the normal photo picker instead.",
      );
    } finally {
      setIsCameraLoading(false);
    }
  }

  async function capturePhoto() {
    if (!videoRef.current || !canvasRef.current) {
      return;
    }

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const width = video.videoWidth || 1280;
    const height = video.videoHeight || 960;
    canvas.width = width;
    canvas.height = height;

    const context = canvas.getContext("2d");

    if (!context) {
      setCameraError("Could not capture the current frame.");
      return;
    }

    context.drawImage(video, 0, 0, width, height);

    const blob = await new Promise<Blob | null>((resolve) => {
      canvas.toBlob(resolve, "image/jpeg", 0.92);
    });

    if (!blob) {
      setCameraError("Camera capture failed. Try again.");
      return;
    }

    const file = new File([blob], `onlyobjex-camera-${Date.now()}.jpg`, {
      type: "image/jpeg",
    });

    setSelectedFile(file);
    setErrorMessage(null);
    setIsCameraOpen(false);
    stopCamera();
  }

  function closeCamera() {
    setIsCameraOpen(false);
    stopCamera();
  }

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
    <>
      <div>
        <form
          onSubmit={handleSubmit}
          className="soft-shadow rounded-[1.75rem] border border-[var(--color-border)] bg-white p-4 sm:p-5"
        >
          <div className="mb-4 flex items-start justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--color-accent)]">
                Upload
              </p>
              <h2 className="mt-1.5 font-display text-[2rem] font-semibold tracking-tight sm:text-[2.25rem]">
                {selectedFile ? "Photo locked in." : "One object. One photo."}
              </h2>
              <p className="mt-2 text-sm leading-6 text-[var(--color-text-soft)]">
                {selectedFile
                  ? "Looks good. Reveal when you're ready."
                  : "We go straight from photo to reveal."}
              </p>
            </div>
            <div className="rounded-2xl bg-[var(--color-accent-soft)] p-2.5 text-[var(--color-accent)]">
              <Camera className="h-4 w-4" />
            </div>
          </div>

          {!selectedFile ? (
            <div className="space-y-4">
              <div className="rounded-[1.5rem] border border-dashed border-[var(--color-border-strong)] bg-[linear-gradient(180deg,#fcfeff,#f3fbff)] p-4">
                <div className="flex items-center gap-3">
                  <div className="rounded-full bg-white p-3 text-[var(--color-accent)] shadow-sm">
                    <UploadCloud className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-base font-semibold text-[var(--color-text)]">
                      Upload or take a real object photo
                    </p>
                    <p className="text-sm text-[var(--color-text-soft)]">
                      Clear subject, simple background, no confirmation step.
                    </p>
                  </div>
                </div>

                <div className="mt-4 grid gap-2.5 sm:grid-cols-2">
                  <button
                    type="button"
                    onClick={openCamera}
                    className="inline-flex items-center justify-center gap-2 rounded-full bg-[var(--color-accent)] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[var(--color-accent-strong)]"
                  >
                    {isCameraLoading ? (
                      <LoaderCircle className="h-4 w-4 animate-spin" />
                    ) : (
                      <Camera className="h-4 w-4" />
                    )}
                    Use camera
                  </button>
                  <button
                    type="button"
                    onClick={() => inputRef.current?.click()}
                    className="inline-flex items-center justify-center gap-2 rounded-full border border-[var(--color-border)] bg-white px-4 py-2.5 text-sm font-semibold text-[var(--color-text)] transition hover:border-[var(--color-accent)] hover:text-[var(--color-accent)]"
                  >
                    <UploadCloud className="h-4 w-4" />
                    Upload photo
                  </button>
                </div>
              </div>

              <div className="rounded-[1.3rem] border border-[var(--color-border)] bg-[var(--color-surface-muted)] p-3.5">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--color-text-soft)]">
                      Selected
                    </p>
                    <p className="mt-1 text-sm font-semibold text-[var(--color-text)] sm:text-base">
                      Nothing uploaded yet
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="grid gap-4 md:grid-cols-[260px_1fr]">
                <div className="rounded-[1.4rem] border border-[var(--color-border)] bg-[var(--color-surface-muted)] p-3">
                  <div className="relative aspect-[4/5] overflow-hidden rounded-[1.1rem] bg-[linear-gradient(180deg,#e9f8ff,#f8fcff)]">
                    {previewUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={previewUrl}
                        alt="Uploaded object preview"
                        className="h-full w-full object-cover"
                      />
                    ) : null}
                  </div>
                </div>

                <div className="rounded-[1.4rem] border border-[var(--color-border)] bg-[linear-gradient(180deg,#fcfeff,#f7fbff)] p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--color-accent)]">
                        Selected
                      </p>
                      <p className="mt-1 text-sm font-semibold text-[var(--color-text)] sm:text-base">
                        {selectedFile.name}
                      </p>
                    </div>
                    <span className="rounded-full bg-white px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--color-accent)]">
                      Ready
                    </span>
                  </div>

                  <p className="mt-4 text-lg font-semibold tracking-tight text-[var(--color-text)]">
                    {isGenerating
                      ? stageLabel
                      : "Ready to generate the Objex reveal."}
                  </p>

                  <div className="mt-4 grid gap-2">
                    {loadingStages.map((stage, index) => {
                      const active = isGenerating && index === stageIndex;
                      const complete = isGenerating && index < stageIndex;

                      return (
                        <div
                          key={stage}
                          className={`rounded-[1rem] border px-3 py-2.5 text-sm transition ${
                            active
                              ? "border-[var(--color-accent)] bg-[var(--color-accent-soft)] text-[var(--color-text)]"
                              : complete
                                ? "border-emerald-200 bg-emerald-50 text-emerald-800"
                                : "border-[var(--color-border)] bg-white text-[var(--color-text-soft)]"
                          }`}
                        >
                          {stage}
                        </div>
                      );
                    })}
                  </div>

                  <div className="mt-4 flex flex-col gap-2.5 sm:flex-row">
                    <button
                      type="button"
                      onClick={() => inputRef.current?.click()}
                      className="inline-flex items-center justify-center gap-2 rounded-full border border-[var(--color-border)] bg-white px-4 py-2.5 text-sm font-semibold text-[var(--color-text)] transition hover:border-[var(--color-accent)] hover:text-[var(--color-accent)]"
                    >
                      <UploadCloud className="h-4 w-4" />
                      Change photo
                    </button>
                    <button
                      type="button"
                      onClick={openCamera}
                      className="inline-flex items-center justify-center gap-2 rounded-full border border-[var(--color-border)] bg-white px-4 py-2.5 text-sm font-semibold text-[var(--color-text)] transition hover:border-[var(--color-accent)] hover:text-[var(--color-accent)]"
                    >
                      <Camera className="h-4 w-4" />
                      Retake
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          <input
            ref={inputRef}
            type="file"
            accept="image/png,image/jpeg,image/webp,image/heic,image/heif"
            onChange={(event) => {
              const file = event.target.files?.[0] ?? null;
              setSelectedFile(file);
              setErrorMessage(null);
            }}
            className="hidden"
          />

          <input
            ref={cameraInputRef}
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

          {errorMessage ? (
            <div className="mt-4 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
              {errorMessage}
            </div>
          ) : null}

          {cameraError ? (
            <div className="mt-4 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700">
              {cameraError}
            </div>
          ) : null}

          <button
            type="submit"
            disabled={!selectedFile || isGenerating}
            className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-full bg-[var(--color-accent)] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[var(--color-accent-strong)] disabled:cursor-not-allowed disabled:opacity-60 sm:text-base"
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

          <details className="mt-4 rounded-[1.2rem] border border-[var(--color-border)] bg-white">
            <summary className="flex cursor-pointer list-none items-center justify-between px-4 py-3 text-sm font-semibold text-[var(--color-text)]">
              Camera and upload notes
              <ChevronDown className="h-4 w-4 text-[var(--color-text-soft)]" />
            </summary>
            <div className="border-t border-[var(--color-border)] px-4 py-3 text-sm leading-6 text-[var(--color-text-soft)]">
              On phones, <span className="font-semibold text-[var(--color-text)]">Use camera</span> can open the device camera directly. On laptops, OnlyObjex now tries live browser camera access first and falls back to the standard picker only if the browser blocks or lacks camera support.
            </div>
          </details>
        </form>
      </div>

      {isCameraOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4">
          <div className="w-full max-w-3xl rounded-[1.75rem] border border-white/10 bg-slate-950 p-4 text-white shadow-2xl">
            <div className="mb-3 flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-cyan-300">
                  Camera Capture
                </p>
                <p className="mt-1 text-sm text-slate-300">
                  Frame one object clearly, then capture.
                </p>
              </div>
              <button
                type="button"
                onClick={closeCamera}
                className="rounded-full border border-white/15 p-2 text-slate-300 transition hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="overflow-hidden rounded-[1.4rem] bg-black">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="aspect-video w-full object-cover"
              />
            </div>

            <div className="mt-4 flex flex-col gap-2.5 sm:flex-row">
              <button
                type="button"
                onClick={capturePhoto}
                className="inline-flex items-center justify-center gap-2 rounded-full bg-[var(--color-accent)] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[var(--color-accent-strong)]"
              >
                <Camera className="h-4 w-4" />
                Capture photo
              </button>
              <button
                type="button"
                onClick={closeCamera}
                className="inline-flex items-center justify-center gap-2 rounded-full border border-white/15 px-5 py-3 text-sm font-semibold text-slate-200 transition hover:border-white/30"
              >
                <CameraOff className="h-4 w-4" />
                Cancel
              </button>
            </div>

            <canvas ref={canvasRef} className="hidden" />
          </div>
        </div>
      ) : null}
    </>
  );
}
