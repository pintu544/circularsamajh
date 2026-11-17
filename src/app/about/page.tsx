import Link from "next/link";

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-3xl pt-10">
      <h1 className="font-display text-4xl font-bold tracking-tight">About CircularSamajh</h1>
      <p className="mt-4 text-lg leading-relaxed">
        Schools send circulars; parents receive them. The failure happens in
        between — in understanding them. A fee date buried in a formal English
        paragraph is missed, a consent form is discovered a day late, and the
        parents with the least slack pay the highest price for it.
      </p>
      <p className="mt-3 leading-relaxed">
        CircularSamajh is a comprehension layer on the parent&rsquo;s side. It
        needs nothing from the school — no new system, no integration. It starts
        from the circular exactly as the parent already received it.
      </p>

      <h2 className="mt-10 font-display text-2xl font-bold tracking-tight">How it works</h2>
      <ol className="mt-3 list-decimal space-y-2 pl-6 leading-relaxed">
        <li>
          <strong>Add the circular</strong> — a teacher adds it as a PDF, pasted
          text, or a photo of the paper notice.
        </li>
        <li>
          <strong>It is read and structured</strong> — the notice is summarised
          in plain English and plain Hindi, and its actions, deadlines, amounts
          and required documents are pulled out as data, not buried in prose.
        </li>
        <li>
          <strong>Parents act in time</strong> — the feed shows actions first,
          every deadline becomes a reminder, and the original circular stays
          one tap away so anything can be checked.
        </li>
        <li>
          <strong>Teachers can see it landed</strong> — a read-status view shows
          which parents have opened the simplified version, and when.
        </li>
      </ol>

      <h2 className="mt-10 font-display text-2xl font-bold tracking-tight">
        What this prototype cannot do yet — stated plainly
      </h2>
      <ul className="mt-3 list-disc space-y-2 pl-6 leading-relaxed">
        <li>
          <strong>Prototype sign-in.</strong> There are no real accounts or
          passwords. You pick a seeded teacher or parent on the home page. A
          production version would verify parents against the school&rsquo;s
          class list.
        </li>
        <li>
          <strong>Reminders live inside the app.</strong> There is no WhatsApp
          or push delivery yet, so a parent must open CircularSamajh to see
          them.
        </li>
        <li>
          <strong>A simpler database.</strong> This prototype stores its data in
          SQLite on the app host so it can run anywhere with no external
          services. The data model is unchanged from the production design,
          which uses PostgreSQL; moving over is a configuration change, not a
          rebuild.
        </li>
        <li>
          <strong>Photos must be legible.</strong> Clear photos of typed or
          printed notices are read well. Handwritten, blurred or heavily skewed
          photos are out of scope, and if a circular cannot be read, the app
          says so instead of guessing — the original is always shown.
        </li>
        <li>
          <strong>Two languages.</strong> English and Hindi today. The language
          layer is built so that adding another Indian language is one new
          entry, not a redesign.
        </li>
        <li>
          <strong>Sample data only.</strong> The circulars in this demo are
          fictional and labelled as samples. No real school, parent or child
          data is used.
        </li>
      </ul>

      <p className="mt-10">
        <Link href="/" className="font-medium text-pine underline underline-offset-4">
          ← Back to the demo
        </Link>
      </p>
    </div>
  );
}
