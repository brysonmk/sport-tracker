import "server-only";
import { cache } from "react";
import { Prisma } from "@/generated/prisma/client";
import { db } from "@/lib/db";
import { generateAdminToken, generateSlug, hashAdminToken } from "@/lib/tokens";

/**
 * Creates a league and returns its public slug and its admin token.
 * This is the only moment the plain admin token exists on the server: it goes into the
 * admin link and is never stored (only its hash is).
 */
export async function createLeague(name: string): Promise<{ slug: string; adminToken: string }> {
  const adminToken = generateAdminToken();

  // The slug has a random suffix; if it happens to be taken, try another one.
  for (let attempt = 0; attempt < 5; attempt++) {
    const slug = generateSlug(name);
    try {
      await db.league.create({ data: { name, slug, adminTokenHash: hashAdminToken(adminToken) } });
      return { slug, adminToken };
    } catch (error) {
      const isUniqueViolation = error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002";
      if (!isUniqueViolation) throw error;
    }
  }
  throw new Error("Could not generate a unique league link. Please try again.");
}

/**
 * `cache` (from React) de-duplicates calls within one request: the layout and the page
 * can both ask for the league and only one query runs.
 */
export const findLeagueBySlug = cache(async (slug: string) => {
  return db.league.findUnique({ where: { slug } });
});

const ADMIN_TOKEN_SHAPE = /^[A-Za-z0-9_-]{32}$/;

/** The league this admin token unlocks, or null for a wrong/garbled token. */
export const findLeagueByAdminToken = cache(async (token: string) => {
  if (!ADMIN_TOKEN_SHAPE.test(token)) return null; // skip the query for obvious junk
  return db.league.findUnique({ where: { adminTokenHash: hashAdminToken(token) } });
});
