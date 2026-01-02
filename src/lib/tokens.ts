import { cookies } from "next/headers";
import { ObjectId } from "mongodb";
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
  userId: string;
  expiresAt: Date;
}

interface UserDoc {
  _id: ObjectId;
  email: string;
  createdAt: Date;
}

// Get collections with TTL indexes
const magicLinksCollection = () => db.collection<MagicLinkDoc>("magic_links");
const sessionsCollection = () => db.collection<SessionDoc>("sessions");
const usersCollection = () => db.collection<UserDoc>("users");

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
  await db.collection("claim_tokens").createIndex(
    { expiresAt: 1 },
    { expireAfterSeconds: 0 }
  );
  await magicLinksCollection().createIndex({ token: 1 }, { unique: true });
  await sessionsCollection().createIndex({ token: 1 }, { unique: true });
  await db.collection("claim_tokens").createIndex({ token: 1 }, { unique: true });
  await usersCollection().createIndex({ email: 1 }, { unique: true });
}

export async function findOrCreateUser(email: string): Promise<string> {
  const existingUser = await usersCollection().findOne({ email });
  if (existingUser) {
    return existingUser._id.toString();
  }

  const result = await usersCollection().insertOne({
    email,
    createdAt: new Date(),
  } as UserDoc);

  return result.insertedId.toString();
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

  // Find or create user, get their ID
  const userId = await findOrCreateUser(email);

  await sessionsCollection().insertOne({
    token: sessionToken,
    userId,
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

  return doc?.userId || null;
}

export async function deleteSession(): Promise<void> {
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get("session")?.value;

  if (sessionToken) {
    await sessionsCollection().deleteOne({ token: sessionToken });
  }

  cookieStore.delete("session");
}

// Trial token management for anonymous users
export async function getTrialToken(): Promise<string | null> {
  const cookieStore = await cookies();
  return cookieStore.get("trial_session")?.value || null;
}

export async function setTrialTokenCookie(token: string): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set("trial_session", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 7 * 24 * 60 * 60, // 7 days
  });
}

export async function clearTrialToken(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete("trial_session");
}

// Claim token for linking trial torans to users
interface ClaimTokenDoc {
  token: string;
  email: string;
  subdomain: string;
  trialToken: string;
  expiresAt: Date;
}

const claimTokensCollection = () => db.collection<ClaimTokenDoc>("claim_tokens");

export async function storeClaimToken(
  token: string,
  email: string,
  subdomain: string,
  trialToken: string
): Promise<void> {
  await claimTokensCollection().insertOne({
    token,
    email,
    subdomain,
    trialToken,
    expiresAt: new Date(Date.now() + MAGIC_LINK_TTL_MS),
  });
}

export async function verifyClaimToken(
  token: string
): Promise<{ email: string; subdomain: string; trialToken: string } | null> {
  const doc = await claimTokensCollection().findOneAndDelete({
    token,
    expiresAt: { $gt: new Date() },
  });

  if (!doc) return null;

  return {
    email: doc.email,
    subdomain: doc.subdomain,
    trialToken: doc.trialToken,
  };
}
