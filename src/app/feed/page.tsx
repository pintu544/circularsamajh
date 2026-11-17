import Link from "next/link";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { getCurrentUser, getFeedLanguage } from "@/lib/auth";
import { formatDateTime } from "@/lib/reminders";
import LanguageToggle from "@/components/LanguageToggle";
import { ActionsList, FailedBadge, SampleBadge } from "@/components/CircularBits";

export const dynamic = "force-dynamic";

export default async function FeedPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/");
  if (user.role !== "PARENT") redirect("/teacher");

  const lang = await getFeedLanguage(user);
  const circulars = await prisma.circular.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      actions: { orderBy: { position: "asc" } },
      readStatus: { where: { parentId: user.id } },
    },
  });

  return (
    <div className="pt-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-display text-3xl font-bold tracking-tight">
          {lang === "hi" ? "स्कूल के परिपत्र" : "School circulars"}
        </h1>
        <LanguageToggle current={lang} back="/feed" />
      </div>
      <p className="mt-2 max-w-2xl leading-relaxed text-ink-soft">
        {lang === "hi"
          ? "हर परिपत्र आसान भाषा में, ज़रूरी काम और तारीख़ें सबसे ऊपर। मूल परिपत्र हमेशा नीचे उपलब्ध है।"
          : "Every circular in plain words, with what you need to do and by when pinned at the top. The original circular is always available below."}
      </p>

      {circulars.length === 0 ? (
        <p className="mt-8 rounded-2xl border border-sand bg-surface px-5 py-6 text-ink-soft">
          {lang === "hi"
            ? "अभी कोई परिपत्र नहीं है। शिक्षक के जोड़ते ही वे यहाँ दिखेंगे।"
            : "No circulars yet. They will appear here as soon as the teacher adds them."}
        </p>
      ) : (
        <div className="mt-6 space-y-4">
          {circulars.map((c) => {
            const read = c.readStatus.length > 0;
            const summary = lang === "hi" ? c.summaryHi : c.summaryEn;
            return (
              <article key={c.id} className="rounded-2xl border border-sand bg-surface p-5">
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="font-display text-xl font-bold leading-snug">
                    {c.title ??
                      (lang === "hi" ? "परिपत्र" : "Circular")}
                  </h2>
                  {c.isSample && <SampleBadge />}
                  {c.extractionFailed && <FailedBadge />}
                  {!read && (
                    <span className="rounded-full bg-pine px-2.5 py-0.5 text-xs font-semibold text-white">
                      {lang === "hi" ? "नया" : "New"}
                    </span>
                  )}
                  <span className="ml-auto text-xs text-ink-soft">{formatDateTime(c.createdAt)}</span>
                </div>

                <div className="mt-3">
                  <ActionsList actions={c.actions} lang={lang} />
                </div>

                {c.extractionFailed ? (
                  <p className="mt-3 leading-relaxed text-brick">
                    {lang === "hi"
                      ? "इस परिपत्र का सारांश तैयार नहीं हो सका। कृपया नीचे मूल परिपत्र पढ़ें।"
                      : "A summary could not be prepared for this circular. Please read the original below."}
                  </p>
                ) : (
                  <p className="mt-3 leading-relaxed">{summary}</p>
                )}

                <div className="mt-4 flex flex-wrap items-center gap-4">
                  <Link
                    href={`/feed/${c.id}`}
                    className="rounded-full bg-pine px-4 py-1.5 text-sm font-semibold text-white transition hover:bg-pine-deep"
                  >
                    {lang === "hi" ? "पूरा परिपत्र खोलें" : "Open the full circular"}
                  </Link>
                  <details>
                    <summary className="cursor-pointer text-sm font-medium text-pine underline underline-offset-4">
                      {lang === "hi" ? "मूल परिपत्र देखें" : "See the original circular"}
                    </summary>
                    <pre className="mt-3 whitespace-pre-wrap rounded-xl bg-paper p-4 font-sans text-sm leading-relaxed">
                      {c.originalText || "(No readable text.)"}
                    </pre>
                  </details>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}
