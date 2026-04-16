function getOptionalEnv(name: string) {
  const value = process.env[name];
  return value && value.trim().length > 0 ? value : undefined;
}

function getListEnv(name: string) {
  const value = getOptionalEnv(name);

  if (!value) {
    return undefined;
  }

  return value
    .split(",")
    .map((entry) => entry.trim())
    .filter((entry) => entry.length > 0);
}

function uniqueValues(...groups: Array<string[] | undefined>) {
  const seen = new Set<string>();
  const values: string[] = [];

  for (const group of groups) {
    if (!group) {
      continue;
    }

    for (const value of group) {
      if (seen.has(value)) {
        continue;
      }

      seen.add(value);
      values.push(value);
    }
  }

  return values;
}

const configuredTtsModel = getOptionalEnv("OPENAI_TTS_MODEL");
const configuredTtsVoice = getOptionalEnv("OPENAI_TTS_VOICE");

export const env = {
  openAiApiKey: getOptionalEnv("OPENAI_API_KEY"),
  openAiProfileModel: getOptionalEnv("OPENAI_PROFILE_MODEL") ?? "gpt-5.4",
  openAiVisionModel:
    getOptionalEnv("OPENAI_VISION_MODEL") ?? "gpt-4.1-mini",
  openAiTtsModels: uniqueValues(
    getListEnv("OPENAI_TTS_MODELS"),
    configuredTtsModel ? [configuredTtsModel] : undefined,
    ["gpt-4o-mini-tts", "tts-1-hd"],
  ),
  openAiTtsVoices: uniqueValues(
    getListEnv("OPENAI_TTS_VOICES"),
    configuredTtsVoice ? [configuredTtsVoice] : undefined,
    ["coral", "nova", "shimmer", "marin"],
  ),
  appUrl: getOptionalEnv("NEXT_PUBLIC_APP_URL") ?? "http://localhost:3000",
  allowMockGeneration: process.env.ALLOW_MOCK_GENERATION === "true",
};
