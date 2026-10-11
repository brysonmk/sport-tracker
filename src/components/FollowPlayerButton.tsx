"use client";

import { isFollowingPlayer, readFollows, toggleFollowPlayer, writeFollows } from "@/lib/follows";
import { Button } from "./ui/Button";
import { useFollows } from "./useFollows";

/** Follow/unfollow a player; followed players' goals show in the home page feed. */
export function FollowPlayerButton({ slug, playerId, name }: { slug: string; playerId: string; name: string }) {
  const following = isFollowingPlayer(useFollows(), playerId);
  return (
    <Button
      type="button"
      variant={following ? "secondary" : "primary"}
      aria-pressed={following}
      onClick={() => writeFollows(toggleFollowPlayer(readFollows(), { slug, playerId, name }))}
    >
      {following ? "Following ✓" : "Follow"}
    </Button>
  );
}
