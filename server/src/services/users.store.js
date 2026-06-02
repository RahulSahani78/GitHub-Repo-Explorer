import { readFile, writeFile, rename, mkdir } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

/**
 * A minimal JSON-file-backed user store. Good enough for a single-process demo
 * (the brief explicitly allows a JSON file); a real app would use a database.
 *
 * Users persist across server restarts. Reads are cached in memory; writes are
 * flushed to disk atomically (write to a temp file, then rename over the real
 * one) so the store can never be left half-written and therefore corrupt.
 */
const __dirname = dirname(fileURLToPath(import.meta.url));
const DATA_FILE = resolve(__dirname, '../../data/users.json');

let users = null; // in-memory cache: array of user records

async function load() {
  if (users) return users;

  let raw;
  try {
    raw = await readFile(DATA_FILE, 'utf8');
  } catch {
    // File doesn't exist yet — this is a fresh install, start empty.
    users = [];
    return users;
  }

  try {
    const parsed = JSON.parse(raw);
    users = Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    // The file exists but is unreadable. Surface it loudly instead of silently
    // pretending there are no users (which is what makes accounts "disappear").
    console.error(`[users.store] Could not parse ${DATA_FILE}. It may be corrupt.`, error);
    users = [];
  }
  return users;
}

async function persist() {
  await mkdir(dirname(DATA_FILE), { recursive: true });
  const tmpFile = `${DATA_FILE}.tmp`;
  // Write to a temp file first, then atomically swap it in. If the process dies
  // mid-write, the real users.json is left untouched rather than truncated.
  await writeFile(tmpFile, JSON.stringify(users, null, 2), 'utf8');
  await rename(tmpFile, DATA_FILE);
}

export async function findByEmail(email) {
  const all = await load();
  const normalised = email.trim().toLowerCase();
  return all.find((u) => u.email === normalised) ?? null;
}

export async function findById(id) {
  const all = await load();
  return all.find((u) => u.id === id) ?? null;
}

export async function createUser({ name, email, passwordHash }) {
  const all = await load();
  const user = {
    id: `usr_${Date.now().toString(36)}${Math.floor(performance.now()).toString(36)}`,
    name: name.trim(),
    email: email.trim().toLowerCase(),
    passwordHash,
    createdAt: new Date().toISOString(),
  };
  all.push(user);
  await persist();
  return user;
}

/** Used only by tests to start from a clean slate. */
export function __reset() {
  users = [];
}
