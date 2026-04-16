import type { ObjexChatMessage, ObjexProfile } from "@/lib/schemas/objex";
import { env } from "@/lib/env";
import { getOpenAIClient } from "@/lib/openai";
import { resolveObjexVoiceProfile } from "@/lib/voice-profile";

function getTextResponse(response: { output_text?: string | null }) {
  const output = response.output_text?.trim();

  if (!output) {
    throw new Error("The model returned an empty chat reply.");
  }

  return output;
}

function buildConversationSummary(history: ObjexChatMessage[]) {
  return history.slice(-12).map((message) => ({
    role: message.role,
    content: message.content,
  }));
}

function buildHeuristicMemory(history: ObjexChatMessage[]) {
  const recentMessages = history.slice(-6);

  if (recentMessages.length === 0) {
    return null;
  }

  return recentMessages
    .map((message) =>
      `${message.role === "assistant" ? "Objex" : "User"}: ${message.content}`,
    )
    .join(" | ")
    .slice(0, 320);
}

export function createMockChatReply(profile: ObjexProfile, userMessage: string) {
  return `${profile.name} here. "${userMessage}" is a strong start, but try being even more specific and I'll make this much worse in record time.`;
}

export async function generateObjexChatReply(params: {
  profile: ObjexProfile;
  history: ObjexChatMessage[];
  memorySummary: string | null;
  userMessage: string;
}) {
  if (!env.openAiApiKey && env.allowMockGeneration) {
    return createMockChatReply(params.profile, params.userMessage);
  }

  const client = getOpenAIClient();
  const response = await client.responses.create({
    model: env.openAiProfileModel,
    input: [
      {
        role: "system",
        content: [
          {
            type: "input_text",
            text: [
              "You are roleplaying as a parody dating-profile object from OnlyObjex.",
              "Stay in character as the object at all times.",
              "Funny first, flirty second, demo-safe always.",
              "Be suggestive without explicit sexual content, porn language, anatomy, or crude phrasing.",
              "Keep replies very short: 1 or 2 sentences, ideally 18 to 40 words, hard max 55 words.",
              "Use object-specific metaphors, confident teasing, and sharp observational humor.",
              "The reply must directly continue the ongoing conversation rather than sounding like a fresh intro.",
              "If the user mentioned a preference, plan, name, or running bit earlier, keep continuity with it.",
              "No markdown, no lists, no stage directions.",
            ].join(" "),
          },
        ],
      },
      {
        role: "user",
        content: [
          {
            type: "input_text",
            text: JSON.stringify({
              task: "Reply to the user in character.",
              objectProfile: {
                name: params.profile.name,
                objectType: params.profile.objectType,
                tagline: params.profile.tagline,
                bio: params.profile.bio,
                openingMessage: params.profile.openingMessage,
                hidden: {
                  corePersonality: params.profile.hidden.corePersonality,
                  flirtStyle: params.profile.hidden.flirtStyle,
                  humorStyle: params.profile.hidden.humorStyle,
                  speakingStyle: params.profile.hidden.speakingStyle,
                  signatureMetaphors: params.profile.hidden.signatureMetaphors,
                  forbiddenToneRules: params.profile.hidden.forbiddenToneRules,
                },
              },
              conversationMemory:
                params.memorySummary ??
                "No durable memory yet beyond the recent turns.",
              recentConversation: buildConversationSummary(params.history),
              latestUserMessage: params.userMessage,
            }),
          },
        ],
      },
    ],
  });

  return getTextResponse(response);
}

export async function summarizeObjexChatMemory(params: {
  profile: ObjexProfile;
  previousSummary: string | null;
  history: ObjexChatMessage[];
}) {
  if (!env.openAiApiKey && env.allowMockGeneration) {
    return buildHeuristicMemory(params.history);
  }

  const client = getOpenAIClient();
  const response = await client.responses.create({
    model: env.openAiProfileModel,
    input: [
      {
        role: "system",
        content: [
          {
            type: "input_text",
            text: [
              "Summarize conversation memory for an in-character object chat.",
              "Keep only durable context: recurring topic, user preferences, names, promises, and running jokes.",
              "Return one compact plain-text summary under 90 words.",
            ].join(" "),
          },
        ],
      },
      {
        role: "user",
        content: [
          {
            type: "input_text",
            text: JSON.stringify({
              objectProfile: {
                name: params.profile.name,
                objectType: params.profile.objectType,
              },
              previousSummary: params.previousSummary,
              recentConversation: buildConversationSummary(params.history),
            }),
          },
        ],
      },
    ],
  });

  return getTextResponse(response);
}

export async function synthesizeObjexSpeech(params: {
  objexId: string;
  profile: ObjexProfile;
  text: string;
}) {
  if (!env.openAiApiKey) {
    return null;
  }

  const voiceProfile = resolveObjexVoiceProfile({
    objexId: params.objexId,
    profile: params.profile,
  });
  const client = getOpenAIClient();
  const response = await client.audio.speech.create({
    model: voiceProfile.model,
    voice: voiceProfile.voice,
    response_format: "mp3",
    speed: voiceProfile.speed,
    input: params.text,
    instructions: voiceProfile.model.startsWith("tts-1")
      ? undefined
      : [
          `Perform as ${params.profile.name}, a witty and teasing ${params.profile.objectType.toLowerCase()}.`,
          `Speaking style: ${params.profile.hidden.speakingStyle}.`,
          `Humor style: ${params.profile.hidden.humorStyle}.`,
          `Voice mood: ${voiceProfile.mood}.`,
          "Keep the read slower, feminine, self-aware, and lightly dramatic rather than cartoonish.",
          "Aim for confident, flirtatious warmth with a sexy edge, but stay tasteful and natural.",
        ].join(" "),
  });

  return Buffer.from(await response.arrayBuffer());
}
