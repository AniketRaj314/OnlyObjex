function getOptionalEnv(name: string) {
  const value = process.env[name];
  return value && value.trim().length > 0 ? value : undefined;
}

export const env = {
  openAiApiKey: getOptionalEnv("OPENAI_API_KEY"),
  openAiProfileModel: getOptionalEnv("OPENAI_PROFILE_MODEL") ?? "gpt-5.4",
  openAiVisionModel: getOptionalEnv("OPENAI_VISION_MODEL") ?? "gpt-4.1",
  appUrl: getOptionalEnv("NEXT_PUBLIC_APP_URL") ?? "http://localhost:3000",
  allowMockGeneration: process.env.ALLOW_MOCK_GENERATION === "true",
};
