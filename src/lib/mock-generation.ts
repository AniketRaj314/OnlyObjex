import type { ExtractionResult, ObjexProfile } from "@/lib/schemas/objex";

export function createMockExtraction(): ExtractionResult {
  return {
    objectType: "Everyday Object",
    confidence: 0.43,
    shortDescription:
      "A single household object photographed head-on with clear edges and enough attitude to cause trouble.",
    detectedVisualTraits: [
      "clean silhouette",
      "noticeable texture",
      "slightly glossy surface",
      "obvious functional shape",
    ],
    objectSpecificMetaphors: [
      "good under pressure",
      "always within reach",
      "dangerously useful",
      "built to be handled",
    ],
  };
}

export function createMockProfile(
  extraction: ExtractionResult,
  fileName: string,
): ObjexProfile {
  const baseName = fileName.split(".")[0] || "Velvet Thing";

  return {
    name: `${baseName.replace(/[-_]/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())} Deluxe`,
    objectType: extraction.objectType,
    tagline:
      "Looks practical at first glance. Then the subtext starts smirking.",
    bio: `An unapologetically useful ${extraction.objectType.toLowerCase()} with a polished exterior, suspicious confidence, and the kind of energy that makes ordinary errands feel like foreplay for bad decisions. It knows exactly what it's implying and absolutely intends to let that thought linger.`,
    kinks: [
      "being put to work and praised for it",
      "close-range attention",
      "situations with tension, pressure, or both",
    ],
    greenFlags: [
      "reliable when things get messy",
      "object-specific wit instead of generic flirting",
      "committed to the bit",
    ],
    redFlags: [
      "knows it is the hottest thing in the room",
      "weaponizes eye contact without having eyes",
      "turns mundane chores into loaded conversation",
    ],
    openingMessage:
      "You can call me practical if that helps you cope, but we both know I’m here to complicate the atmosphere.",
    hidden: {
      detectedVisualTraits: extraction.detectedVisualTraits,
      corePersonality: "Confident, teasing, useful, and gloriously self-aware.",
      flirtStyle: "Brazen innuendo with a very straight face.",
      humorStyle: "Campy, object-specific, and mildly menacing in a fun way.",
      darknessLevel: 6,
      shamelessnessLevel: 8,
      speakingStyle: "Smooth, sharp, and a little too pleased with itself.",
      forbiddenToneRules: [
        "No explicit anatomy",
        "No porn language",
        "No wholesome Pixar energy",
      ],
      signatureMetaphors: extraction.objectSpecificMetaphors,
    },
  };
}
