import type { NextRequest } from "next/server";
import { getFeed } from "@/server/feed";

const SLUG = /^[a-z0-9-]{1,60}$/;
const ID = /^[a-z0-9]{1,40}$/;

/**
 * GET /api/feed?leagues=slug1,slug2&players=id1,id2
 *
 * Used by the personal feed on the home page. Anything that doesn't look like a slug or
 * an id is dropped before it reaches the database.
 */
export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;
  const list = (name: string, shape: RegExp) =>
    (params.get(name) ?? "").split(",").filter((value) => shape.test(value));

  const feed = await getFeed(list("leagues", SLUG), list("players", ID));
  return Response.json(feed, { headers: { "Cache-Control": "no-store" } });
}
