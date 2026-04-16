import { randomUUID } from "node:crypto";
import { fileToBase64 } from "@/lib/utils";
import { env } from "@/lib/env";
import { extractionJsonSchema, objexProfileJsonSchema } from "@/lib/objex-json-schema";
import { createMockExtraction, createMockProfile } from "@/lib/mock-generation";
import { getOpenAIClient } from "@/lib/openai";
import {
  extractionSchema,
  objexProfileSchema,
  type ExtractionResult,
  type ObjexProfile,
} from "@/lib/schemas/objex";

const objexVoiceRules = [
  "Funny first, seductive second.",
  "Keep it suggestive but demo-safe.",
  "Object-specific puns and double meanings are mandatory.",
  "No explicit sexual acts, anatomy, porn language, or crude phrasing.",
  "Avoid wholesome Pixar-with-anxiety energy and avoid generic chatbot compliments.",
  "The object should sound clever, campy, bold, and knowingly seductive.",
  "The humor should feel adult, shameless, and precise without becoming NSFW.",
].join(" ");

function getTextResponse(response: { output_text?: string | null }) {
  const output = response.output_text?.trim();

  if (!output) {
    throw new Error("The model returned an empty response.");
  }

  return output;
}

async function extractObjectFromImage(
  bytes: Buffer,
  mimeType: string,
): Promise<ExtractionResult> {
  if (!env.openAiApiKey && env.allowMockGeneration) {
    return createMockExtraction();
  }

  const client = getOpenAIClient();
  const response = await client.responses.create({
    model: env.openAiVisionModel,
    input: [
      {
        role: "system",
        content: [
          {
            type: "input_text",
            text: [
              "You identify the single main everyday object in a user-uploaded photo.",
              "Return structured JSON only.",
              "Be visually grounded and avoid imaginative storytelling.",
            ].join(" "),
          },
        ],
      },
      {
        role: "user",
        content: [
          {
            type: "input_text",
            text: "Describe the main object, its visual traits, and useful metaphor hooks for later comedic profile writing.",
          },
          {
            type: "input_image",
            image_url: fileToBase64(bytes, mimeType),
            detail: "auto",
          },
        ],
      },
    ],
    text: {
      format: {
        type: "json_schema",
        ...extractionJsonSchema,
      },
    },
  });

  return extractionSchema.parse(JSON.parse(getTextResponse(response)));
}

async function generateObjexProfile(
  extraction: ExtractionResult,
): Promise<ObjexProfile> {
  const client = getOpenAIClient();

  for (let attempt = 0; attempt < 2; attempt += 1) {
    const repairInstruction =
      attempt === 0
        ? ""
        : "Repair the prior draft by obeying the schema exactly, tightening the jokes, and making each field more object-specific.";

    const response = await client.responses.create({
      model: env.openAiProfileModel,
      input: [
        {
          role: "system",
          content: [
            {
              type: "input_text",
              text: [
                "You write irresistible parody creator profiles for everyday objects.",
                objexVoiceRules,
                "Return strict JSON only and never wrap it in markdown.",
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
                task: "Create an Objex profile from the extracted object data.",
                instructions: [
                  "Make the name sexy-sounding, playful, and brandable without becoming crude.",
                  "Use the object's physical function, shape, and social use for the innuendo.",
                  "The opening message should sound like the object is speaking directly to the user.",
                  "Bio should be 2-4 sentences with object-specific metaphors and controlled shamelessness.",
                  "List items should feel quotable, not bland.",
                  repairInstruction,
                ],
                extraction,
              }),
            },
          ],
        },
      ],
      text: {
        format: {
          type: "json_schema",
          ...objexProfileJsonSchema,
        },
      },
    });

    try {
      return objexProfileSchema.parse(JSON.parse(getTextResponse(response)));
    } catch (error) {
      if (attempt === 1) {
        throw error;
      }
    }
  }

  throw new Error("Profile generation failed after retries.");
}

export async function buildObjexProfile(params: {
  bytes: Buffer;
  mimeType: string;
  fileName: string;
}) {
  const extraction = await extractObjectFromImage(params.bytes, params.mimeType);

  const profile =
    !env.openAiApiKey && env.allowMockGeneration
      ? createMockProfile(extraction, params.fileName)
      : await generateObjexProfile(extraction);

  return {
    id: randomUUID(),
    extraction,
    profile,
  };
}
