import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { formatDateTime, formatIsoDate } from "@/lib/reminders";
import { ActionsList, FailedBadge, SampleBadge } from "@/components/CircularBits";

export const dynamic = "force-dynamic";

export default async function TeacherCircularPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await getCurrentUser();
  if (!user) redirect("/");
  if (user.role !== "TEACHER") redirect("/feed");

  const { id } = await params;
  const circular = await prisma.circular.findUnique({
    where: { id },
    include: { actions: { orderBy: { position: "asc" } } },
  });
  if (!circular) notFound();

  const parents = await prisma.user.findMany({
    where: { role: "PARENT" },
    orderBy: { name: "asc" },
    include: { readStatus: { where: { circularId: id } } },
  });

  return (
    <div className="pt-8">
      <Link href="/teacher" className="text-sm font-medium text-pine underline underline-offset-4">
        ← All circulars
      </Link>

      <div className="mt-4 flex flex-wrap items-center gap-2">
        <h1 className="font-display text-3xl font-bold tracking-tight">
          {circular.title ?? "Circular that could not be summarised"}
        </h1>
        {circular.isSample && <SampleBadge />}
        {circular.extractionFailed && <FailedBadge />}
      </div>
      <p className="mt-1 text-sm text-ink-soft">
        Added {formatDateTime(circular.createdAt)} · {circular.sourceType}
        {circular.originalFileName ? ` · ${circular.originalFileName}` : ""}
      </p>

      {circular.extractionFailed ? (
        <div className="mt-6 rounded-xl bg-brick-tint px-4 py-3 text-[15px] text-brick" role="alert">
          <strong>The summary could not be prepared for this circular.</strong>{" "}
          The automatic reading failed twice, so nothing has been invented in its
          place. Parents can still read the original text below. You may delete
          this entry by re-adding the circular once the text is clearer.
        </div>
      ) : (
        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <section className="rounded-2xl border border-sand bg-surface p-5">
            <h2 className="text-xs font-bold uppercase tracking-wide text-ink-soft">
              Plain summary — English
            </h2>
            <p className="mt-2 leading-relaxed">{circular.summaryEn}</p>
          </section>
          <section className="rounded-2xl border border-sand bg-surface p-5">
            <h2 className="text-xs font-bold uppercase tracking-wide text-ink-soft">
              Plain summary — Hindi
            </h2>
            <p className="mt-2 leading-relaxed">{circular.summaryHi}</p>
          </section>
        </div>
      )}

      {!circular.extractionFailed && circular.actions.length > 0 && (
        <div className="mt-4">
          <ActionsList actions={circular.actions} lang="en" />
        </div>
      )}

      <h2 className="mt-10 font-display text-2xl font-bold tracking-tight">Who has read it</h2>
      <div className="mt-3 overflow-hidden rounded-2xl border border-sand bg-surface">
        <table className="w-full text-left text-[15px]">
          <thead>
            <tr className="border-b border-sand bg-paper text-sm text-ink-soft">
              <th className="px-5 py-3 font-semibold">Parent</th>
              <th className="px-5 py-3 font-semibold">Status</th>
              <th className="px-5 py-3 font-semibold">Opened at</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-sand">
            {parents.map((p) => {
              const rs = p.readStatus[0];
              return (
                <tr key={p.id}>
                  <td className="px-5 py-3 font-medium">{p.name}</td>
                  <td className="px-5 py-3">
                    {rs ? (
                      <span className="rounded-full bg-pine-tint px-2.5 py-0.5 text-xs font-semibold text-pine-deep">
                        Read
                      </span>
                    ) : (
                      <span className="rounded-full bg-sand-soft px-2.5 py-0.5 text-xs font-semibold text-ink-soft">
                        Not opened yet
                      </span>
                    )}
                  </td>
                  <td className="px-5 py-3 tabular text-ink-soft">
                    {rs ? formatDateTime(rs.openedAt) : "—"}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <h2 className="mt-10 font-display text-2xl font-bold tracking-tight">Original circular</h2>
      <p className="mt-1 text-sm text-ink-soft">
        Stored exactly as received
        {circular.actions.some((a) => a.dueDate)
          ? `; deadlines found: ${circular.actions
              .filter((a) => a.dueDate)
              .map((a) => formatIsoDate(a.dueDate as string))
              .join(", ")}`
          : ""}
        .
      </p>
      <pre className="mt-3 whitespace-pre-wrap rounded-2xl border border-sand bg-surface p-5 font-sans text-[15px] leading-relaxed">
        {circular.originalText || "(No readable text could be extracted from the uploaded file.)"}
      </pre>
    </div>
  );
}
