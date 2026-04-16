import { env } from "@/lib/env";
import { getOpenAIClient } from "@/lib/openai";
import { scenePlannerJsonSchema } from "@/lib/objex-json-schema";
import { ZodError } from "zod";
import type {
  GeneratedScenePlan,
  ScenePlannerResponse,
  StoredObjex,
} from "@/lib/schemas/objex";
import { scenePlannerResponseSchema, generatedScenePlanSchema } from "@/lib/schemas/objex";
import { resolveObjexVoiceProfile } from "@/lib/voice-profile";

export const sceneScenarioPresets = [
  "Couples Therapy",
  "First Date",
  "Messy Breakup",
  "After-Hours Office",
  "Group Therapy",
  "Forbidden Workplace Romance",
  "Passive-Aggressive Reunion",
  "Toxic Domestic Bliss",
] as const;

export const sceneMoodModifiers = [
  "darker",
  "funnier",
  "more chaotic",
  "more luxurious",
] as const;

function getTextResponse(response: { output_text?: string | null }) {
  const output = response.output_text?.trim();

  if (!output) {
    throw new Error("The model returned an empty scene plan.");
  }

  return output;
}

function formatSchemaIssues(error: ZodError) {
  return error.issues
    .map((issue) => {
      const path = issue.path.length > 0 ? issue.path.join(".") : "root";
      return `${path}: ${issue.message}`;
    })
    .join(" | ");
}

function buildParticipant(objex: StoredObjex) {
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

function createMockScenePlan(params: {
  primary: StoredObjex;
  secondary: StoredObjex | null;
  scenarioPreset: string;
  customScenarioNote: string;
  moodModifier: string;
}): GeneratedScenePlan {
  const secondaryName = params.secondary?.profile.name ?? "nobody else";
  const secondaryType =
    params.secondary?.profile.objectType.toLowerCase() ?? "the empty room";
  const secondaryDepiction = params.secondary
    ? `${params.secondary.profile.name} stays unmistakably a ${params.secondary.profile.objectType.toLowerCase()}, posed with sly angles, reflective surfaces, and loaded proximity that makes it feel emotionally implicated without turning humanoid.`
    : "No secondary Objex appears in frame; the scene treats the room, reflections, and negative space like an almost-lover answering back.";

  return generatedScenePlanSchema.parse({
    scenePremise: `${params.primary.profile.name} enters a ${params.scenarioPreset.toLowerCase()} scenario with ${secondaryName}, and every practical object detail starts reading like foreplay for a terrible decision.`,
    relationshipDynamic: params.secondary
      ? `${params.primary.profile.name} acts like the composed one until ${params.secondary.profile.name} pushes exactly the wrong buttons; the chemistry is petty, precise, shameless, and weirdly elegant.`
      : `${params.primary.profile.name} carries the whole scene as a solo menace, flirting with the setting itself like the room has been waiting all week to be implicated.`,
    visualStyle: [
      "luxury teaser-trailer framing with absurdly serious emotional stakes",
      "clean consumer-gloss surfaces under suspiciously intimate composition",
      "campy erotic-thriller energy without explicit imagery",
    ],
    environment: [
      `Set the action inside a stylized ${params.scenarioPreset.toLowerCase()} environment with premium production design and tactile materials.`,
      "Keep the space upscale, legible, and packed with object-scale visual tension rather than human drama.",
      params.customScenarioNote || "Use reflective surfaces, loaded spacing, and practical props to make every frame feel like it knows what it is implying.",
    ],
    objectDepiction: {
      primaryObjex: `${params.primary.profile.name} remains clearly a ${params.primary.profile.objectType.toLowerCase()}, lit and staged so its shape, finish, and functional details become seductive visual language without turning it into a humanoid character.`,
      secondaryObjex: secondaryDepiction,
    },
    cameraPlan: [
      "Open with a slow, appraising push-in that treats the objects like scandalous prestige-drama leads.",
      "Use close inserts on hinges, edges, textures, reflections, switches, seams, or surfaces that echo the profiles' kinks and metaphors.",
      "Let the coverage escalate from composed wides to charged near-macro details as the scene gets flirtier.",
    ],
    lightingPlan: [
      "Use sculpted practical lighting with luminous highlights and soft-shadow tension.",
      `Bias the palette toward polished whites, cool cyan accents, and a ${params.moodModifier || "balanced"} undertone.`,
      "Keep the mood glossy, expensive, and a little dangerous, never cartoonish.",
    ],
    motionPlan: [
      "Favor deliberate micro-movements, subtle repositioning, and suspenseful pauses over slapstick animation.",
      params.secondary
        ? `Stage the motion so ${params.primary.profile.name} and ${params.secondary.profile.name} keep drifting into each other's space like they absolutely mean to.`
        : "Stage the motion so the primary Objex keeps finding ways to dominate the frame and flirt with the space around it.",
      `Let the blocking express tension, pressure, proximity, and restraint without losing recognizability as real objects.`,
    ],
    soundPlan: [
      "Layer room tone, soft mechanical detail, texture-rich contact sounds, and understated teaser-trailer hum.",
      `Use sound cues that make the ${params.primary.profile.objectType.toLowerCase()} and ${secondaryType} feel present, tactile, and dangerously self-aware.`,
      "Keep the mix public-safe, stylish, and suggestive rather than explicit.",
    ],
    dialogueSnippets: [
      `"You walked in looking practical. That was your first lie."`,
      params.secondary
        ? `"Careful. I know what your kinks sound like when they hit production lighting."`
        : `"Nobody else is here, and somehow the room is still blushing."`,
      `"Let's keep this tasteful. Right up until the camera gets closer."`,
    ],
    finalSoraPrompt: `Create a polished cinematic teaser scene for OnlyObjex. The main character is ${params.primary.profile.name}, a clearly recognizable ${params.primary.profile.objectType.toLowerCase()} with a witty, shameless, innuendo-heavy personality. ${params.secondary ? `The secondary character is ${params.secondary.profile.name}, a clearly recognizable ${params.secondary.profile.objectType.toLowerCase()}, and their dynamic is loaded, flirtatious, petty, and precise.` : "There is no secondary object character; instead, the setting and negative space answer back like a co-star."} Scenario: ${params.scenarioPreset}. Mood modifier: ${params.moodModifier || "none"}. Visual style: premium teaser-trailer polish, glossy white-and-cyan luxury interface energy, tactile materials, sculpted lighting, reflective surfaces, and absurdly serious framing. Keep both objects fully recognizable as real objects, never full humanoids, never cartoon-limbed, never explicit. Emphasize object-specific metaphors through staging, camera push-ins, inserts on surfaces and mechanisms, controlled movement, charged proximity, and stylish sound design. Include 2-3 short dialogue snippets as on-set spoken lines or implied trailer moments. The scene should feel sexy, shameless, witty, slightly dark, pun-heavy, and demo-safe in public. Avoid explicit sexual acts, anatomy, pornographic language, copyrighted characters, branded IP, and human faces as the main characters.`,
    avoidList: [
      "no explicit sexual acts or explicit anatomy",
      "no pornographic or crude language",
      "no full humanoid transformation or cartoon limbs",
      "no branded products, copyrighted characters, or known IP",
      "no human faces as the main characters",
      "no vague filler like 'make it cinematic' without specifics",
    ],
  });
}

export async function generateScenePlan(params: {
  primary: StoredObjex;
  secondary: StoredObjex | null;
  scenarioPreset: string;
  customScenarioNote: string;
  moodModifier: string;
}): Promise<ScenePlannerResponse> {
  const participants = [
    buildParticipant(params.primary),
    ...(params.secondary ? [buildParticipant(params.secondary)] : []),
  ];

  if (!env.openAiApiKey && env.allowMockGeneration) {
    return scenePlannerResponseSchema.parse({
      participants,
      scenarioPreset: params.scenarioPreset,
      customScenarioNote: params.customScenarioNote,
      moodModifier: params.moodModifier,
      plan: createMockScenePlan(params),
    });
  }

  const client = getOpenAIClient();
  for (let attempt = 0; attempt < 2; attempt += 1) {
    const repairInstruction =
      attempt === 0
        ? ""
        : "Repair the prior draft. Keep the same idea, but compress every field to fit the schema budgets exactly and keep the final prompt optimized for a 30-second teaser.";

    const response = await client.responses.create({
      model: env.openAiSceneModel,
      input: [
        {
          role: "system",
          content: [
            {
              type: "input_text",
              text: [
                "You are the cinematic scene planner for OnlyObjex.",
                "OnlyObjex tone is sexy, shameless, witty, pun-heavy, innuendo-heavy, slightly dark, funny first, seductive second.",
                "Never explicit, never pornographic, never crude for the sake of crudeness.",
                "Objects must sound and feel like they know exactly what they are implying.",
                "Translate object personality into visual storytelling through staging, camera movement, object orientation, reflections, pacing, lighting, and sound.",
                "Keep objects visually recognizable as real objects at all times.",
                "Do not turn them into full humanoid characters, do not add cartoon limbs, and do not make human faces the main characters.",
                "Avoid generic chatbot filler and avoid wholesome cute Pixar energy.",
                "The result should feel like a premium teaser trailer treatment: absurdly serious, visually rich, polished, and demo-safe in public.",
                "Target a 30-second teaser video, not a longer short film.",
                "Return strict JSON only.",
                "The finalSoraPrompt must be render-ready, visually specific, concise enough for a fast 30-second result, and safe to send later to a video generation system.",
                "The avoidList must call out what to avoid in the render.",
                "No copyrighted characters, branded IP, explicit sexual acts, explicit anatomy, or pornographic language.",
                "Hard field budgets: scenePremise <= 300 chars; relationshipDynamic <= 260 chars; each visual/environment/camera/lighting/motion/sound/dialogue item <= 180 chars unless the schema says less; finalSoraPrompt <= 2400 chars.",
                "Prefer 3-4 bullets per list instead of 5 unless truly necessary.",
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
                task: "Generate a cinematic scene treatment and a final Sora-ready prompt.",
                productIntent:
                  "A premium teaser trailer generator for flirtatious object drama.",
                scenario: {
                  preset: params.scenarioPreset,
                  customNote:
                    params.customScenarioNote || "No extra custom scenario note.",
                  moodModifier: params.moodModifier || "No extra mood modifier.",
                  targetRuntime: "around 30 seconds",
                },
                participants: [
                  {
                    id: params.primary.id,
                    name: params.primary.profile.name,
                    objectType: params.primary.profile.objectType,
                    tagline: params.primary.profile.tagline,
                    bio: params.primary.profile.bio,
                    kinks: params.primary.profile.kinks,
                    greenFlags: params.primary.profile.greenFlags,
                    redFlags: params.primary.profile.redFlags,
                    openingMessage: params.primary.profile.openingMessage,
                    hidden: {
                      corePersonality:
                        params.primary.profile.hidden.corePersonality,
                      flirtStyle: params.primary.profile.hidden.flirtStyle,
                      humorStyle: params.primary.profile.hidden.humorStyle,
                      speakingStyle:
                        params.primary.profile.hidden.speakingStyle,
                      signatureMetaphors:
                        params.primary.profile.hidden.signatureMetaphors,
                      darknessLevel:
                        params.primary.profile.hidden.darknessLevel,
                      shamelessnessLevel:
                        params.primary.profile.hidden.shamelessnessLevel,
                    },
                  },
                  ...(params.secondary
                    ? [
                        {
                          id: params.secondary.id,
                          name: params.secondary.profile.name,
                          objectType: params.secondary.profile.objectType,
                          tagline: params.secondary.profile.tagline,
                          bio: params.secondary.profile.bio,
                          kinks: params.secondary.profile.kinks,
                          greenFlags: params.secondary.profile.greenFlags,
                          redFlags: params.secondary.profile.redFlags,
                          openingMessage:
                            params.secondary.profile.openingMessage,
                          hidden: {
                            corePersonality:
                              params.secondary.profile.hidden.corePersonality,
                            flirtStyle:
                              params.secondary.profile.hidden.flirtStyle,
                            humorStyle:
                              params.secondary.profile.hidden.humorStyle,
                            speakingStyle:
                              params.secondary.profile.hidden.speakingStyle,
                            signatureMetaphors:
                              params.secondary.profile.hidden
                                .signatureMetaphors,
                            darknessLevel:
                              params.secondary.profile.hidden.darknessLevel,
                            shamelessnessLevel:
                              params.secondary.profile.hidden
                                .shamelessnessLevel,
                          },
                        },
                      ]
                    : []),
                ],
                outputRules: [
                  "Be specific about environment, framing, motion, lighting, and sound.",
                  "Use object-specific metaphors and visual logic tied to how the objects are used.",
                  "Keep the scene premium, readable, and useful for video generation.",
                  "For a solo scene, make the setting and negative space carry the tension rather than inventing a fake second lead.",
                  "The Sora prompt should stand alone and include tone, setting, visual language, safety constraints, and object depiction guidance.",
                  "Keep everything compressed for a 30-second teaser with fast render intent.",
                  repairInstruction,
                ].filter(Boolean),
              }),
            },
          ],
        },
      ],
      text: {
        format: {
          type: "json_schema",
          ...scenePlannerJsonSchema,
        },
      },
    });

    try {
      const plan = generatedScenePlanSchema.parse(
        JSON.parse(getTextResponse(response)),
      );

      return scenePlannerResponseSchema.parse({
        participants,
        scenarioPreset: params.scenarioPreset,
        customScenarioNote: params.customScenarioNote,
        moodModifier: params.moodModifier,
        plan,
      });
    } catch (error) {
      if (!(error instanceof ZodError) || attempt === 1) {
        throw error;
      }

      const issues = formatSchemaIssues(error);
      params.customScenarioNote = [
        params.customScenarioNote,
        `Schema repair note: ${issues}`,
      ]
        .filter(Boolean)
        .join(" | ");
    }
  }

  throw new Error("Scene planning failed after retries.");
}
