"use client";

import { useState } from "react";

type Mode = "text" | "pdf" | "photo";

const TABS: Array<{ id: Mode; label: string; hint: string }> = [
  { id: "text", label: "Paste text", hint: "Copy the circular text from a message or email." },
  { id: "pdf", label: "Upload PDF", hint: "The PDF exactly as the school sent it." },
  { id: "photo", label: "Upload photo", hint: "A clear photo of a printed notice. Typed or printed text works best." },
];

export default function UploadForm() {
  const [mode, setMode] = useState<Mode>("text");
  const [pending, setPending] = useState(false);

  return (
    <form
      action="/api/circulars"
      method="post"
      encType="multipart/form-data"
      onSubmit={() => setPending(true)}
      className="rounded-2xl border border-sand bg-surface p-5"
    >
      <input type="hidden" name="mode" value={mode} />
      <div className="flex flex-wrap gap-2" role="tablist" aria-label="How to add the circular">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            type="button"
            role="tab"
            aria-selected={mode === tab.id}
            onClick={() => setMode(tab.id)}
            className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
              mode === tab.id
                ? "bg-pine text-white"
                : "border border-sand bg-paper text-ink hover:border-pine"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>
      <p className="mt-3 text-sm text-ink-soft">{TABS.find((t) => t.id === mode)?.hint}</p>

      {mode === "text" && (
        <textarea
          name="text"
          required
          rows={9}
          placeholder={"Paste the full circular here — for example:\n\nDear Parents, the Term 2 fee of ₹8,450 is due by 14 November 2026…"}
          className="mt-3 w-full rounded-xl border border-sand bg-paper px-4 py-3 text-[15px] leading-relaxed placeholder:text-ink-soft/70"
        />
      )}
      {mode === "pdf" && (
        <input
          type="file"
          name="file"
          required
          accept="application/pdf,.pdf"
          className="mt-3 block w-full text-sm file:mr-3 file:rounded-full file:border-0 file:bg-pine-tint file:px-4 file:py-2 file:font-semibold file:text-pine-deep hover:file:bg-pine hover:file:text-white"
        />
      )}
      {mode === "photo" && (
        <input
          type="file"
          name="file"
          required
          accept="image/*"
          className="mt-3 block w-full text-sm file:mr-3 file:rounded-full file:border-0 file:bg-pine-tint file:px-4 file:py-2 file:font-semibold file:text-pine-deep hover:file:bg-pine hover:file:text-white"
        />
      )}

      <button
        type="submit"
        disabled={pending}
        className="mt-4 rounded-full bg-pine px-6 py-2.5 font-semibold text-white transition hover:bg-pine-deep disabled:cursor-wait disabled:opacity-60"
      >
        {pending ? "Reading and summarising… (up to a minute)" : "Add circular"}
      </button>
      <p className="mt-3 text-xs text-ink-soft">
        The circular is read, summarised in English and Hindi, and its actions,
        dates and amounts are pulled out automatically. Parents see it in their
        feed straight away.
      </p>
    </form>
  );
}
