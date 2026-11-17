import { formatIsoDate, reminderStatus } from "@/lib/reminders";

export function SampleBadge() {
  return (
    <span className="rounded-full bg-marigold-tint px-2.5 py-0.5 text-xs font-semibold text-marigold">
      Sample circular
    </span>
  );
}

export function FailedBadge() {
  return (
    <span className="rounded-full bg-brick-tint px-2.5 py-0.5 text-xs font-semibold text-brick">
      Could not be summarised
    </span>
  );
}

export function DueChip({ iso, lang }: { iso: string; lang: "en" | "hi" }) {
  const status = reminderStatus(new Date(`${iso}T00:00:00Z`));
  const styles =
    status === "overdue"
      ? "bg-brick-tint text-brick"
      : status === "dueSoon"
        ? "bg-marigold-tint text-marigold"
        : "bg-pine-tint text-pine-deep";
  const label =
    status === "overdue"
      ? lang === "hi"
        ? "तारीख निकल गई"
        : "Overdue"
      : status === "dueSoon"
        ? lang === "hi"
          ? "जल्द ही"
          : "Due soon"
        : lang === "hi"
          ? "आगामी"
          : "Upcoming";
  return (
    <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${styles}`}>
      {label} · <span className="tabular">{formatIsoDate(iso)}</span>
    </span>
  );
}

export interface ActionView {
  id: string;
  action: string;
  dueDate: string | null;
  amount: string | null;
  document: string | null;
}

export function ActionsList({
  actions,
  lang,
}: {
  actions: ActionView[];
  lang: "en" | "hi";
}) {
  if (actions.length === 0) return null;
  return (
    <div className="rounded-xl bg-sand-soft px-4 py-3">
      <h3 className="text-xs font-bold uppercase tracking-wide text-ink-soft">
        {lang === "hi" ? "आपको क्या करना है" : "What you need to do"}
      </h3>
      <ul className="mt-2 space-y-2.5">
        {actions.map((a) => (
          <li key={a.id} className="text-[15px] leading-snug">
            <span className="font-medium">{a.action}</span>
            <span className="mt-1 flex flex-wrap items-center gap-1.5">
              {a.dueDate && <DueChip iso={a.dueDate} lang={lang} />}
              {a.amount && (
                <span className="rounded-full bg-surface px-2.5 py-0.5 text-xs font-semibold">
                  {lang === "hi" ? "राशि" : "Amount"}: <span className="tabular">{a.amount}</span>
                </span>
              )}
              {a.document && (
                <span className="rounded-full bg-surface px-2.5 py-0.5 text-xs font-semibold">
                  {lang === "hi" ? "दस्तावेज़" : "Document"}: {a.document}
                </span>
              )}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
