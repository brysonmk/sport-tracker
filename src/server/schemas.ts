import { z } from "zod";
import type { FormState } from "@/lib/formState";

/**
 * Validation for everything a form can send. Server actions parse FormData with these
 * before touching the database, because a server action is a public HTTP endpoint:
 * anyone can call it with any payload, whatever the form in the browser allows.
 */

const name = (label: string, max: number) =>
  z
    .string({ error: `${label} is required` })
    .trim()
    .min(1, `${label} is required`)
    .max(max, `${label} must be at most ${max} characters`);

/** "" from an empty <select> or <input> means "not set". */
const optionalId = z
  .string()
  .optional()
  .transform((v) => (v ? v : null));

export const leagueNameSchema = z.object({ name: name("League name", 60) });
export const teamNameSchema = z.object({ name: name("Team name", 40) });

export const playerSchema = z.object({
  name: name("Player name", 40),
  teamId: optionalId,
});

export const matchSchema = z
  .object({
    homeTeamId: z.string().min(1, "Pick the home team"),
    awayTeamId: z.string().min(1, "Pick the away team"),
    /** ISO 8601 with timezone, filled in by the browser (see KickoffInput). */
    kickoffAt: z
      .string()
      .optional()
      .transform((v, ctx) => {
        if (!v) return null;
        const date = new Date(v);
        if (Number.isNaN(date.getTime())) {
          ctx.addIssue({ code: "custom", message: "Kickoff time is not a valid date" });
          return z.NEVER;
        }
        return date;
      }),
  })
  .refine((m) => m.homeTeamId !== m.awayTeamId, {
    message: "A team can't play itself",
    path: ["awayTeamId"],
  });

export const goalSchema = z
  .object({
    teamId: z.string().min(1, "Pick the team that scored"),
    scorerId: optionalId,
    assistId: optionalId,
    minute: z
      .string()
      .optional()
      .transform((v) => (v ? Number(v) : null))
      .pipe(
        z
          .number({ error: "Minute must be a number" })
          .int("Minute must be a whole number")
          .min(0, "Minute can't be negative")
          .max(200, "Minute must be 200 or less")
          .nullable(),
      ),
  })
  .refine((g) => !g.assistId || g.assistId !== g.scorerId, {
    message: "A player can't assist their own goal",
    path: ["assistId"],
  });

/** Turns FormData into a plain object for zod. Every value is a string. */
export function formToObject(formData: FormData): Record<string, string> {
  const result: Record<string, string> = {};
  for (const [key, value] of formData.entries()) {
    if (typeof value === "string") result[key] = value;
  }
  return result;
}

/** Converts a zod failure into the shape forms display. */
export function fromZodError(error: z.ZodError): FormState {
  const flat = z.flattenError(error);
  return {
    error: flat.formErrors[0],
    fieldErrors: flat.fieldErrors as Record<string, string[] | undefined>,
  };
}
