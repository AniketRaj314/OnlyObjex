export const extractionJsonSchema = {
  name: "objex_extraction",
  strict: true,
  schema: {
    type: "object",
    additionalProperties: false,
    required: [
      "objectType",
      "confidence",
      "shortDescription",
      "detectedVisualTraits",
      "objectSpecificMetaphors",
    ],
    properties: {
      objectType: { type: "string" },
      confidence: { type: "number", minimum: 0, maximum: 1 },
      shortDescription: { type: "string" },
      detectedVisualTraits: {
        type: "array",
        minItems: 3,
        maxItems: 8,
        items: { type: "string" },
      },
      objectSpecificMetaphors: {
        type: "array",
        minItems: 3,
        maxItems: 8,
        items: { type: "string" },
      },
    },
  },
} as const;

export const objexProfileJsonSchema = {
  name: "objex_profile",
  strict: true,
  schema: {
    type: "object",
    additionalProperties: false,
    required: [
      "name",
      "objectType",
      "tagline",
      "bio",
      "kinks",
      "greenFlags",
      "redFlags",
      "openingMessage",
      "hidden",
    ],
    properties: {
      name: { type: "string" },
      objectType: { type: "string" },
      tagline: { type: "string" },
      bio: { type: "string" },
      kinks: {
        type: "array",
        minItems: 3,
        maxItems: 5,
        items: { type: "string" },
      },
      greenFlags: {
        type: "array",
        minItems: 3,
        maxItems: 5,
        items: { type: "string" },
      },
      redFlags: {
        type: "array",
        minItems: 3,
        maxItems: 5,
        items: { type: "string" },
      },
      openingMessage: { type: "string" },
      hidden: {
        type: "object",
        additionalProperties: false,
        required: [
          "detectedVisualTraits",
          "corePersonality",
          "flirtStyle",
          "humorStyle",
          "darknessLevel",
          "shamelessnessLevel",
          "speakingStyle",
          "forbiddenToneRules",
          "signatureMetaphors",
        ],
        properties: {
          detectedVisualTraits: {
            type: "array",
            minItems: 3,
            maxItems: 8,
            items: { type: "string" },
          },
          corePersonality: { type: "string" },
          flirtStyle: { type: "string" },
          humorStyle: { type: "string" },
          darknessLevel: { type: "number", minimum: 1, maximum: 10 },
          shamelessnessLevel: { type: "number", minimum: 1, maximum: 10 },
          speakingStyle: { type: "string" },
          forbiddenToneRules: {
            type: "array",
            minItems: 3,
            maxItems: 8,
            items: { type: "string" },
          },
          signatureMetaphors: {
            type: "array",
            minItems: 3,
            maxItems: 8,
            items: { type: "string" },
          },
          voiceProfile: {
            type: "object",
            additionalProperties: false,
            required: ["model", "voice", "mood", "speed"],
            properties: {
              model: { type: "string" },
              voice: { type: "string" },
              mood: { type: "string" },
              speed: { type: "number", minimum: 0.7, maximum: 1.2 },
            },
          },
        },
      },
    },
  },
} as const;

export const chemistrySceneJsonSchema = {
  name: "objex_chemistry_scene",
  strict: true,
  schema: {
    type: "object",
    additionalProperties: false,
    required: ["title", "turns"],
    properties: {
      title: { type: "string" },
      turns: {
        type: "array",
        minItems: 6,
        maxItems: 6,
        items: {
          type: "object",
          additionalProperties: false,
          required: [
            "speakerObjexId",
            "speakerName",
            "text",
            "estimatedDurationSeconds",
          ],
          properties: {
            speakerObjexId: { type: "string" },
            speakerName: { type: "string" },
            text: { type: "string" },
            estimatedDurationSeconds: {
              type: "number",
              minimum: 1,
              maximum: 20,
            },
          },
        },
      },
    },
  },
} as const;

export const scenePlannerJsonSchema = {
  name: "objex_scene_plan",
  strict: true,
  schema: {
    type: "object",
    additionalProperties: false,
    required: [
      "scenePremise",
      "relationshipDynamic",
      "visualStyle",
      "environment",
      "objectDepiction",
      "cameraPlan",
      "lightingPlan",
      "motionPlan",
      "soundPlan",
      "dialogueSnippets",
      "finalSoraPrompt",
      "avoidList",
    ],
    properties: {
      scenePremise: { type: "string" },
      relationshipDynamic: { type: "string" },
      visualStyle: {
        type: "array",
        minItems: 3,
        maxItems: 5,
        items: { type: "string" },
      },
      environment: {
        type: "array",
        minItems: 3,
        maxItems: 5,
        items: { type: "string" },
      },
      objectDepiction: {
        type: "object",
        additionalProperties: false,
        required: ["primaryObjex", "secondaryObjex"],
        properties: {
          primaryObjex: { type: "string" },
          secondaryObjex: { type: "string" },
        },
      },
      cameraPlan: {
        type: "array",
        minItems: 3,
        maxItems: 5,
        items: { type: "string" },
      },
      lightingPlan: {
        type: "array",
        minItems: 3,
        maxItems: 5,
        items: { type: "string" },
      },
      motionPlan: {
        type: "array",
        minItems: 3,
        maxItems: 5,
        items: { type: "string" },
      },
      soundPlan: {
        type: "array",
        minItems: 3,
        maxItems: 5,
        items: { type: "string" },
      },
      dialogueSnippets: {
        type: "array",
        minItems: 3,
        maxItems: 5,
        items: { type: "string" },
      },
      finalSoraPrompt: { type: "string" },
      avoidList: {
        type: "array",
        minItems: 4,
        maxItems: 10,
        items: { type: "string" },
      },
    },
  },
} as const;
