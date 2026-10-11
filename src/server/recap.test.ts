import Anthropic from "@anthropic-ai/sdk";
import { describe, expect, it, vi } from "vitest";
import { writeRecap } from "./recap";

const facts = { homeTeam: "Lions", awayTeam: "Tigers", finalScore: "Lions 1–0 Tigers", goals: [] };

/** A stand-in client whose beta.messages.create returns or throws what the test says. */
function stubClient(create: () => Promise<unknown>) {
  return { beta: { messages: { create: vi.fn(create) } } } as unknown as Pick<Anthropic, "beta">;
}

function response(stopReason: string, content: unknown[]) {
  return async () => ({ stop_reason: stopReason, content });
}

describe("writeRecap", () => {
  it("returns the text blocks joined and cleaned, ignoring thinking blocks", async () => {
    const client = stubClient(
      response("end_turn", [
        { type: "thinking", thinking: "" },
        { type: "text", text: "  The Lions won 1–0.  " },
      ]),
    );
    expect(await writeRecap(facts, client)).toEqual({ ok: true, text: "The Lions won 1–0." });
  });

  it("sends the model, the fallback setting and the facts", async () => {
    const client = stubClient(response("end_turn", [{ type: "text", text: "ok" }]));
    await writeRecap(facts, client);
    const params = vi.mocked(client.beta.messages.create).mock.calls[0][0];
    expect(params).toMatchObject({ model: "claude-opus-5-5", fallbacks: "default", betas: ["server-side-fallback-2026-07-01"] });
    expect(JSON.stringify(params.messages)).toContain("Lions 1–0 Tigers");
  });

  it.each([
    ["refusal", "couldn't be written"],
    ["max_tokens", "incomplete"],
  ])("reports a %s stop reason instead of showing partial text", async (stopReason, message) => {
    const result = await writeRecap(facts, stubClient(response(stopReason, [{ type: "text", text: "partial" }])));
    expect(result).toMatchObject({ ok: false });
    expect(!result.ok && result.error).toContain(message);
  });

  it("reports an empty answer", async () => {
    expect(await writeRecap(facts, stubClient(response("end_turn", [])))).toMatchObject({ ok: false });
  });

  it("turns API errors into readable messages", async () => {
    const rateLimited = stubClient(async () => {
      throw new Anthropic.RateLimitError(429, undefined, "rate limited", new Headers());
    });
    expect(await writeRecap(facts, rateLimited)).toEqual({
      ok: false,
      error: "Too many recap requests right now. Try again in a minute.",
    });
  });

  it("rethrows errors that aren't from the API (bugs should surface)", async () => {
    const broken = stubClient(async () => {
      throw new TypeError("bug");
    });
    await expect(writeRecap(facts, broken)).rejects.toThrow("bug");
  });
});
