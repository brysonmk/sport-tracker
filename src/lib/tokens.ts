import { createHash, randomBytes } from "node:crypto";

/**
 * A league has two links:
 *   - a public link, /l/<slug>, that anyone can view
 *   - a secret admin link, /a/<adminToken>, that lets the holder edit the league
 *
 * We never store the admin token itself, only its SHA-256 hash. If the database
 * leaked, nobody could rebuild the admin links from it. A fast hash (not bcrypt) is
 * fine here because the token is 192 random bits, so it can't be guessed.
 */

/** 24 random bytes as URL-safe base64: 32 characters, 192 bits of entropy. */
export function generateAdminToken(): string {
  return randomBytes(24).toString("base64url");
}

export function hashAdminToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

/**
 * Builds a readable public slug from the league name plus a random suffix so two
 * leagues with the same name never collide, e.g. "Tuesday Night 5s" -> "tuesday-night-5s-k3x9".
 */
export function generateSlug(name: string): string {
  const base = slugify(name) || "league";
  return `${base}-${randomSuffix(4)}`;
}

export function slugify(text: string): string {
  return text
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "") // strip accents: "Café" -> "Cafe"
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 40)
    .replace(/-+$/, "");
}

const SUFFIX_ALPHABET = "abcdefghjkmnpqrstuvwxyz23456789"; // no 0/o, 1/l/i lookalikes

function randomSuffix(length: number): string {
  const bytes = randomBytes(length);
  return Array.from(bytes, (b) => SUFFIX_ALPHABET[b % SUFFIX_ALPHABET.length]).join("");
}
