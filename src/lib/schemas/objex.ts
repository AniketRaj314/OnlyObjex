import { z } from "zod";

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
  profile: objexProfileSchema,
});

export const createObjexResultSchema = z.object({
  id: z.string(),
});

export type ExtractionResult = z.infer<typeof extractionSchema>;
export type HiddenObjexFields = z.infer<typeof hiddenObjexFieldsSchema>;
export type ObjexProfile = z.infer<typeof objexProfileSchema>;
export type StoredObjex = z.infer<typeof storedObjexSchema>;
