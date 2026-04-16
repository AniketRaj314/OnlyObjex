"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";
import { Search, SlidersHorizontal, Sparkles, X } from "lucide-react";
import type { StoredObjex } from "@/lib/schemas/objex";

function snippet(input: string, maxLength = 120) {
  if (input.length <= maxLength) {
    return input;
  }

  return `${input.slice(0, maxLength).trimEnd()}...`;
}

type SortKey = "newest" | "oldest" | "name" | "shameless";

export function CommunityBrowser({
  publishedObjex,
}: {
  publishedObjex: StoredObjex[];
}) {
  const [query, setQuery] = useState("");
  const [selectedType, setSelectedType] = useState<string>("All");
  const [sortBy, setSortBy] = useState<SortKey>("newest");

  const objectTypes = useMemo(() => {
    return [
      "All",
      ...Array.from(
        new Set(
          publishedObjex
            .map((objex) => objex.profile.objectType.trim())
            .filter(Boolean)
            .sort((a, b) => a.localeCompare(b)),
        ),
      ),
    ];
  }, [publishedObjex]);

  const filteredObjex = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    const filtered = publishedObjex.filter((objex) => {
      const matchesType =
        selectedType === "All" || objex.profile.objectType === selectedType;

      if (!matchesType) {
        return false;
      }

      if (!normalizedQuery) {
        return true;
      }

      const haystack = [
        objex.profile.name,
        objex.profile.objectType,
        objex.profile.tagline,
        objex.profile.bio,
      ]
        .join(" ")
        .toLowerCase();

      return haystack.includes(normalizedQuery);
    });

    filtered.sort((a, b) => {
      switch (sortBy) {
        case "oldest":
          return (
            new Date(a.publishedAt ?? a.createdAt).getTime() -
            new Date(b.publishedAt ?? b.createdAt).getTime()
          );
        case "name":
          return a.profile.name.localeCompare(b.profile.name);
        case "shameless":
          return (
            b.profile.hidden.shamelessnessLevel -
            a.profile.hidden.shamelessnessLevel
          );
        case "newest":
        default:
          return (
            new Date(b.publishedAt ?? b.createdAt).getTime() -
            new Date(a.publishedAt ?? a.createdAt).getTime()
          );
      }
    });

    return filtered;
  }, [publishedObjex, query, selectedType, sortBy]);

  return (
    <div className="space-y-6">
      <section className="rounded-[1.75rem] border border-[var(--color-border)] bg-white p-4 sm:p-5">
        <div className="grid gap-4 lg:grid-cols-[1.3fr_0.7fr]">
          <div className="space-y-4">
            <div className="relative">
              <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--color-text-soft)]" />
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search names, object types, taglines, or bios"
                className="w-full rounded-full border border-[var(--color-border)] bg-[var(--color-surface-muted)] py-3 pl-11 pr-11 text-sm text-[var(--color-text)] outline-none transition focus:border-[var(--color-accent)] focus:bg-white"
              />
              {query ? (
                <button
                  type="button"
                  onClick={() => setQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-1 text-[var(--color-text-soft)] transition hover:text-[var(--color-text)]"
                >
                  <X className="h-4 w-4" />
                </button>
              ) : null}
            </div>

            <div>
              <p className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-[var(--color-accent)]">
                Filter by type
              </p>
              <div className="flex flex-wrap gap-2">
                {objectTypes.map((type) => {
                  const active = selectedType === type;

                  return (
                    <button
                      key={type}
                      type="button"
                      onClick={() => setSelectedType(type)}
                      className={`rounded-full px-3.5 py-2 text-sm font-medium transition ${
                        active
                          ? "bg-[var(--color-accent)] text-white"
                          : "border border-[var(--color-border)] bg-white text-[var(--color-text-soft)] hover:border-[var(--color-accent)] hover:text-[var(--color-accent)]"
                      }`}
                    >
                      {type}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="rounded-[1.4rem] border border-[var(--color-border)] bg-[var(--color-surface-muted)] p-4">
            <div className="flex items-center gap-2 text-[var(--color-accent)]">
              <SlidersHorizontal className="h-4 w-4" />
              <p className="text-xs font-semibold uppercase tracking-[0.2em]">
                Sort
              </p>
            </div>
            <div className="mt-3 grid gap-2">
              {[
                { label: "Newest first", value: "newest" },
                { label: "Oldest first", value: "oldest" },
                { label: "Name A-Z", value: "name" },
                { label: "Most shameless", value: "shameless" },
              ].map((option) => {
                const active = sortBy === option.value;

                return (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => setSortBy(option.value as SortKey)}
                    className={`rounded-[1rem] px-3 py-2.5 text-left text-sm font-medium transition ${
                      active
                        ? "bg-white text-[var(--color-text)] shadow-sm"
                        : "text-[var(--color-text-soft)] hover:bg-white/80"
                    }`}
                  >
                    {option.label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      <section className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-sm text-[var(--color-text-soft)]">
          <Sparkles className="h-4 w-4 text-[var(--color-accent)]" />
          <span>
            Showing <span className="font-semibold text-[var(--color-text)]">{filteredObjex.length}</span>{" "}
            {filteredObjex.length === 1 ? "profile" : "profiles"}
          </span>
        </div>
        {(query || selectedType !== "All" || sortBy !== "newest") && (
          <button
            type="button"
            onClick={() => {
              setQuery("");
              setSelectedType("All");
              setSortBy("newest");
            }}
            className="rounded-full border border-[var(--color-border)] bg-white px-4 py-2 text-sm font-semibold text-[var(--color-text)] transition hover:border-[var(--color-accent)] hover:text-[var(--color-accent)]"
          >
            Reset filters
          </button>
        )}
      </section>

      {filteredObjex.length === 0 ? (
        <section className="rounded-[1.75rem] border border-[var(--color-border)] bg-white p-8 text-center">
          <h2 className="font-display text-3xl font-semibold tracking-tight">
            Nothing matches that vibe.
          </h2>
          <p className="mx-auto mt-3 max-w-2xl text-base leading-7 text-[var(--color-text-soft)]">
            Try a broader search or switch back to all object types.
          </p>
        </section>
      ) : (
        <section className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {filteredObjex.map((objex) => (
            <Link
              key={objex.id}
              href={`/objex/${objex.id}`}
              className="soft-shadow group overflow-hidden rounded-[2rem] border border-[var(--color-border)] bg-white transition hover:-translate-y-1 hover:border-[var(--color-border-strong)]"
            >
              <div className="relative aspect-[4/3] overflow-hidden bg-[linear-gradient(180deg,#e7f8ff,#ffffff)]">
                <Image
                  src={objex.imagePublicUrl}
                  alt={objex.profile.name}
                  fill
                  className="object-cover transition duration-300 group-hover:scale-[1.03]"
                />
              </div>
              <div className="space-y-4 p-5">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h2 className="font-display text-3xl font-semibold tracking-tight">
                      {objex.profile.name}
                    </h2>
                    <p className="mt-1 text-sm text-[var(--color-text-soft)]">
                      {objex.profile.objectType}
                    </p>
                  </div>
                  <span className="rounded-full bg-[var(--color-accent-soft)] px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-[var(--color-accent)]">
                    Public
                  </span>
                </div>
                <p className="text-sm font-semibold leading-6 text-[var(--color-text)]">
                  {snippet(objex.profile.tagline, 96)}
                </p>
                <p className="text-sm leading-7 text-[var(--color-text-soft)]">
                  {snippet(objex.profile.bio, 150)}
                </p>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-muted)] px-3 py-2">
                    <p className="uppercase tracking-[0.14em] text-[var(--color-text-soft)]">
                      Shameless
                    </p>
                    <p className="mt-1 text-sm font-semibold text-[var(--color-text)]">
                      {objex.profile.hidden.shamelessnessLevel}/10
                    </p>
                  </div>
                  <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-muted)] px-3 py-2">
                    <p className="uppercase tracking-[0.14em] text-[var(--color-text-soft)]">
                      Darkness
                    </p>
                    <p className="mt-1 text-sm font-semibold text-[var(--color-text)]">
                      {objex.profile.hidden.darknessLevel}/10
                    </p>
                  </div>
                </div>
                <div className="flex items-center justify-between border-t border-[var(--color-border)] pt-4">
                  <p className="text-xs font-medium uppercase tracking-[0.16em] text-[var(--color-text-soft)]">
                    Published{" "}
                    {new Date(
                      objex.publishedAt ?? objex.createdAt,
                    ).toLocaleDateString()}
                  </p>
                  <span className="text-sm font-semibold text-[var(--color-accent)]">
                    Open profile
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </section>
      )}
    </div>
  );
}
