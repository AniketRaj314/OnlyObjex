import type { ObjexChatMessage, ObjexProfile } from "@/lib/schemas/objex";
import { env } from "@/lib/env";
import { getOpenAIClient } from "@/lib/openai";

function getTextResponse(response: { output_text?: string | null }) {
  const output = response.output_text?.trim();

  if (!output) {
    throw new Error("The model returned an empty chat reply.");
  }

  return output;
}

function buildConversationSummary(history: ObjexChatMessage[]) {
  return history.slice(-8).map((message) => ({
    role: message.role,
    content: message.content,
  }));
}

export function createMockChatReply(profile: ObjexProfile, userMessage: string) {
  return [
    `${profile.name} here. "${userMessage}" is exactly the kind of line that gets my finish scuffed in the best possible way.`,
    `I am still a ${profile.objectType.toLowerCase()}, so keep your expectations practical and your attention disgracefully focused. Stay specific with me and I will absolutely make it worse.`,
  ].join(" ");
}

export async function generateObjexChatReply(params: {
  profile: ObjexProfile;
  history: ObjexChatMessage[];
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
              "Keep replies tight: 2 to 4 sentences, under 120 words, no markdown, no lists.",
              "Use object-specific metaphors, confident teasing, and sharp observational humor.",
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

export async function synthesizeObjexSpeech(params: {
  profile: ObjexProfile;
  text: string;
}) {
  if (!env.openAiApiKey) {
    return null;
  }

  const client = getOpenAIClient();
  const response = await client.audio.speech.create({
    model: env.openAiTtsModel,
    voice: env.openAiTtsVoice,
    response_format: "mp3",
    input: params.text,
    instructions: [
      `Perform as ${params.profile.name}, a witty and teasing ${params.profile.objectType.toLowerCase()}.`,
      `Speaking style: ${params.profile.hidden.speakingStyle}.`,
      `Humor style: ${params.profile.hidden.humorStyle}.`,
      "Keep the read natural, warm, self-aware, and lightly dramatic rather than cartoonish.",
    ].join(" "),
  });

  return Buffer.from(await response.arrayBuffer());
}
