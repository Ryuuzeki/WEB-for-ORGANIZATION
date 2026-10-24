import "server-only";

import { get as getBlob, put as putBlob } from "@vercel/blob";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import type { CalendarEvent } from "@/domain/entities/CalendarEvent";

const CALENDAR_DATA_PATH = "hmtkba/data/calendar-events.json";

interface CalendarEventRow {
  id: string;
  title: string;
  description: string;
  location: string;
  starts_at: string;
  ends_at: string | null;
  created_at: string;
  updated_at: string;
}

interface D1Result<T> {
  results?: T[];
}

interface D1PreparedStatement {
  bind(...values: unknown[]): D1PreparedStatement;
  all<T>(): Promise<D1Result<T>>;
  run(): Promise<unknown>;
}

interface D1DatabaseLike {
  prepare(query: string): D1PreparedStatement;
  batch(statements: D1PreparedStatement[]): Promise<unknown[]>;
}

type CalendarEventGlobals = typeof globalThis & {
  __hmtkbaCalendarEvents?: Map<string, CalendarEvent>;
};

const localEvents = ((globalThis as CalendarEventGlobals).__hmtkbaCalendarEvents ??= new Map());
const initializedDatabases = new WeakSet<object>();
const hasBlobStorage = () => Boolean(process.env.BLOB_READ_WRITE_TOKEN || process.env.BLOB_STORE_ID);

const CREATE_TABLE_SQL = `
  CREATE TABLE IF NOT EXISTS calendar_events (
    id TEXT PRIMARY KEY NOT NULL,
    title TEXT NOT NULL,
    description TEXT NOT NULL DEFAULT '',
    location TEXT NOT NULL DEFAULT '',
    starts_at TEXT NOT NULL,
    ends_at TEXT,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  )
`;

const CREATE_INDEX_SQL = `
  CREATE INDEX IF NOT EXISTS idx_calendar_events_starts_at
  ON calendar_events (starts_at)
`;

function isD1Database(value: unknown): value is D1DatabaseLike {
  return Boolean(
    value &&
      typeof value === "object" &&
      "prepare" in value &&
      typeof (value as { prepare?: unknown }).prepare === "function",
  );
}

async function getDatabase(): Promise<D1DatabaseLike | null> {
  try {
    const { env } = await getCloudflareContext({ async: true });
    const database = (env as unknown as Record<string, unknown>).DB;
    return isD1Database(database) ? database : null;
  } catch {
    return null;
  }
}

async function ensureSchema(database: D1DatabaseLike): Promise<void> {
  if (initializedDatabases.has(database as object)) return;

  await database.batch([
    database.prepare(CREATE_TABLE_SQL),
    database.prepare(CREATE_INDEX_SQL),
    database.prepare("PRAGMA optimize"),
  ]);
  initializedDatabases.add(database as object);
}

function fromRow(row: CalendarEventRow): CalendarEvent {
  return {
    id: row.id,
    title: row.title,
    description: row.description,
    location: row.location,
    startsAt: row.starts_at,
    endsAt: row.ends_at,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function sortEvents(events: CalendarEvent[]): CalendarEvent[] {
  return [...events].sort((first, second) => first.startsAt.localeCompare(second.startsAt));
}

async function readBlobEvents(): Promise<CalendarEvent[]> {
  try {
    const result = await getBlob(CALENDAR_DATA_PATH, { access: "public", useCache: false });
    if (!result?.stream) return [];
    const parsed = (await new Response(result.stream).json()) as CalendarEvent[];
    return Array.isArray(parsed) ? sortEvents(parsed) : [];
  } catch {
    return [];
  }
}

async function writeBlobEvents(events: CalendarEvent[]): Promise<void> {
  await putBlob(CALENDAR_DATA_PATH, JSON.stringify(sortEvents(events)), {
    access: "public",
    addRandomSuffix: false,
    allowOverwrite: true,
    cacheControlMaxAge: 30,
    contentType: "application/json; charset=utf-8",
  });
}

export async function listCalendarEvents(): Promise<CalendarEvent[]> {
  if (hasBlobStorage()) return readBlobEvents();

  const database = await getDatabase();
  if (!database) return sortEvents(Array.from(localEvents.values()));

  await ensureSchema(database);
  const result = await database
    .prepare(`
      SELECT id, title, description, location, starts_at, ends_at, created_at, updated_at
      FROM calendar_events
      ORDER BY starts_at ASC
      LIMIT 300
    `)
    .all<CalendarEventRow>();

  return (result.results ?? []).map(fromRow);
}

export async function upsertCalendarEvent(event: CalendarEvent): Promise<void> {
  if (hasBlobStorage()) {
    const events = await readBlobEvents();
    await writeBlobEvents([...events.filter((item) => item.id !== event.id), event]);
    return;
  }

  const database = await getDatabase();
  if (!database) {
    if (process.env.NODE_ENV === "production") {
      throw new Error("Penyimpanan kalender belum tersedia. Silakan coba lagi setelah situs selesai diperbarui.");
    }
    localEvents.set(event.id, event);
    return;
  }

  await ensureSchema(database);
  await database
    .prepare(`
      INSERT INTO calendar_events (
        id, title, description, location, starts_at, ends_at, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(id) DO UPDATE SET
        title = excluded.title,
        description = excluded.description,
        location = excluded.location,
        starts_at = excluded.starts_at,
        ends_at = excluded.ends_at,
        updated_at = excluded.updated_at
    `)
    .bind(
      event.id,
      event.title,
      event.description,
      event.location,
      event.startsAt,
      event.endsAt,
      event.createdAt,
      event.updatedAt,
    )
    .run();
}

export async function removeCalendarEvent(id: string): Promise<void> {
  if (hasBlobStorage()) {
    const events = await readBlobEvents();
    await writeBlobEvents(events.filter((event) => event.id !== id));
    return;
  }

  const database = await getDatabase();
  if (!database) {
    if (process.env.NODE_ENV === "production") {
      throw new Error("Penyimpanan kalender belum tersedia. Silakan coba lagi setelah situs selesai diperbarui.");
    }
    localEvents.delete(id);
    return;
  }

  await ensureSchema(database);
  await database.prepare("DELETE FROM calendar_events WHERE id = ?").bind(id).run();
}
