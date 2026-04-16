import { z } from "zod";

export const objexVoiceProfileSchema = z.object({
  model: z.string().min(1).max(80),
  voice: z.string().min(1).max(80),
  mood: z.string().min(3).max(120),
  speed: z.number().min(0.7).max(1.2),
});

export const hiddenObjexFieldsSchema = z.object({
  detectedVisualTraits: z.array(z.string().min(1)).min(3).max(8),
  corePersonality: z.string().min(8).max(180),
  flirtStyle: z.string().min(8).max(120),
  humorStyle: z.string().min(8).max(120),
  darknessLevel: z.number().min(1).max(10),
  shamelessnessLevel: z.number().min(1).max(10),
  speakingStyle: z.string().min(8).max(160),
  forbiddenToneRules: z.array(z.string().min(1)).min(3).max(8),
  signatureMetaphors: z.array(z.string().min(1)).min(3).max(8),
  voiceProfile: objexVoiceProfileSchema.optional(),
});

export const objexProfileSchema = z.object({
  name: z.string().min(2).max(60),
  objectType: z.string().min(2).max(60),
  tagline: z.string().min(12).max(180),
  bio: z.string().min(60).max(500),
  kinks: z.array(z.string().min(3).max(120)).min(3).max(5),
  greenFlags: z.array(z.string().min(3).max(120)).min(3).max(5),
  redFlags: z.array(z.string().min(3).max(120)).min(3).max(5),
  openingMessage: z.string().min(12).max(220),
  hidden: hiddenObjexFieldsSchema,
});

export const extractionSchema = z.object({
  objectType: z.string().min(2).max(80),
  confidence: z.number().min(0).max(1),
  shortDescription: z.string().min(10).max(200),
  detectedVisualTraits: z.array(z.string().min(1)).min(3).max(8),
  objectSpecificMetaphors: z.array(z.string().min(1)).min(3).max(8),
});

export const storedObjexSchema = z.object({
  id: z.string().min(1),
  imagePath: z.string().min(1),
  imagePublicUrl: z.string().min(1),
  createdAt: z.string().min(1),
  isPublished: z.boolean(),
  publishedAt: z.string().nullable(),
  profile: objexProfileSchema,
});

export const objexChatMessageRoleSchema = z.enum(["user", "assistant"]);

export const objexChatMessageSchema = z.object({
  id: z.string().min(1),
  objexId: z.string().min(1),
  role: objexChatMessageRoleSchema,
  content: z.string().min(1).max(2000),
  createdAt: z.string().min(1),
  audioPublicUrl: z.string().nullable(),
});

export const objexChatRequestSchema = z.object({
  message: z.string().trim().min(1).max(600),
});

export const chemistryConversationRequestSchema = z.object({
  leftObjexId: z.string().min(1),
  rightObjexId: z.string().min(1),
});

export const chemistryParticipantSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(2).max(60),
  objectType: z.string().min(2).max(60),
  tagline: z.string().min(12).max(180),
  imagePublicUrl: z.string().min(1),
  voiceProfile: objexVoiceProfileSchema,
});

export const generatedChemistryTurnSchema = z.object({
  speakerObjexId: z.string().min(1),
  speakerName: z.string().min(2).max(60),
  text: z.string().min(12).max(240),
  estimatedDurationSeconds: z.number().min(1).max(20).optional(),
});

export const generatedChemistrySceneSchema = z.object({
  title: z.string().min(8).max(80),
  turns: z.array(generatedChemistryTurnSchema).length(6),
});

export const chemistryTurnSchema = generatedChemistryTurnSchema.extend({
  id: z.string().min(1),
  audioPublicUrl: z.string().nullable(),
});

export const chemistryConversationResponseSchema = z.object({
  title: z.string().min(8).max(80),
  participants: z.array(chemistryParticipantSchema).length(2),
  turns: z.array(chemistryTurnSchema).length(6),
});

export const createObjexResultSchema = z.object({
  id: z.string(),
});

export type ExtractionResult = z.infer<typeof extractionSchema>;
export type ChemistryConversationRequest = z.infer<
  typeof chemistryConversationRequestSchema
>;
export type ChemistryConversationResponse = z.infer<
  typeof chemistryConversationResponseSchema
>;
export type ChemistryParticipant = z.infer<typeof chemistryParticipantSchema>;
export type ChemistryTurn = z.infer<typeof chemistryTurnSchema>;
export type GeneratedChemistryScene = z.infer<
  typeof generatedChemistrySceneSchema
>;
export type GeneratedChemistryTurn = z.infer<typeof generatedChemistryTurnSchema>;
export type HiddenObjexFields = z.infer<typeof hiddenObjexFieldsSchema>;
export type ObjexChatMessage = z.infer<typeof objexChatMessageSchema>;
export type ObjexChatMessageRole = z.infer<typeof objexChatMessageRoleSchema>;
export type ObjexProfile = z.infer<typeof objexProfileSchema>;
export type ObjexVoiceProfile = z.infer<typeof objexVoiceProfileSchema>;
export type StoredObjex = z.infer<typeof storedObjexSchema>;
