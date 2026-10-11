"use client";

import { useActionState, useState } from "react";
import { Field, FormError, Input, Select } from "@/components/ui/Field";
import { SubmitButton } from "@/components/ui/SubmitButton";
import { initialFormState } from "@/lib/formState";
import { addGoal } from "../actions";

type Team = { id: string; name: string };
type Player = { id: string; name: string; teamId: string | null };

/**
 * Records one goal. Pick the team first; the scorer and assist lists then show that
 * team's players first and everyone else under "Other players" (in pickup games people
 * sometimes play for another side).
 */
export function GoalForm({
  token,
  matchId,
  home,
  away,
  players,
}: {
  token: string;
  matchId: string;
  home: Team;
  away: Team;
  players: Player[];
}) {
  const [state, formAction] = useActionState(addGoal.bind(null, token, matchId), initialFormState);
  const [teamId, setTeamId] = useState(home.id);

  const ownPlayers = players.filter((p) => p.teamId === teamId);
  const otherPlayers = players.filter((p) => p.teamId !== teamId);
  const playerOptions = (
    <>
      {ownPlayers.map((p) => (
        <option key={p.id} value={p.id}>
          {p.name}
        </option>
      ))}
      {otherPlayers.length > 0 && (
        <optgroup label="Other players">
          {otherPlayers.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </optgroup>
      )}
    </>
  );

  return (
    <form action={formAction} className="flex flex-col gap-4" noValidate>
      <fieldset>
        <legend className="mb-1 text-sm font-medium">Goal for</legend>
        <div className="grid grid-cols-2 gap-2">
          {[home, away].map((team) => (
            <label
              key={team.id}
              className="flex min-h-11 cursor-pointer items-center justify-center rounded-lg border border-line px-3 text-center text-sm font-medium has-checked:border-accent has-checked:bg-accent-soft has-focus-visible:outline-2 has-focus-visible:outline-accent"
            >
              <input
                type="radio"
                name="teamId"
                value={team.id}
                checked={teamId === team.id}
                onChange={() => setTeamId(team.id)}
                className="sr-only"
              />
              {team.name}
            </label>
          ))}
        </div>
        {state.fieldErrors?.teamId && <p className="mt-1 text-sm text-danger">{state.fieldErrors.teamId[0]}</p>}
      </fieldset>

      {/* key={teamId}: when the team changes, reset the player pickers to "unknown". */}
      <div key={teamId} className="grid gap-3 sm:grid-cols-[1fr_1fr_6rem]">
        <Field label="Scorer" name="scorerId" errors={state.fieldErrors?.scorerId}>
          {(a11y) => (
            <Select {...a11y} name="scorerId" defaultValue="">
              <option value="">Unknown / own goal</option>
              {playerOptions}
            </Select>
          )}
        </Field>
        <Field label="Assist" name="assistId" errors={state.fieldErrors?.assistId}>
          {(a11y) => (
            <Select {...a11y} name="assistId" defaultValue="">
              <option value="">No assist</option>
              {playerOptions}
            </Select>
          )}
        </Field>
        <Field label="Minute" name="minute" errors={state.fieldErrors?.minute}>
          {(a11y) => <Input {...a11y} name="minute" inputMode="numeric" pattern="[0-9]*" placeholder="–" />}
        </Field>
      </div>
      <FormError message={state.error} />
      <SubmitButton pendingText="Adding…">Add goal</SubmitButton>
    </form>
  );
}
