import type { Metadata } from "next";
import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";
import "./globals.css";

export const metadata: Metadata = {
  title: "CircularSamajh — school circulars, understood",
  description:
    "CircularSamajh turns school circulars into plain summaries in English and Hindi, with action items and deadline reminders for parents.",
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();

  return (
    <html lang="en">
      <body>
        <header className="border-b border-sand bg-surface">
          <div className="mx-auto flex max-w-5xl flex-wrap items-center gap-x-6 gap-y-2 px-4 py-3 sm:px-6">
            <Link
              href="/"
              className="font-display text-xl font-bold tracking-tight text-pine-deep"
            >
              Circular<span className="text-marigold">Samajh</span>
            </Link>
            {user && (
              <nav className="flex items-center gap-4 text-sm font-medium">
                {user.role === "TEACHER" ? (
                  <Link href="/teacher" className="hover:text-pine">
                    Circulars
                  </Link>
                ) : (
                  <>
                    <Link href="/feed" className="hover:text-pine">
                      My feed
                    </Link>
                    <Link href="/reminders" className="hover:text-pine">
                      Reminders
                    </Link>
                  </>
                )}
                <Link href="/about" className="hover:text-pine">
                  About
                </Link>
              </nav>
            )}
            {user && (
              <div className="ml-auto flex items-center gap-3 text-sm">
                <span className="text-ink-soft">
                  {user.name} · {user.role === "TEACHER" ? "Teacher" : "Parent"}
                </span>
                <form action="/api/signout" method="post">
                  <button
                    type="submit"
                    className="rounded-full border border-sand px-3 py-1 font-medium hover:border-pine hover:text-pine"
                  >
                    Sign out
                  </button>
                </form>
              </div>
            )}
          </div>
        </header>
        <main className="mx-auto w-full max-w-5xl px-4 pb-16 sm:px-6">{children}</main>
        <footer className="border-t border-sand py-6">
          <p className="mx-auto max-w-5xl px-4 text-xs text-ink-soft sm:px-6">
            CircularSamajh — a working prototype built for Prasunex Innovathon
            2026, Round 3. Sample circulars are fictional and labelled as such.
          </p>
        </footer>
      </body>
    </html>
  );
}
