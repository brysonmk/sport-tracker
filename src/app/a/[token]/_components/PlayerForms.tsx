"use client";

import { useActionState } from "react";
import { Field, FormError, Input, Select } from "@/components/ui/Field";
import { SubmitButton } from "@/components/ui/SubmitButton";
import { initialFormState } from "@/lib/formState";
import { addPlayer, updatePlayer } from "../actions";

type Team = { id: string; name: string };

function TeamOptions({ teams }: { teams: Team[] }) {
  return (
    <>
      <option value="">No team (free agent)</option>
      {teams.map((t) => (
        <option key={t.id} value={t.id}>
          {t.name}
        </option>
      ))}
    </>
  );
}

export function AddPlayerForm({ token, teams }: { token: string; teams: Team[] }) {
  const [state, formAction] = useActionState(addPlayer.bind(null, token), initialFormState);
  // After a save, keep the team that was just used so several players can be added in a row.
  const defaultTeamId = state.values?.teamId ?? teams[0]?.id ?? "";
  return (
    <form action={formAction} className="flex flex-col gap-3" noValidate>
      <div className="grid gap-3 sm:grid-cols-2">
        <Field label="Player name" name="player-name" errors={state.fieldErrors?.name}>
          {(a11y) => <Input {...a11y} name="name" defaultValue={state.values?.name} maxLength={40} autoComplete="off" />}
        </Field>
        {/* key: defaultValue only applies on mount, so re-mount the select when it changes */}
        <Field label="Team" name="player-team" errors={state.fieldErrors?.teamId}>
          {(a11y) => (
            <Select key={defaultTeamId} {...a11y} name="teamId" defaultValue={defaultTeamId}>
              <TeamOptions teams={teams} />
            </Select>
          )}
        </Field>
      </div>
      <FormError message={state.error} />
      <SubmitButton pendingText="Adding…">Add player</SubmitButton>
    </form>
  );
}

export function EditPlayerForm({
  token,
  player,
  teams,
}: {
  token: string;
  player: { id: string; name: string; teamId: string | null };
  teams: Team[];
}) {
  const [state, formAction] = useActionState(updatePlayer.bind(null, token, player.id), initialFormState);
  return (
    <form action={formAction} className="flex flex-col gap-3" noValidate>
      <div className="grid gap-3 sm:grid-cols-2">
        <Field label={<>Name<span className="sr-only"> of {player.name}</span></>} name={`player-${player.id}-name`} errors={state.fieldErrors?.name}>
          {(a11y) => <Input {...a11y} name="name" defaultValue={state.values?.name ?? player.name} maxLength={40} />}
        </Field>
        <Field label={<>Team<span className="sr-only"> of {player.name}</span></>} name={`player-${player.id}-team`} errors={state.fieldErrors?.teamId}>
          {(a11y) => (
            <Select key={state.values?.teamId} {...a11y} name="teamId" defaultValue={state.values?.teamId ?? player.teamId ?? ""}>
              <TeamOptions teams={teams} />
            </Select>
          )}
        </Field>
      </div>
      <FormError message={state.error} />
      <SubmitButton variant="secondary" aria-label={`Save ${player.name}`}>
        Save
      </SubmitButton>
    </form>
  );
}
