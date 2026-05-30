import OpenAI from "openai";
import { env } from "@/lib/env";

let client: OpenAI | undefined;

type ReasoningEffort = "none" | "low" | "medium" | "high" | "xhigh";

export function getOpenAIClient() {
  if (!env.openAiApiKey) {
    throw new Error(
      "OPENAI_API_KEY is missing. Add it to .env.local or enable ALLOW_MOCK_GENERATION=true for demo mode.",
    );
  }

  if (!client) {
    client = new OpenAI({ apiKey: env.openAiApiKey });
  }

  return client;
}

function modelSupportsReasoningEffort(model: string) {
  return model.startsWith("gpt-5");
}

export function buildReasoningOptions(
  model: string,
  effort: ReasoningEffort,
) {
  if (!modelSupportsReasoningEffort(model)) {
    return {};
  }

  return {
    reasoning: {
      effort,
    },
  };
}
