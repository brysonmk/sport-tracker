/** The AI-written match recap, clearly labelled as such. */
export function RecapCard({ recap }: { recap: string }) {
  return (
    <div className="rounded-xl border border-line bg-card p-4">
      <p className="whitespace-pre-line leading-relaxed">{recap}</p>
      <p className="mt-2 text-xs text-muted">Written by AI from the recorded goals. Check the goal list for the details.</p>
    </div>
  );
}
