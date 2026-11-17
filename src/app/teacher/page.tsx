import Link from "next/link";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { formatDateTime } from "@/lib/reminders";
import UploadForm from "@/components/UploadForm";
import { FailedBadge, SampleBadge } from "@/components/CircularBits";

export const dynamic = "force-dynamic";

export default async function TeacherPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const user = await getCurrentUser();
  if (!user) redirect("/");
  if (user.role !== "TEACHER") redirect("/feed");

  const { error } = await searchParams;

  const [circulars, parentCount] = await Promise.all([
    prisma.circular.findMany({
      orderBy: { createdAt: "desc" },
      include: { _count: { select: { readStatus: true, actions: true } } },
    }),
    prisma.user.count({ where: { role: "PARENT" } }),
  ]);

  return (
    <div className="pt-8">
      <h1 className="font-display text-3xl font-bold tracking-tight">Add a circular</h1>
      <p className="mt-2 max-w-2xl leading-relaxed text-ink-soft">
        Add the circular exactly as the school sent it. Parents will see a plain
        summary in their own language, with actions and deadlines pulled out —
        you do not need to rewrite anything.
      </p>

      {error && (
        <div className="mt-5 rounded-xl bg-brick-tint px-4 py-3 text-[15px] text-brick" role="alert">
          <strong>That circular could not be added.</strong> {error} Please check
          the file or text and try again.
        </div>
      )}

      <div className="mt-5">
        <UploadForm />
      </div>

      <h2 className="mt-10 font-display text-2xl font-bold tracking-tight">Circulars added</h2>
      {circulars.length === 0 ? (
        <p className="mt-3 text-ink-soft">No circulars yet. Add the first one above.</p>
      ) : (
        <ul className="mt-4 divide-y divide-sand rounded-2xl border border-sand bg-surface">
          {circulars.map((c) => (
            <li key={c.id}>
              <Link
                href={`/teacher/circulars/${c.id}`}
                className="flex flex-wrap items-center gap-x-3 gap-y-1 px-5 py-4 transition hover:bg-paper"
              >
                <span className="font-semibold">
                  {c.title ?? "Circular that could not be summarised"}
                </span>
                {c.isSample && <SampleBadge />}
                {c.extractionFailed && <FailedBadge />}
                <span className="ml-auto text-sm text-ink-soft">
                  {c.sourceType} · {formatDateTime(c.createdAt)} · read by{" "}
                  <span className="tabular">
                    {c._count.readStatus} of {parentCount}
                  </span>{" "}
                  parents
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
