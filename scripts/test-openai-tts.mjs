import fs from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import { spawn } from "node:child_process";
import OpenAI from "openai";

const ROOT = process.cwd();
const OUTPUT_DIR = path.join(ROOT, "outputs");
const PERSONA_PATH = path.join(ROOT, "tts", "personas.json");
const ENV_PATH = path.join(ROOT, ".env");
const DEFAULT_TEXT =
  "Come a little closer. I only need a second to make this moment sound unforgettable.";

function parseArgs(argv) {
  const args = {};

  for (let i = 0; i < argv.length; i += 1) {
    const token = argv[i];

    if (!token.startsWith("--")) {
      continue;
    }

    const key = token.slice(2);
    const next = argv[i + 1];

    if (!next || next.startsWith("--")) {
      args[key] = true;
      continue;
    }

    args[key] = next;
    i += 1;
  }

  return args;
}

function slugify(value) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

async function loadDotEnv() {
  try {
    const raw = await fs.readFile(ENV_PATH, "utf8");

    for (const line of raw.split(/\r?\n/)) {
      const trimmed = line.trim();

      if (!trimmed || trimmed.startsWith("#")) {
        continue;
      }

      const separatorIndex = trimmed.indexOf("=");

      if (separatorIndex === -1) {
        continue;
      }

      const key = trimmed.slice(0, separatorIndex).trim();
      let value = trimmed.slice(separatorIndex + 1).trim();

      if (
        (value.startsWith('"') && value.endsWith('"')) ||
        (value.startsWith("'") && value.endsWith("'"))
      ) {
        value = value.slice(1, -1);
      }

      if (!(key in process.env)) {
        process.env[key] = value;
      }
    }
  } catch (error) {
    if (error.code !== "ENOENT") {
      throw error;
    }
  }
}

function buildInstructions({ persona, stylePreset, pacing }) {
  const personaLayer = [
    `You are voicing ${persona.name}, a flirtatious ${persona.objectType} persona.`,
    `Tagline: ${persona.tagline}.`,
    `Bio: ${persona.bio}.`,
    `Flirt style: ${persona.flirtStyle}.`,
    `Humor style: ${persona.humorStyle}.`,
  ].join(" ");

  const presetMap = {
    sultry:
      "Deliver the line like a premium audio ad: warm, intimate, velvet-smooth, self-assured, slightly breathy, and unhurried.",
    luxe:
      "Sound polished, expensive, cinematic, and confident, with crisp diction and a soft smile behind the words.",
    playful:
      "Sound teasing, magnetic, and witty, with a light wink in the performance and more bounce in the phrasing.",
  };

  const pacingMap = {
    slow: "Use a slower pace with deliberate pauses around the most evocative phrases.",
    medium: "Keep a controlled conversational pace with a few tasteful pauses.",
    fast: "Keep the energy up, but stay smooth and controlled rather than rushed.",
  };

  return [
    presetMap[stylePreset] ?? presetMap.sultry,
    pacingMap[pacing] ?? pacingMap.medium,
    personaLayer,
    "Keep it seductive in tone but not explicit.",
    "Prioritize clarity, texture, and confidence over cartoonish dramatics.",
  ].join(" ");
}

async function loadPersonas() {
  const raw = await fs.readFile(PERSONA_PATH, "utf8");
  return JSON.parse(raw);
}

async function main() {
  await loadDotEnv();

  const args = parseArgs(process.argv.slice(2));
  const personas = await loadPersonas();

  const personaSlug = args.persona ?? "flash-me-outside";
  const persona =
    personas.find((entry) => entry.slug === personaSlug) ??
    personas.find((entry) => entry.slug === "flash-me-outside");

  const voice = args.voice ?? "coral";
  const model = args.model ?? "gpt-4o-mini-tts";
  const text = args.text ?? persona.openingMessage ?? DEFAULT_TEXT;
  const stylePreset = args.style ?? "sultry";
  const pacing = args.pacing ?? "medium";
  const responseFormat = args.format ?? "mp3";
  const instructions = buildInstructions({ persona, stylePreset, pacing });

  if (args["dry-run"]) {
    console.log(
      JSON.stringify(
        {
          model,
          voice,
          responseFormat,
          persona: persona.slug,
          text,
          instructions,
        },
        null,
        2,
      ),
    );
    return;
  }

  if (!process.env.OPENAI_API_KEY) {
    throw new Error("OPENAI_API_KEY is required.");
  }

  await fs.mkdir(OUTPUT_DIR, { recursive: true });

  const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  const response = await client.audio.speech.create({
    model,
    voice,
    input: text,
    instructions,
    response_format: responseFormat,
  });

  const extension = responseFormat === "pcm" ? "pcm" : responseFormat;
  const filename = `${new Date().toISOString().replace(/[:.]/g, "-")}-${slugify(
    persona.slug,
  )}-${voice}.${extension}`;
  const filePath = path.join(OUTPUT_DIR, filename);
  const buffer = Buffer.from(await response.arrayBuffer());

  await fs.writeFile(filePath, buffer);

  console.log(`Saved TTS sample to ${filePath}`);
  console.log(`Voice: ${voice}`);
  console.log(`Persona: ${persona.name}`);
  console.log(`Style: ${stylePreset}`);

  if (args.play) {
    if (process.platform !== "darwin") {
      console.log("Auto-play is only wired up for macOS right now.");
      return;
    }

    console.log("Playing clip...");
    const child = spawn("afplay", [filePath], { stdio: "ignore", detached: true });
    child.unref();
  } else {
    console.log(`Play it with: afplay '${filePath}'`);
  }
}

main().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});
