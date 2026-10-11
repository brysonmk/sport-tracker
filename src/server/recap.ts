import "server-only";
import Anthropic from "@anthropic-ai/sdk";
import { cleanRecap, RECAP_SYSTEM_PROMPT, recapUserMessage, type RecapFacts } from "@/domain/recap";

/**
 * AI match recaps, written by Claude from a finished match's goal events.
 *
 * The whole feature (buttons and recap text) only appears when ANTHROPIC_API_KEY is set
 * in the environment. Without it, nothing calls the API and nothing about recaps is shown.
 */
export function recapsEnabled(): boolean {
  return Boolean(process.env.ANTHROPIC_API_KEY);
}

const MODEL = "claude-opus-5-5";

export type RecapResult = { ok: true; text: string } | { ok: false; error: string };

/** Only what writeRecap uses, so tests can pass a stub (src/server/recap.test.ts). */
type RecapClient = Pick<Anthropic, "beta">;

export async function writeRecap(
  facts: RecapFacts,
  // Reads ANTHROPIC_API_KEY from the environment; retries 429/5xx twice by default.
  client: RecapClient = new Anthropic(),
): Promise<RecapResult> {
  try {
    const response = await client.beta.messages.create(
      {
        model: MODEL,
        // Includes the model's (always-on) thinking; the recap itself is a few sentences.
        max_tokens: 4000,
        // A short factual summary doesn't need deep reasoning.
        output_config: { effort: "low" },
        // If the model declines for safety reasons, the API retries on a fallback model
        // inside the same call instead of failing.
        betas: ["server-side-fallback-2026-07-01"],
        fallbacks: "default",
        system: RECAP_SYSTEM_PROMPT,
        messages: [{ role: "user", content: recapUserMessage(facts) }],
      },
      { timeout: 60_000 },
    );

    if (response.stop_reason === "refusal") {
      return { ok: false, error: "The recap couldn't be written for this match." };
    }
    if (response.stop_reason === "max_tokens") {
      return { ok: false, error: "The recap came back incomplete. Please try again." };
    }
    const text = response.content
      .filter((block) => block.type === "text")
      .map((block) => block.text)
      .join("\n");
    if (!text.trim()) return { ok: false, error: "The recap came back empty. Please try again." };
    return { ok: true, text: cleanRecap(text) };
  } catch (error) {
    if (error instanceof Anthropic.AuthenticationError) {
      return { ok: false, error: "The AI recap key isn't valid. Check ANTHROPIC_API_KEY." };
    }
    if (error instanceof Anthropic.RateLimitError) {
      return { ok: false, error: "Too many recap requests right now. Try again in a minute." };
    }
    if (error instanceof Anthropic.APIError) {
      return { ok: false, error: "The recap service had a problem. Please try again." };
    }
    throw error;
  }
}
