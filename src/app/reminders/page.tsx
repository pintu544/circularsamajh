import Link from "next/link";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { getCurrentUser, getFeedLanguage } from "@/lib/auth";
import { groupReminders, formatIsoDate, type ReminderStatus } from "@/lib/reminders";

export const dynamic = "force-dynamic";

const SECTIONS: Array<{
  key: ReminderStatus;
  titleEn: string;
  titleHi: string;
  emptyEn: string;
  emptyHi: string;
  chipClass: string;
}> = [
  {
    key: "overdue",
    titleEn: "Overdue",
    titleHi: "तारीख निकल गई",
    emptyEn: "Nothing is overdue. Well done.",
    emptyHi: "कोई काम बाकी नहीं है। बहुत बढ़िया।",
    chipClass: "bg-brick-tint text-brick",
  },
  {
    key: "dueSoon",
    titleEn: "Due soon",
    titleHi: "जल्द ही",
    emptyEn: "Nothing is due in the next three days.",
    emptyHi: "अगले तीन दिनों में कुछ भी देय नहीं है।",
    chipClass: "bg-marigold-tint text-marigold",
  },
  {
    key: "upcoming",
    titleEn: "Upcoming",
    titleHi: "आगामी",
    emptyEn: "No later deadlines on record.",
    emptyHi: "आगे की कोई तारीख दर्ज नहीं है।",
    chipClass: "bg-pine-tint text-pine-deep",
  },
];

export default async function RemindersPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/");
  if (user.role !== "PARENT") redirect("/teacher");

  const lang = await getFeedLanguage(user);
  const reminders = await prisma.reminder.findMany({
    where: { parentId: user.id },
    include: { actionItem: true, circular: true },
    orderBy: { dueDate: "asc" },
  });
  const groups = groupReminders(reminders);

  return (
    <div className="pt-8">
      <h1 className="font-display text-3xl font-bold tracking-tight">
        {lang === "hi" ? "मेरी याद-दिहानी" : "My reminders"}
      </h1>
      <p className="mt-2 max-w-2xl leading-relaxed text-ink-soft">
        {lang === "hi"
          ? "हर परिपत्र से मिली तारीख़ें, अपने-आप यहाँ जुड़ जाती हैं।"
          : "Every date found in a circular is collected here automatically, so a deadline is not discovered a day late."}
      </p>

      <div className="mt-6 space-y-8">
        {SECTIONS.map((section) => {
          const items = groups[section.key];
          return (
            <section key={section.key}>
              <h2 className="flex items-center gap-2 font-display text-xl font-bold">
                <span className={`rounded-full px-2.5 py-0.5 text-xs font-sans font-semibold ${section.chipClass}`}>
                  <span className="tabular">{items.length}</span>
                </span>
                {lang === "hi" ? section.titleHi : section.titleEn}
              </h2>
              {items.length === 0 ? (
                <p className="mt-2 text-ink-soft">{lang === "hi" ? section.emptyHi : section.emptyEn}</p>
              ) : (
                <ul className="mt-3 divide-y divide-sand rounded-2xl border border-sand bg-surface">
                  {items.map((r) => (
                    <li key={r.id} className="flex flex-wrap items-baseline gap-x-3 gap-y-1 px-5 py-4">
                      <span className="font-medium">{r.actionItem.action}</span>
                      {r.actionItem.amount && (
                        <span className="text-sm font-semibold tabular">{r.actionItem.amount}</span>
                      )}
                      {r.actionItem.document && (
                        <span className="text-sm text-ink-soft">
                          {lang === "hi" ? "दस्तावेज़" : "Document"}: {r.actionItem.document}
                        </span>
                      )}
                      <span className="ml-auto flex items-baseline gap-3 text-sm">
                        <span className="tabular font-semibold">
                          {formatIsoDate(r.dueDate.toISOString().slice(0, 10))}
                        </span>
                        <Link
                          href={`/feed/${r.circularId}`}
                          className="font-medium text-pine underline underline-offset-4"
                        >
                          {r.circular.title ?? (lang === "hi" ? "परिपत्र" : "Circular")}
                        </Link>
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          );
        })}
      </div>
    </div>
  );
}
