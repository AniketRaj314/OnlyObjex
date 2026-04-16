# OnlyObjex

OnlyObjex turns a real photo of an everyday object into a polished, creator-style parody profile with a sexy, witty, innuendo-heavy voice that stays demo-safe.

## First build scope

- `/` landing page
- `/create` upload and generation flow
- `/objex/[id]` reveal page
- `/community` published Objex listing
- image upload to local storage
- saved Objex records in a local SQLite database
- local publish/unpublish state in SQLite
- two-step AI pipeline:
  - object extraction from the image
  - strict JSON profile generation

## Stack

- Next.js App Router
- TypeScript
- Tailwind CSS v4
- OpenAI Responses API
- Zod validation
- local SQLite + local file storage for milestone one

The app is structured so Supabase/Postgres can replace the local repository later without rewriting the UI flow.

## Environment

Copy `.env.example` to `.env.local` and fill in:

```bash
cp .env.example .env.local
```

Required for real generation:

- `OPENAI_API_KEY`

Optional:

- `OPENAI_PROFILE_MODEL` defaults to `gpt-5.4`
- `OPENAI_VISION_MODEL` defaults to `gpt-4.1-mini`
- `NEXT_PUBLIC_APP_URL` defaults to `http://localhost:3000`
- `ALLOW_MOCK_GENERATION=true` enables a local fallback profile generator when no API key is present

## Run locally

```bash
npm install
npm run dev
```

Then open [http://localhost:3000](http://localhost:3000).

Generated images are stored in `public/uploads/` and Objex records are stored in `data/onlyobjex.db`.

## Local publish and community

- Publish or unpublish from the Objex reveal page
- Published profiles appear on `/community`
- Publish state is stored locally in SQLite with `is_published` and `published_at`
- Existing local databases are upgraded automatically on startup; no manual migration is required

## Camera capture

- The create flow supports both `Take photo` and `Choose from library`
- On supported mobile browsers, `Take photo` uses the browser's native file input capture behavior with `capture="environment"` to prompt direct camera capture

## Supabase follow-up

For the first milestone, persistence is local so the app works immediately. A starter Supabase schema is included at `supabase/schema.sql` for the later migration to hosted Postgres and storage.
