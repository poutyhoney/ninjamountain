export default function Mark({ ok, text }: { ok: boolean; text: string }) {
  return (
    <div className={ok ? "text-emerald-400" : "text-red-400"}>
      <span aria-hidden="true">{ok ? "✓" : "✗"}</span> {text}
      <span className="sr-only">{ok ? " (correct)" : " (wrong)"}</span>
    </div>
  );
}