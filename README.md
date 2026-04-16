# OnlyObjex

OnlyObjex turns everyday objects into witty, provocative AI-generated creator profiles.

Upload a real photo of a single object, and the app identifies it, writes a shamelessly funny innuendo-heavy persona, assigns it a voice, lets you chat with it, pair it with other Objex, and stage it inside cinematic teaser scenes.

The product tone is the whole point:

- sexy, but demo-safe
- witty, pun-heavy, and object-specific
- funny first, suggestive second
- never explicit, pornographic, or crude
- polished enough to feel like a real consumer product

## What The App Does

OnlyObjex is part parody, part AI toy, part premium-feeling creative demo.

It treats inanimate objects like overconfident subscription-era personalities:

- a chair becomes a suspiciously attentive support system
- a camera becomes a shameless watcher with focus issues
- a bulb becomes a glowing problem with tension and heat
- a bottle becomes a clear, portable scandal with commitment issues

The joke works because the app takes the objects very seriously while the copy absolutely does not.

## Feature Overview

### 1. Objex Creation

The core upload flow is built around a clean first slice:

- upload or capture a real object photo
- identify the object from the image
- generate a structured Objex profile
- save the result
- reveal it on its own profile page

Routes:

- `/`
- `/create`
- `/objex/[id]`

What gets generated:

- `name`
- `objectType`
- `tagline`
- `bio`
- `kinks`
- `greenFlags`
- `redFlags`
- `openingMessage`

Hidden profile fields are also generated and stored for consistency:

- `detectedVisualTraits`
- `corePersonality`
- `flirtStyle`
- `humorStyle`
- `darknessLevel`
- `shamelessnessLevel`
- `speakingStyle`
- `forbiddenToneRules`
- `signatureMetaphors`
- `voiceProfile`

### 2. Camera-Friendly Upload

The creation flow supports both library upload and direct camera capture behavior.

What it does:

- supports standard image uploads
- supports mobile-friendly capture with `capture="environment"`
- attempts live browser camera preview when available
- falls back gracefully when browser or device constraints block preview
- keeps the flow compact and progressive instead of stuffing everything into one screen

### 3. AI Profile Generation Pipeline

Profile generation is intentionally split into separate steps for quality.

Step 1:

- image understanding / object extraction

Step 2:

- structured Objex profile generation

Why that matters:

- object recognition stays grounded in the image
- personality writing can focus on tone quality
- the final output remains strict JSON and schema-validated

### 4. Polished Reveal Page

Each Objex gets a premium creator-style reveal page inspired by subscription-platform profile layouts.

The reveal page includes:

- uploaded object image
- large creator-style identity section
- tagline and bio
- collapsible sections for kinks, green flags, and red flags
- voice settings
- publish controls
- live chat section

Design direction:

- white background
- bright cyan-blue accent
- soft gray borders
- rounded cards
- profile-heavy composition
- playful contrast between serious layout and ridiculous copy

### 5. Local Publish / Unpublish

Objex can be published or unpublished without regenerating anything.

What publish does:

- marks the Objex as public in persistence
- adds `isPublished`
- adds `publishedAt`
- makes it eligible for community browsing
- makes it eligible for chemistry and scenes

### 6. Community Page

The app includes a browseable community page for published Objex.

Route:

- `/community`

What it supports:

- published Objex only
- search
- lightweight filters
- sort controls
- card-based browsing
- direct links into public Objex pages

Each card shows:

- image
- name
- object type
- tagline or profile snippet

### 7. Live Objex Chat

Each Objex can chat in-character from its reveal page.

What the chat system does:

- keeps the object in character
- uses its stored profile and tone fields
- remembers recent conversation context
- generates short, punchy replies
- optionally speaks replies aloud with the Objex’s stored voice profile

Chat behavior goals:

- witty
- suggestive but clean
- object-specific
- memory-aware
- faster and tighter than the main profile generator

### 8. Fixed Voice Per Objex

Each Objex has a stored voice profile used across voice features.

Voice profile includes:

- TTS model
- TTS voice
- mood
- speed

Important behavior:

- the Objex stores a voice identity as part of its profile
- voice playback uses that stored identity
- runtime validation keeps model and voice aligned with the supported env allowlist
- old or invalid stored voice values are sanitized instead of breaking TTS

### 9. Chemistry Mode

Two published Objex can be paired to generate a flirty first-time conversation.

Route:

- `/chemistry`

What it does:

- select two published Objex
- prevent duplicate selection
- generate a six-turn alternating conversation
- keep both objects faithful to their own profile, tone, and kinks
- let each object flirt with the other object’s traits and metaphors
- generate per-line TTS
- support full-scene sequential playback

Tone goals:

- first-meeting chemistry
- playful tension from line one
- innuendo-heavy but public-demo safe
- funny and memorable rather than generic

### 10. Scene Generation

Objex can also be placed into cinematic scenarios for scene planning and prompt generation.

Route:

- `/scenes`

What it does:

- select one or two published Objex
- choose a scenario preset
- optionally add a custom scenario note
- optionally apply a mood modifier
- generate a cinematic scene treatment
- generate a final Sora-ready prompt
- optionally start video rendering after confirmation

Current scenario direction includes presets like:

- Couples Therapy
- First Date
- Messy Breakup
- After-Hours Office
- Group Therapy
- Forbidden Workplace Romance
- Passive-Aggressive Reunion
- Toxic Domestic Bliss

### 11. Progressive Scene UX

The Scenes page has been redesigned into a cleaner guided flow.

What changed in the UX:

- cast selection first
- scenario setup second
- generation third
- result view simplified to foreground the scene and prompt
- heavy planner detail stays in the background instead of cluttering the page

### 12. Video Render Handoff

The app is already prepared to move from planning to actual teaser rendering.

Current behavior:

- generate the scene plan first
- confirm before starting render
- kick off an async video render job
- poll render status
- show queued / rendering / completed / failed states
- play completed video from storage

The current teaser model assumes short clips rather than long-form scenes.

## Product Experience

OnlyObjex is meant to feel:

- like an AI-native parody of creator-profile culture
- glamorous, cheeky, and slightly ridiculous
- more premium consumer product than dev-tool demo
- fast to try
- instantly legible in a hackathon setting

The strongest moments in the app are the contrast points:

- ordinary object vs scandalous persona
- clean premium UI vs ridiculous copy
- static profile vs interactive voice and chemistry
- cinematic seriousness vs absurd object drama

## Feature List By Route

### `/`

- landing page
- product pitch
- nav into create, community, chemistry, and scenes
- featured published Objex pulled from the database

### `/create`

- upload or camera capture
- compact progressive creation flow
- live preview / selected photo state
- generation loading state
- submission into AI generation pipeline

### `/objex/[id]`

- reveal page
- creator-style profile layout
- publish / unpublish
- voice settings
- in-character chat with optional voice playback

### `/community`

- published Objex browser
- search
- sort / browse
- card links to public Objex profiles

### `/chemistry`

- two-Objex selector
- searchable published roster
- six-turn conversation generation
- per-line TTS
- play full scene

### `/scenes`

- one or two Objex selector
- scenario presets
- custom scene note
- mood modifiers
- scene plan generation
- final Sora-ready prompt
- confirm-and-render video step

## AI Systems In The App

### Object Extraction

Used to recognize the uploaded object and gather visual hooks for later writing.

### Profile Generation

Used to write the structured Objex persona in strict JSON.

### Chat Generation

Used to keep short interactive conversation in-character.

### Chemistry Generation

Used to create two-Objex flirt scenes with alternating dialogue.

### Scene Planning

Used to convert Objex profiles and scenarios into cinematic treatment outputs and render-ready prompts.

### Text To Speech

Used to give Objex a consistent voice identity in chat and chemistry.

### Video Rendering

Used after scene confirmation to turn the prompt into a short teaser render.

## Safety And Tone Rules

The app is intentionally suggestive, but it is not explicit.

Core rules:

- no explicit anatomy
- no explicit sexual acts
- no pornographic language
- no crude shock-value writing
- no generic chatbot compliments
- no soft wholesome Pixar energy
- no branded IP or copyrighted characters in scene prompts
- no human faces as the main characters in scene generation

The target tone is:

- clever
- shameless
- object-specific
- flirtatious
- public-demo safe

## Tech Stack

- Next.js App Router
- TypeScript
- Tailwind CSS
- Zod
- OpenAI APIs
- local SQLite and local file storage for local-first development
- optional Supabase Postgres + Storage for deployed mode

## Data And Storage

The app supports two persistence modes behind the same data-access layer.

### Local Mode

Used for local-first development.

Storage:

- uploaded images in `public/uploads/`
- chat audio in `public/chat-audio/`
- rendered videos in `public/scene-videos/`
- SQLite database in `data/onlyobjex.db`

### Hosted Mode

Used for deployment.

Storage:

- Supabase Postgres for records
- Supabase Storage for uploads, audio, and videos

The app automatically switches to hosted persistence when the required Supabase env vars are present.

## Environment

Copy `.env.example` to `.env.local`.

```bash
cp .env.example .env.local
```

Important env vars:

- `OPENAI_API_KEY`
- `OPENAI_PROFILE_MODEL`
- `OPENAI_SCENE_MODEL`
- `OPENAI_VIDEO_MODEL`
- `OPENAI_VISION_MODEL`
- `OPENAI_TTS_MODELS`
- `OPENAI_TTS_VOICES`
- `NEXT_PUBLIC_APP_URL`
- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `ALLOW_MOCK_GENERATION`

Current useful defaults:

- `OPENAI_PROFILE_MODEL=gpt-5.4`
- `OPENAI_SCENE_MODEL=gpt-5.4`
- `OPENAI_VISION_MODEL=gpt-4.1-mini`
- `OPENAI_VIDEO_MODEL=sora-2`
- `OPENAI_TTS_MODELS=gpt-4o-mini-tts,tts-1-hd`
- `OPENAI_TTS_VOICES=coral,nova,shimmer,marin`

## Run Locally

Install dependencies:

```bash
npm install
```

Start the app:

```bash
npm run dev
```

Open:

- [http://localhost:3000](http://localhost:3000)

## Local Development Notes

- local DB schema upgrades are applied automatically on startup
- publish state is stored directly in the DB
- chat memory is persisted
- community, chemistry, and scenes are DB-driven
- published-only flows are enforced where appropriate

## Deployment

For a judges/demo deployment, the intended path is:

- Vercel
- Supabase Postgres
- Supabase Storage

Supabase buckets expected by the app:

- `uploads`
- `chat-audio`
- `scene-videos`

See:

- [DEPLOYMENT.md](./DEPLOYMENT.md)
- [supabase/schema.sql](./supabase/schema.sql)

## Repository Notes

This app was intentionally built in layers:

1. photo upload
2. AI profile generation
3. saved Objex reveal
4. publish and community
5. chat and voice
6. chemistry between Objex
7. cinematic scene planning
8. video render handoff

That keeps the hackathon slice working end-to-end while leaving the codebase open for future additions like:

- richer community mechanics
- prompt remixing
- scene galleries
- moderation
- auth
- cloud-first collaboration
