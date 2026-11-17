import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { getCurrentUser, getFeedLanguage } from "@/lib/auth";
import { formatDateTime } from "@/lib/reminders";
import LanguageToggle from "@/components/LanguageToggle";
import { ActionsList, FailedBadge, SampleBadge } from "@/components/CircularBits";

export const dynamic = "force-dynamic";

export default async function FeedCircularPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await getCurrentUser();
  if (!user) redirect("/");
  if (user.role !== "PARENT") redirect("/teacher");

  const { id } = await params;
  const circular = await prisma.circular.findUnique({
    where: { id },
    include: { actions: { orderBy: { position: "asc" } } },
  });
  if (!circular) notFound();

  // Opening the simplified view is what the teacher's read-status shows.
  await prisma.readStatus.upsert({
    where: { circularId_parentId: { circularId: id, parentId: user.id } },
    create: { circularId: id, parentId: user.id },
    update: {},
  });

  const lang = await getFeedLanguage(user);
  const summary = lang === "hi" ? circular.summaryHi : circular.summaryEn;

  return (
    <div className="pt-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Link href="/feed" className="text-sm font-medium text-pine underline underline-offset-4">
          {lang === "hi" ? "← सभी परिपत्र" : "← All circulars"}
        </Link>
        <LanguageToggle current={lang} back={`/feed/${id}`} />
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-2">
        <h1 className="font-display text-3xl font-bold tracking-tight">
          {circular.title ?? (lang === "hi" ? "परिपत्र" : "Circular")}
        </h1>
        {circular.isSample && <SampleBadge />}
        {circular.extractionFailed && <FailedBadge />}
      </div>
      <p className="mt-1 text-sm text-ink-soft">{formatDateTime(circular.createdAt)}</p>

      <div className="mt-5">
        <ActionsList actions={circular.actions} lang={lang} />
      </div>

      {circular.extractionFailed ? (
        <p className="mt-5 leading-relaxed text-brick">
          {lang === "hi"
            ? "इस परिपत्र का सारांश तैयार नहीं हो सका। कृपया नीचे मूल परिपत्र पढ़ें।"
            : "A summary could not be prepared for this circular. Please read the original below."}
        </p>
      ) : (
        <p className="mt-5 max-w-prose text-lg leading-relaxed">{summary}</p>
      )}

      <h2 className="mt-10 font-display text-2xl font-bold tracking-tight">
        {lang === "hi" ? "मूल परिपत्र" : "Original circular"}
      </h2>
      <pre className="mt-3 whitespace-pre-wrap rounded-2xl border border-sand bg-surface p-5 font-sans text-[15px] leading-relaxed">
        {circular.originalText || "(No readable text.)"}
      </pre>
    </div>
  );
}
