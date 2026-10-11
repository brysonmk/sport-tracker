"use server";

import { redirect } from "next/navigation";
import type { FormState } from "@/lib/formState";
import { createLeague } from "@/server/leagues";
import { formToObject, fromZodError, leagueNameSchema } from "@/server/schemas";

export async function createLeagueAction(_prev: FormState, formData: FormData): Promise<FormState> {
  const values = formToObject(formData);
  const parsed = leagueNameSchema.safeParse(values);
  if (!parsed.success) return { ...fromZodError(parsed.error), values };

  const { adminToken } = await createLeague(parsed.data.name);
  // redirect() works by throwing, so it must be outside any try/catch.
  redirect(`/a/${adminToken}?created=1`);
}
