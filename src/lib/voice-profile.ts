import { env } from "@/lib/env";
import type { ObjexProfile, ObjexVoiceProfile } from "@/lib/schemas/objex";

const femaleVoiceMoods = [
  "velvet and teasing",
  "slow and knowingly amused",
  "smoky and intimate",
  "playful with a sultry edge",
];

function hashString(input: string) {
  let hash = 0;

  for (let index = 0; index < input.length; index += 1) {
    hash = (hash * 31 + input.charCodeAt(index)) >>> 0;
  }

  return hash;
}

function pickBySeed<T>(items: T[], seed: string) {
  return items[hashString(seed) % items.length];
}

function clampSpeed(speed: number | undefined) {
  if (typeof speed !== "number" || Number.isNaN(speed)) {
    return 0.82;
  }

  return Math.min(1.2, Math.max(0.7, speed));
}

function sanitizeVoiceProfile(params: {
  objexId: string;
  profile: ObjexProfile;
  storedVoiceProfile: ObjexVoiceProfile;
}): ObjexVoiceProfile {
  const { storedVoiceProfile } = params;

  return {
    model: env.openAiTtsModels.includes(storedVoiceProfile.model)
      ? storedVoiceProfile.model
      : pickBySeed(env.openAiTtsModels, `${params.objexId}:model`),
    voice: env.openAiTtsVoices.includes(storedVoiceProfile.voice)
      ? storedVoiceProfile.voice
      : pickBySeed(env.openAiTtsVoices, `${params.objexId}:voice`),
    mood:
      storedVoiceProfile.mood?.trim().length > 0
        ? storedVoiceProfile.mood
        : pickBySeed(
            femaleVoiceMoods,
            `${params.profile.name}:${params.profile.objectType}:mood`,
          ),
    speed: clampSpeed(storedVoiceProfile.speed),
  };
}

function buildFallbackVoiceProfile(params: {
  objexId: string;
  profile: ObjexProfile;
}): ObjexVoiceProfile {
  return {
    model: pickBySeed(env.openAiTtsModels, `${params.objexId}:model`),
    voice: pickBySeed(env.openAiTtsVoices, `${params.objexId}:voice`),
    mood: pickBySeed(
      femaleVoiceMoods,
      `${params.profile.name}:${params.profile.objectType}:mood`,
    ),
    speed: clampSpeed(
      pickBySeed([0.78, 0.82, 0.86], `${params.objexId}:speed`),
    ),
  };
}

export function resolveObjexVoiceProfile(params: {
  objexId: string;
  profile: ObjexProfile;
}): ObjexVoiceProfile {
  if (params.profile.hidden.voiceProfile) {
    return sanitizeVoiceProfile({
      objexId: params.objexId,
      profile: params.profile,
      storedVoiceProfile: params.profile.hidden.voiceProfile,
    });
  }

  return buildFallbackVoiceProfile({
    objexId: params.objexId,
    profile: params.profile,
  });
}

export function assignObjexVoiceProfile(params: {
  objexId: string;
  profile: ObjexProfile;
}): ObjexProfile {
  const voiceProfile = resolveObjexVoiceProfile(params);

  return {
    ...params.profile,
    hidden: {
      ...params.profile.hidden,
      voiceProfile,
    },
  };
}
