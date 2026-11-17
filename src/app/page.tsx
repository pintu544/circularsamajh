import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function SignInPage() {
  const current = await getCurrentUser();
  if (current) {
    redirect(current.role === "TEACHER" ? "/teacher" : "/feed");
  }

  const users = await prisma.user.findMany({ orderBy: { name: "asc" } });
  const teacher = users.find((u) => u.role === "TEACHER");
  const parents = users.filter((u) => u.role === "PARENT");

  return (
    <div className="mx-auto max-w-2xl pt-10">
      <h1 className="font-display text-4xl font-bold leading-tight tracking-tight">
        School circulars, in words every parent understands.
      </h1>
      <p className="mt-4 text-lg leading-relaxed text-ink-soft">
        CircularSamajh takes a school circular exactly as it was sent — a PDF,
        pasted text, or a photo of the paper notice — and turns it into a plain
        summary in English or Hindi, with the actions, dates and amounts pulled
        out and set as reminders. The original circular is always one tap away.
      </p>

      <h2 className="mt-10 font-display text-xl font-bold">Continue to the demo</h2>
      <p className="mt-1 text-sm text-ink-soft">
        This prototype uses seeded demo accounts — no passwords. Pick who you
        are to see the app from their side.
      </p>

      <div className="mt-5 space-y-3">
        {teacher && (
          <form action="/api/signin" method="post">
            <input type="hidden" name="userId" value={teacher.id} />
            <button
              type="submit"
              className="flex w-full items-center justify-between rounded-2xl border border-sand bg-surface px-5 py-4 text-left transition hover:border-pine"
            >
              <span>
                <span className="block font-semibold">{teacher.name}</span>
                <span className="block text-sm text-ink-soft">
                  Teacher — adds circulars and sees who has read them
                </span>
              </span>
              <span className="rounded-full bg-pine px-4 py-1.5 text-sm font-semibold text-white">
                Continue
              </span>
            </button>
          </form>
        )}
        {parents.map((p) => (
          <form key={p.id} action="/api/signin" method="post">
            <input type="hidden" name="userId" value={p.id} />
            <button
              type="submit"
              className="flex w-full items-center justify-between rounded-2xl border border-sand bg-surface px-5 py-4 text-left transition hover:border-pine"
            >
              <span>
                <span className="block font-semibold">{p.name}</span>
                <span className="block text-sm text-ink-soft">
                  Parent — reads the feed in {p.language === "hi" ? "Hindi" : "English"}
                </span>
              </span>
              <span className="rounded-full bg-pine px-4 py-1.5 text-sm font-semibold text-white">
                Continue
              </span>
            </button>
          </form>
        ))}
      </div>

      <p className="mt-8 text-sm text-ink-soft">
        New here? Read{" "}
        <a href="/about" className="font-medium text-pine underline underline-offset-4">
          how CircularSamajh works and what this prototype cannot do yet
        </a>
        .
      </p>
    </div>
  );
}
