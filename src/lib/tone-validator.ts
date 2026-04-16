import type { ExtractionResult, ObjexProfile } from "@/lib/schemas/objex";

const explicitTerms = [
  "cock",
  "pussy",
  "cum",
  "orgasm",
  "dildo",
  "penetrat",
  "fuck",
  "porn",
  "naked",
  "thrust",
];

const genericTonePatterns = [
  "quirky little",
  "pixar",
  "cozy vibes",
  "bestie",
  "wholesome",
  "cutie patootie",
  "anxiety",
];

function normalize(input: string) {
  return input.toLowerCase();
}

function collectProfileText(profile: ObjexProfile) {
  return [
    profile.name,
    profile.tagline,
    profile.bio,
    profile.openingMessage,
    ...profile.kinks,
    ...profile.greenFlags,
    ...profile.redFlags,
    ...profile.hidden.signatureMetaphors,
  ].join(" ");
}

export function validateObjexTone(params: {
  extraction: ExtractionResult;
  profile: ObjexProfile;
}) {
  const { extraction, profile } = params;
  const issues: string[] = [];
  const profileText = normalize(collectProfileText(profile));
  const objectType = normalize(extraction.objectType);

  if (explicitTerms.some((term) => profileText.includes(term))) {
    issues.push("Keep the profile suggestive but clean-language and demo-safe.");
  }

  if (genericTonePatterns.some((pattern) => profileText.includes(pattern))) {
    issues.push("Avoid wholesome, quirky, or generic chatbot tone.");
  }

  if (
    !profileText.includes(objectType) &&
    !extraction.objectSpecificMetaphors.some((metaphor) =>
      profileText.includes(normalize(metaphor)),
    )
  ) {
    issues.push("Make the jokes more specific to the identified object.");
  }

  const hiddenTraits = profile.hidden.detectedVisualTraits
    .map(normalize)
    .filter((trait) => profileText.includes(trait)).length;

  if (hiddenTraits < 2) {
    issues.push("Use more of the detected visual traits in the visible copy.");
  }

  return {
    isValid: issues.length === 0,
    issues,
  };
}
