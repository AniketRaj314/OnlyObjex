import { mkdir } from "node:fs/promises";
import { randomUUID } from "node:crypto";
import path from "node:path";
import type {
  ObjexChatMessage,
  ObjexChatMessageRole,
  ObjexProfile,
  StoredObjex,
} from "@/lib/schemas/objex";
import {
  objexChatMessageSchema,
  storedObjexSchema,
} from "@/lib/schemas/objex";
import { getSupabaseAdminClient, hasSupabase } from "@/lib/supabase";

const dataDir = path.join(process.cwd(), "data");
const dbPath = path.join(dataDir, "onlyobjex.db");

type SQLiteDatabase = {
  exec: (sql: string) => void;
  prepare: (sql: string) => {
    run: (...args: unknown[]) => unknown;
    get: (...args: unknown[]) => unknown;
    all: (...args: unknown[]) => unknown;
  };
};

type SupabaseObjexRow = {
  id: string;
  image_path: string;
  image_public_url: string;
  created_at: string;
  is_published: boolean;
  published_at: string | null;
  profile_json: Record<string, unknown>;
};

type SupabaseChatMessageRow = {
  id: string;
  objex_id: string;
  role: string;
  content: string;
  created_at: string;
  audio_public_url: string | null;
};

let database: SQLiteDatabase | undefined;

async function getSQLiteModule() {
  return import("node:sqlite");
}

function getColumns(db: SQLiteDatabase) {
  return db.prepare("PRAGMA table_info(objex)").all() as Array<{
    name: string;
  }>;
}

function ensureObjexSchema(db: SQLiteDatabase) {
  db.exec(`
    CREATE TABLE IF NOT EXISTS objex (
      id TEXT PRIMARY KEY,
      image_path TEXT NOT NULL,
      image_public_url TEXT NOT NULL,
      created_at TEXT NOT NULL,
      profile_json TEXT NOT NULL
    )
  `);

  const columns = getColumns(db).map((column) => column.name);

  if (!columns.includes("is_published")) {
    db.exec(
      "ALTER TABLE objex ADD COLUMN is_published INTEGER NOT NULL DEFAULT 0",
    );
  }

  if (!columns.includes("published_at")) {
    db.exec("ALTER TABLE objex ADD COLUMN published_at TEXT");
  }

  db.exec(`
    CREATE TABLE IF NOT EXISTS objex_chat_messages (
      id TEXT PRIMARY KEY,
      objex_id TEXT NOT NULL,
      role TEXT NOT NULL,
      content TEXT NOT NULL,
      created_at TEXT NOT NULL,
      audio_public_url TEXT,
      FOREIGN KEY(objex_id) REFERENCES objex(id) ON DELETE CASCADE
    )
  `);

  db.exec(`
    CREATE INDEX IF NOT EXISTS objex_chat_messages_objex_created_at_idx
    ON objex_chat_messages (objex_id, created_at)
  `);

  db.exec(`
    CREATE TABLE IF NOT EXISTS objex_chat_memory (
      objex_id TEXT PRIMARY KEY,
      summary TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      FOREIGN KEY(objex_id) REFERENCES objex(id) ON DELETE CASCADE
    )
  `);
}

async function getDatabase() {
  if (database) {
    return database;
  }

  const { DatabaseSync } = await getSQLiteModule();
  database = new DatabaseSync(dbPath) as SQLiteDatabase;
  ensureObjexSchema(database);

  return database;
}

function parseStoredObjexRow(row: {
  id: string;
  imagePath: string;
  imagePublicUrl: string;
  createdAt: string;
  isPublished: boolean | number;
  publishedAt: string | null;
  profileJson: string | Record<string, unknown>;
}) {
  return storedObjexSchema.parse({
    id: row.id,
    imagePath: row.imagePath,
    imagePublicUrl: row.imagePublicUrl,
    createdAt: row.createdAt,
    isPublished: Boolean(row.isPublished),
    publishedAt: row.publishedAt,
    profile:
      typeof row.profileJson === "string"
        ? JSON.parse(row.profileJson)
        : row.profileJson,
  });
}

function parseChatMessageRow(row: {
  id: string;
  objexId: string;
  role: string;
  content: string;
  createdAt: string;
  audioPublicUrl: string | null;
}) {
  return objexChatMessageSchema.parse(row);
}

export async function initializeDatabase() {
  if (hasSupabase()) {
    return;
  }

  await mkdir(dataDir, { recursive: true });
  await getDatabase();
}

export async function saveObjex(record: {
  id: string;
  imagePath: string;
  imagePublicUrl: string;
  createdAt: string;
  profile: ObjexProfile;
}) {
  if (hasSupabase()) {
    const supabase = getSupabaseAdminClient();
    const { error } = await supabase.from("objex").insert({
      id: record.id,
      image_path: record.imagePath,
      image_public_url: record.imagePublicUrl,
      created_at: record.createdAt,
      profile_json: record.profile,
      is_published: false,
      published_at: null,
    });

    if (error) {
      throw new Error(`Failed to save Objex in Supabase: ${error.message}`);
    }

    return;
  }

  await initializeDatabase();
  const db = await getDatabase();

  db.prepare(
    `
      INSERT INTO objex (
        id,
        image_path,
        image_public_url,
        created_at,
        profile_json,
        is_published,
        published_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?)
    `,
  ).run(
    record.id,
    record.imagePath,
    record.imagePublicUrl,
    record.createdAt,
    JSON.stringify(record.profile),
    0,
    null,
  );
}

export async function getObjexById(id: string): Promise<StoredObjex | null> {
  if (hasSupabase()) {
    const supabase = getSupabaseAdminClient();
    const { data, error } = await supabase
      .from("objex")
      .select(
        "id, image_path, image_public_url, created_at, is_published, published_at, profile_json",
      )
      .eq("id", id)
      .maybeSingle();

    if (error) {
      throw new Error(`Failed to load Objex from Supabase: ${error.message}`);
    }

    if (!data) {
      return null;
    }

    return parseStoredObjexRow({
      id: data.id,
      imagePath: data.image_path,
      imagePublicUrl: data.image_public_url,
      createdAt: data.created_at,
      isPublished: data.is_published,
      publishedAt: data.published_at,
      profileJson: data.profile_json,
    });
  }

  await initializeDatabase();
  const db = await getDatabase();

  const row = db
    .prepare(
      `
        SELECT
          id,
          image_path as imagePath,
          image_public_url as imagePublicUrl,
          created_at as createdAt,
          is_published as isPublished,
          published_at as publishedAt,
          profile_json as profileJson
        FROM objex
        WHERE id = ?
      `,
    )
    .get(id) as
    | {
        id: string;
        imagePath: string;
        imagePublicUrl: string;
        createdAt: string;
        isPublished: number;
        publishedAt: string | null;
        profileJson: string;
      }
    | undefined;

  if (!row) {
    return null;
  }

  return parseStoredObjexRow(row);
}

export async function setObjexPublishedState(
  id: string,
  isPublished: boolean,
): Promise<StoredObjex | null> {
  const publishedAt = isPublished ? new Date().toISOString() : null;

  if (hasSupabase()) {
    const supabase = getSupabaseAdminClient();
    const { error } = await supabase
      .from("objex")
      .update({
        is_published: isPublished,
        published_at: publishedAt,
      })
      .eq("id", id);

    if (error) {
      throw new Error(
        `Failed to update publish state in Supabase: ${error.message}`,
      );
    }

    return getObjexById(id);
  }

  await initializeDatabase();
  const db = await getDatabase();

  db.prepare(
    `
      UPDATE objex
      SET
        is_published = ?,
        published_at = ?
      WHERE id = ?
    `,
  ).run(isPublished ? 1 : 0, publishedAt, id);

  return getObjexById(id);
}

export async function listPublishedObjex(): Promise<StoredObjex[]> {
  if (hasSupabase()) {
    const supabase = getSupabaseAdminClient();
    const { data, error } = await supabase
      .from("objex")
      .select(
        "id, image_path, image_public_url, created_at, is_published, published_at, profile_json",
      )
      .eq("is_published", true)
      .order("published_at", { ascending: false, nullsFirst: false })
      .order("created_at", { ascending: false });

    if (error) {
      throw new Error(
        `Failed to list published Objex from Supabase: ${error.message}`,
      );
    }

    return ((data ?? []) as SupabaseObjexRow[]).map((row) =>
      parseStoredObjexRow({
        id: row.id,
        imagePath: row.image_path,
        imagePublicUrl: row.image_public_url,
        createdAt: row.created_at,
        isPublished: row.is_published,
        publishedAt: row.published_at,
        profileJson: row.profile_json,
      }),
    );
  }

  await initializeDatabase();
  const db = await getDatabase();
  const rows = db
    .prepare(
      `
        SELECT
          id,
          image_path as imagePath,
          image_public_url as imagePublicUrl,
          created_at as createdAt,
          is_published as isPublished,
          published_at as publishedAt,
          profile_json as profileJson
        FROM objex
        WHERE is_published = 1
        ORDER BY COALESCE(published_at, created_at) DESC
      `,
    )
    .all() as Array<{
    id: string;
    imagePath: string;
    imagePublicUrl: string;
    createdAt: string;
    isPublished: number;
    publishedAt: string | null;
    profileJson: string;
  }>;

  return rows.map(parseStoredObjexRow);
}

export async function listAllObjex(): Promise<StoredObjex[]> {
  if (hasSupabase()) {
    const supabase = getSupabaseAdminClient();
    const { data, error } = await supabase
      .from("objex")
      .select(
        "id, image_path, image_public_url, created_at, is_published, published_at, profile_json",
      )
      .order("created_at", { ascending: false });

    if (error) {
      throw new Error(`Failed to list Objex from Supabase: ${error.message}`);
    }

    return ((data ?? []) as SupabaseObjexRow[]).map((row) =>
      parseStoredObjexRow({
        id: row.id,
        imagePath: row.image_path,
        imagePublicUrl: row.image_public_url,
        createdAt: row.created_at,
        isPublished: row.is_published,
        publishedAt: row.published_at,
        profileJson: row.profile_json,
      }),
    );
  }

  await initializeDatabase();
  const db = await getDatabase();
  const rows = db
    .prepare(
      `
        SELECT
          id,
          image_path as imagePath,
          image_public_url as imagePublicUrl,
          created_at as createdAt,
          is_published as isPublished,
          published_at as publishedAt,
          profile_json as profileJson
        FROM objex
        ORDER BY created_at DESC
      `,
    )
    .all() as Array<{
    id: string;
    imagePath: string;
    imagePublicUrl: string;
    createdAt: string;
    isPublished: number;
    publishedAt: string | null;
    profileJson: string;
  }>;

  return rows.map(parseStoredObjexRow);
}

export async function ensureObjexChatStarterMessage(record: {
  objexId: string;
  openingMessage: string;
}) {
  if (hasSupabase()) {
    const supabase = getSupabaseAdminClient();
    const { count, error } = await supabase
      .from("objex_chat_messages")
      .select("id", { count: "exact", head: true })
      .eq("objex_id", record.objexId);

    if (error) {
      throw new Error(
        `Failed to check chat starter message in Supabase: ${error.message}`,
      );
    }

    if ((count ?? 0) > 0) {
      return;
    }

    const { error: insertError } = await supabase
      .from("objex_chat_messages")
      .insert({
        id: randomUUID(),
        objex_id: record.objexId,
        role: "assistant",
        content: record.openingMessage,
        created_at: new Date().toISOString(),
        audio_public_url: null,
      });

    if (insertError) {
      throw new Error(
        `Failed to insert starter message in Supabase: ${insertError.message}`,
      );
    }

    return;
  }

  await initializeDatabase();
  const db = await getDatabase();
  const row = db
    .prepare(
      `
        SELECT COUNT(*) as count
        FROM objex_chat_messages
        WHERE objex_id = ?
      `,
    )
    .get(record.objexId) as { count: number };

  if (row.count > 0) {
    return;
  }

  db.prepare(
    `
      INSERT INTO objex_chat_messages (
        id,
        objex_id,
        role,
        content,
        created_at,
        audio_public_url
      ) VALUES (?, ?, ?, ?, ?, ?)
    `,
  ).run(
    randomUUID(),
    record.objexId,
    "assistant",
    record.openingMessage,
    new Date().toISOString(),
    null,
  );
}

export async function listObjexChatMessages(
  objexId: string,
): Promise<ObjexChatMessage[]> {
  if (hasSupabase()) {
    const supabase = getSupabaseAdminClient();
    const { data, error } = await supabase
      .from("objex_chat_messages")
      .select("id, objex_id, role, content, created_at, audio_public_url")
      .eq("objex_id", objexId)
      .order("created_at", { ascending: true });

    if (error) {
      throw new Error(
        `Failed to list chat messages from Supabase: ${error.message}`,
      );
    }

    return ((data ?? []) as SupabaseChatMessageRow[]).map((row) =>
      parseChatMessageRow({
        id: row.id,
        objexId: row.objex_id,
        role: row.role,
        content: row.content,
        createdAt: row.created_at,
        audioPublicUrl: row.audio_public_url,
      }),
    );
  }

  await initializeDatabase();
  const db = await getDatabase();
  const rows = db
    .prepare(
      `
        SELECT
          id,
          objex_id as objexId,
          role,
          content,
          created_at as createdAt,
          audio_public_url as audioPublicUrl
        FROM objex_chat_messages
        WHERE objex_id = ?
        ORDER BY created_at ASC
      `,
    )
    .all(objexId) as Array<{
    id: string;
    objexId: string;
    role: string;
    content: string;
    createdAt: string;
    audioPublicUrl: string | null;
  }>;

  return rows.map(parseChatMessageRow);
}

export async function saveObjexChatMessage(record: {
  objexId: string;
  role: ObjexChatMessageRole;
  content: string;
  createdAt?: string;
  audioPublicUrl?: string | null;
}): Promise<ObjexChatMessage> {
  const id = randomUUID();
  const createdAt = record.createdAt ?? new Date().toISOString();
  const audioPublicUrl = record.audioPublicUrl ?? null;

  if (hasSupabase()) {
    const supabase = getSupabaseAdminClient();
    const { error } = await supabase.from("objex_chat_messages").insert({
      id,
      objex_id: record.objexId,
      role: record.role,
      content: record.content,
      created_at: createdAt,
      audio_public_url: audioPublicUrl,
    });

    if (error) {
      throw new Error(
        `Failed to save chat message in Supabase: ${error.message}`,
      );
    }

    return parseChatMessageRow({
      id,
      objexId: record.objexId,
      role: record.role,
      content: record.content,
      createdAt,
      audioPublicUrl,
    });
  }

  await initializeDatabase();
  const db = await getDatabase();

  db.prepare(
    `
      INSERT INTO objex_chat_messages (
        id,
        objex_id,
        role,
        content,
        created_at,
        audio_public_url
      ) VALUES (?, ?, ?, ?, ?, ?)
    `,
  ).run(
    id,
    record.objexId,
    record.role,
    record.content,
    createdAt,
    audioPublicUrl,
  );

  return parseChatMessageRow({
    id,
    objexId: record.objexId,
    role: record.role,
    content: record.content,
    createdAt,
    audioPublicUrl,
  });
}

export async function getObjexChatMemorySummary(objexId: string) {
  if (hasSupabase()) {
    const supabase = getSupabaseAdminClient();
    const { data, error } = await supabase
      .from("objex_chat_memory")
      .select("summary")
      .eq("objex_id", objexId)
      .maybeSingle();

    if (error) {
      throw new Error(
        `Failed to read chat memory from Supabase: ${error.message}`,
      );
    }

    return data?.summary ?? null;
  }

  await initializeDatabase();
  const db = await getDatabase();
  const row = db
    .prepare(
      `
        SELECT summary
        FROM objex_chat_memory
        WHERE objex_id = ?
      `,
    )
    .get(objexId) as { summary: string } | undefined;

  return row?.summary ?? null;
}

export async function saveObjexChatMemorySummary(record: {
  objexId: string;
  summary: string;
}) {
  const updatedAt = new Date().toISOString();

  if (hasSupabase()) {
    const supabase = getSupabaseAdminClient();
    const { error } = await supabase.from("objex_chat_memory").upsert(
      {
        objex_id: record.objexId,
        summary: record.summary,
        updated_at: updatedAt,
      },
      {
        onConflict: "objex_id",
      },
    );

    if (error) {
      throw new Error(
        `Failed to save chat memory in Supabase: ${error.message}`,
      );
    }

    return;
  }

  await initializeDatabase();
  const db = await getDatabase();

  db.prepare(
    `
      INSERT INTO objex_chat_memory (
        objex_id,
        summary,
        updated_at
      ) VALUES (?, ?, ?)
      ON CONFLICT(objex_id) DO UPDATE SET
        summary = excluded.summary,
        updated_at = excluded.updated_at
    `,
  ).run(record.objexId, record.summary, updatedAt);
}
