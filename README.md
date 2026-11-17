# CircularSamajh

CircularSamajh is a parent-side comprehension layer for school circulars. Schools send circulars as PDFs, typed messages, or photos of paper notices — delivery works, but comprehension fails: parents miss dates, amounts, and required actions buried in formal English paragraphs.

CircularSamajh takes the circular exactly as received and turns it into:

- a plain summary in **English and Hindi**,
- a structured action list — what to do, by when, how much to pay, which document to bring,
- **reminders** derived from every extracted deadline (overdue / due soon / upcoming),
- a **teacher read-status view** showing which parents have opened the simplified version.

The original circular is always stored verbatim and is one tap away from every summary. Built for **Prasunex Innovathon 2026, Round 3** (Prototype Development & Demonstration) by Team Tech Bro.

## How it works

1. A teacher adds a circular three ways: PDF upload, pasted text, or a photo of a printed notice (read by a vision model).
2. One structured language-model call (OpenAI `gpt-4o-mini` via FastRouter) returns validated JSON: title, plain English summary, plain Hindi summary, and actions with due dates, amounts, and documents copied verbatim from the text — never invented. Validation uses zod; one retry, then an honest "could not be summarised" state.
3. Parents read a feed in their preferred language with actions pinned; opening a circular records read status; deadlines appear on the reminders page.

Sign-in is deliberately prototype-grade: seeded demo accounts (one teacher, two parents) picked on the home page, no passwords — stated openly in the app, along with the other limitations (in-app reminders only, SQLite instead of PostgreSQL for the prototype, legible photos only).

## Run it locally

```bash
npm install
# .env.local needs:
#   DATABASE_URL="file:./dev.db"
#   FASTROUTER_API_KEY="<your FastRouter key>"
npx prisma generate   # if engines cannot download, see note below
npx prisma db push
npm run db:seed       # seeds users + 3 sample circulars through the real pipeline
npm run dev
```

Tests: `npm test` (zod validation + reminder derivation). Build: `npm run build`.

> **Note (restricted networks):** if `prisma generate` cannot download its engines, place `libquery_engine-<platform>.so.node` and `schema-engine-<platform>` in `node_modules/@prisma/engines/` from `https://binaries.prisma.sh/all_commits/<enginesVersion>/<platform>/` and set `PRISMA_QUERY_ENGINE_LIBRARY` / `PRISMA_SCHEMA_ENGINE_BINARY` to those paths when running `prisma generate`.

## Stack

Next.js (App Router) · TypeScript · Tailwind CSS · Prisma over SQLite (PostgreSQL-compatible schema) · unpdf for PDF text · FastRouter (`openai/gpt-4o-mini`) for OCR, extraction, simplification and translation.
