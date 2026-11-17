export default function LanguageToggle({
  current,
  back,
}: {
  current: "en" | "hi";
  back: string;
}) {
  const options: Array<{ id: "en" | "hi"; label: string }> = [
    { id: "en", label: "English" },
    { id: "hi", label: "हिन्दी" },
  ];
  return (
    <div className="flex items-center gap-1 rounded-full border border-sand bg-surface p-1" aria-label="Feed language">
      {options.map((opt) =>
        opt.id === current ? (
          <span
            key={opt.id}
            className="rounded-full bg-pine px-3.5 py-1 text-sm font-semibold text-white"
            aria-current="true"
          >
            {opt.label}
          </span>
        ) : (
          <form key={opt.id} action="/api/language" method="post">
            <input type="hidden" name="lang" value={opt.id} />
            <input type="hidden" name="back" value={back} />
            <button
              type="submit"
              className="rounded-full px-3.5 py-1 text-sm font-semibold text-ink-soft transition hover:text-pine"
            >
              {opt.label}
            </button>
          </form>
        ),
      )}
    </div>
  );
}
