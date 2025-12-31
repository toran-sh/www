import { cookies } from "next/headers";
import { db } from "./mongodb";

const MAGIC_LINK_TTL_MS = 15 * 60 * 1000; // 15 minutes
const SESSION_TTL_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

interface MagicLinkDoc {
  token: string;
  email: string;
  expiresAt: Date;
}

interface SessionDoc {
  token: string;
  email: string;
  expiresAt: Date;
}

// Get collections with TTL indexes
const magicLinksCollection = () => db.collection<MagicLinkDoc>("magic_links");
const sessionsCollection = () => db.collection<SessionDoc>("sessions");

// Ensure TTL indexes exist (call once on startup or use MongoDB shell)
export async function ensureIndexes(): Promise<void> {
  // Drop stale indexes if they exist
  try {
    await sessionsCollection().dropIndex("sessionId_1");
  } catch {
    // Index doesn't exist, ignore
  }

  await magicLinksCollection().createIndex(
    { expiresAt: 1 },
    { expireAfterSeconds: 0 }
  );
  await sessionsCollection().createIndex(
    { expiresAt: 1 },
    { expireAfterSeconds: 0 }
  );
  await magicLinksCollection().createIndex({ token: 1 }, { unique: true });
  await sessionsCollection().createIndex({ token: 1 }, { unique: true });
}

export function generateToken(): string {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return Array.from(array, (byte) => byte.toString(16).padStart(2, "0")).join("");
}

export async function storeToken(token: string, email: string): Promise<void> {
  await magicLinksCollection().insertOne({
    token,
    email,
    expiresAt: new Date(Date.now() + MAGIC_LINK_TTL_MS),
  });
}

export async function verifyToken(token: string): Promise<string | null> {
  const doc = await magicLinksCollection().findOneAndDelete({
    token,
    expiresAt: { $gt: new Date() },
  });

  return doc?.email || null;
}

export async function createSession(email: string): Promise<void> {
  const cookieStore = await cookies();
  const sessionToken = generateToken();

  await sessionsCollection().insertOne({
    token: sessionToken,
    email,
    expiresAt: new Date(Date.now() + SESSION_TTL_MS),
  });

  cookieStore.set("session", sessionToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
  });
}

export async function getSession(): Promise<string | null> {
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get("session")?.value;

  if (!sessionToken) {
    return null;
  }

  const newExpiresAt = new Date(Date.now() + SESSION_TTL_MS);

  // Find and update expiration (sliding session)
  const doc = await sessionsCollection().findOneAndUpdate(
    {
      token: sessionToken,
      expiresAt: { $gt: new Date() },
    },
    {
      $set: { expiresAt: newExpiresAt },
    },
    {
      returnDocument: "after",
    }
  );

  return doc?.email || null;
}

export async function deleteSession(): Promise<void> {
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get("session")?.value;

  if (sessionToken) {
    await sessionsCollection().deleteOne({ token: sessionToken });
  }

  cookieStore.delete("session");
}
