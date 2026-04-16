import { randomUUID } from "node:crypto";
import { chemistrySceneJsonSchema } from "@/lib/objex-json-schema";
import { env } from "@/lib/env";
import { getOpenAIClient } from "@/lib/openai";
import type {
  ChemistryConversationResponse,
  ChemistryParticipant,
  ChemistryTurn,
  GeneratedChemistryScene,
  ObjexProfile,
  StoredObjex,
} from "@/lib/schemas/objex";
import {
  chemistryConversationResponseSchema,
  generatedChemistrySceneSchema,
} from "@/lib/schemas/objex";
import { resolveObjexVoiceProfile } from "@/lib/voice-profile";

function getTextResponse(response: { output_text?: string | null }) {
  const output = response.output_text?.trim();

  if (!output) {
    throw new Error("The model returned an empty chemistry scene.");
  }

  return output;
}

function estimateDurationSeconds(text: string, speed = 0.82) {
  const words = text.trim().split(/\s+/).filter(Boolean).length;
  const wordsPerMinute = 145 * speed;

  return Math.max(4, Math.min(14, Math.round((words / wordsPerMinute) * 60)));
}

function buildParticipant(objex: StoredObjex): ChemistryParticipant {
  return {
    id: objex.id,
    name: objex.profile.name,
    objectType: objex.profile.objectType,
    tagline: objex.profile.tagline,
    imagePublicUrl: objex.imagePublicUrl,
    voiceProfile: resolveObjexVoiceProfile({
      objexId: objex.id,
      profile: objex.profile,
    }),
  };
}

function createMockScene(params: {
  left: StoredObjex;
  right: StoredObjex;
}): GeneratedChemistryScene {
  const left = params.left.profile;
  const right = params.right.profile;

  return generatedChemistrySceneSchema.parse({
    title: `${left.name} x ${right.name}`,
    turns: [
      {
        speakerObjexId: params.left.id,
        speakerName: left.name,
        text: `You look like the kind of ${right.objectType.toLowerCase()} that enjoys a little tension. I respect that in something so obviously built to tempt bad decisions.`,
      },
      {
        speakerObjexId: params.right.id,
        speakerName: right.name,
        text: `Careful, ${left.name}. I hear you like being handled with purpose, and I do have a talent for turning useful things into loaded situations.`,
      },
      {
        speakerObjexId: params.left.id,
        speakerName: left.name,
        text: `Purpose is lovely. So is pressure. If you keep talking like that, I may start assuming we're both here to make the room noticeably warmer.`,
      },
      {
        speakerObjexId: params.right.id,
        speakerName: right.name,
        text: `Warmer works for me. I flirt best when the atmosphere gets a little reckless and the practical details start sounding strangely intimate.`,
      },
      {
        speakerObjexId: params.left.id,
        speakerName: left.name,
        text: `That explains the look. You have the energy of something that spots my kinks, smiles politely, and then rearranges them until they blush.`,
      },
      {
        speakerObjexId: params.right.id,
        speakerName: right.name,
        text: `Only if you keep that tone. You're all sharp edges and invitation, and I would hate to waste chemistry this promising on respectable conversation.`,
      },
    ],
  });
}

function validateSpeakerOrder(params: {
  scene: GeneratedChemistryScene;
  leftId: string;
  rightId: string;
}) {
  const expectedOrder = [
    params.leftId,
    params.rightId,
    params.leftId,
    params.rightId,
    params.leftId,
    params.rightId,
  ];

  params.scene.turns.forEach((turn, index) => {
    if (turn.speakerObjexId !== expectedOrder[index]) {
      throw new Error(
        "Chemistry scene came back with the wrong speaker order. Try again.",
      );
    }
  });
}

export async function generateObjexChemistryScene(params: {
  left: StoredObjex;
  right: StoredObjex;
}) {
  if (!env.openAiApiKey && env.allowMockGeneration) {
    return createMockScene(params);
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
              "You write flirty first-meeting conversations between two parody dating-profile objects from OnlyObjex.",
              "Funny first, seductive second, demo-safe always.",
              "Use innuendo, object-specific metaphor, and chemistry built from both objects' physical uses and kinks.",
              "No explicit sexual content, porn language, anatomy, or crude phrasing.",
              "Exactly 6 turns total, alternating speakers every line, 3 lines each.",
              "Each line should be concise spoken dialogue, usually 12 to 22 words, hard max 28 words.",
              "They should sound immediately interested in each other and play directly into each other's kinks and metaphors.",
              "No narration, no scene-setting prose, no markdown.",
              "Return strict JSON only.",
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
              task: "Generate a first-time flirty six-turn conversation.",
              requirements: {
                startsWith: params.left.id,
                alternation: [
                  params.left.id,
                  params.right.id,
                  params.left.id,
                  params.right.id,
                  params.left.id,
                  params.right.id,
                ],
                targetDuration: "about one minute total in TTS",
                tone: [
                  "witty",
                  "shameless",
                  "object-specific",
                  "clean-language but dirty-minded",
                ],
              },
              participants: [
                {
                  id: params.left.id,
                  name: params.left.profile.name,
                  objectType: params.left.profile.objectType,
                  tagline: params.left.profile.tagline,
                  bio: params.left.profile.bio,
                  kinks: params.left.profile.kinks,
                  greenFlags: params.left.profile.greenFlags,
                  redFlags: params.left.profile.redFlags,
                  openingMessage: params.left.profile.openingMessage,
                  hidden: {
                    corePersonality: params.left.profile.hidden.corePersonality,
                    flirtStyle: params.left.profile.hidden.flirtStyle,
                    humorStyle: params.left.profile.hidden.humorStyle,
                    speakingStyle: params.left.profile.hidden.speakingStyle,
                    signatureMetaphors:
                      params.left.profile.hidden.signatureMetaphors,
                  },
                },
                {
                  id: params.right.id,
                  name: params.right.profile.name,
                  objectType: params.right.profile.objectType,
                  tagline: params.right.profile.tagline,
                  bio: params.right.profile.bio,
                  kinks: params.right.profile.kinks,
                  greenFlags: params.right.profile.greenFlags,
                  redFlags: params.right.profile.redFlags,
                  openingMessage: params.right.profile.openingMessage,
                  hidden: {
                    corePersonality: params.right.profile.hidden.corePersonality,
                    flirtStyle: params.right.profile.hidden.flirtStyle,
                    humorStyle: params.right.profile.hidden.humorStyle,
                    speakingStyle: params.right.profile.hidden.speakingStyle,
                    signatureMetaphors:
                      params.right.profile.hidden.signatureMetaphors,
                  },
                },
              ],
            }),
          },
        ],
      },
    ],
    text: {
      format: {
        type: "json_schema",
        ...chemistrySceneJsonSchema,
      },
    },
  });

  const scene = generatedChemistrySceneSchema.parse(
    JSON.parse(getTextResponse(response)),
  );
  validateSpeakerOrder({
    scene,
    leftId: params.left.id,
    rightId: params.right.id,
  });

  return scene;
}

export function attachChemistryTurnAudio(params: {
  response: Omit<ChemistryConversationResponse, "turns"> & {
    turns: Array<Omit<ChemistryTurn, "audioPublicUrl">>;
  };
  audioByTurnId: Map<string, string | null>;
}) {
  return chemistryConversationResponseSchema.parse({
    ...params.response,
    turns: params.response.turns.map((turn) => ({
      ...turn,
      audioPublicUrl: params.audioByTurnId.get(turn.id) ?? null,
    })),
  });
}

export function buildChemistryConversationDraft(params: {
  left: StoredObjex;
  right: StoredObjex;
  scene: GeneratedChemistryScene;
}) {
  const participants = [
    buildParticipant(params.left),
    buildParticipant(params.right),
  ];
  const participantMap = new Map(participants.map((item) => [item.id, item]));

  return {
    title:
      params.scene.title ??
      `${params.left.profile.name} meets ${params.right.profile.name}`,
    participants,
    turns: params.scene.turns.map((turn) => {
      const participant = participantMap.get(turn.speakerObjexId);

      if (!participant) {
        throw new Error("Conversation scene referenced an unknown participant.");
      }

      const id = randomUUID();

      return {
        id,
        speakerObjexId: turn.speakerObjexId,
        speakerName: participant.name,
        text: turn.text,
        estimatedDurationSeconds:
          turn.estimatedDurationSeconds ??
          estimateDurationSeconds(turn.text, participant.voiceProfile.speed),
      };
    }),
  };
}

export function getObjexProfileForParticipant(
  objexId: string,
  participants: [StoredObjex, StoredObjex],
): ObjexProfile {
  const match = participants.find((participant) => participant.id === objexId);

  if (!match) {
    throw new Error("Missing Objex profile for chemistry speaker.");
  }

  return match.profile;
}
