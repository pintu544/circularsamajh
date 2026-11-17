import { extractText, getDocumentProxy } from "unpdf";
import { prisma } from "./db";
import { ExtractionSchema, type Extraction } from "./extraction";

/**
 * The language pipeline: text acquisition (PDF / paste / photo OCR), one
 * structured extraction call, zod validation with a single retry, and
 * persistence of the circular + action items + derived reminders in one
 * transaction. On a second validation failure the circular is still saved —
 * original text only, flagged `extractionFailed` — never a fake success.
 */

const MODEL = "openai/gpt-4o-mini";
const BASE_URL = "https://api.fastrouter.ai/api/v1";

function apiKey(): string {
  const key = process.env.FASTROUTER_API_KEY;
  if (!key) throw new Error("FASTROUTER_API_KEY is not set");
  return key;
}

type ChatMessage =
  | { role: "system" | "user"; content: string }
  | {
      role: "user";
      content: Array<
        | { type: "text"; text: string }
        | { type: "image_url"; image_url: { url: string } }
      >;
    };

async function chat(messages: ChatMessage[], jsonMode = false): Promise<string> {
  const res = await fetch(`${BASE_URL}/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey()}`,
    },
    body: JSON.stringify({
      model: MODEL,
      messages,
      temperature: 0.1,
      ...(jsonMode ? { response_format: { type: "json_object" } } : {}),
    }),
  });
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`FastRouter request failed (${res.status}): ${body.slice(0, 300)}`);
  }
  const data = (await res.json()) as {
    choices?: Array<{ message?: { content?: string } }>;
  };
  const content = data.choices?.[0]?.message?.content;
  if (!content) throw new Error("FastRouter returned an empty response");
  return content;
}

export async function extractPdfText(buffer: Uint8Array): Promise<string> {
  const pdf = await getDocumentProxy(buffer);
  const { text } = await extractText(pdf, { mergePages: true });
  return (Array.isArray(text) ? text.join("\n") : text).trim();
}

export async function ocrImage(imageBase64: string, mimeType: string): Promise<string> {
  const content = await chat([
    {
      role: "user",
      content: [
        {
          type: "text",
          text: "Transcribe all of the text in this photograph of a school circular, exactly as written, including dates, amounts and names. Output only the transcription, with no commentary.",
        },
        { type: "image_url", image_url: { url: `data:${mimeType};base64,${imageBase64}` } },
      ],
    },
  ]);
  return content.trim();
}

const EXTRACTION_SYSTEM = `You read school circulars and return structured data for parents.
Return ONLY a JSON object with exactly these keys:
{
  "title": short plain title for the circular,
  "summaryEn": a plain, simple English summary in 2-4 short sentences that a parent with limited English can understand,
  "summaryHi": the same summary in simple Hindi written in Devanagari script,
  "actions": a list of things the parent must do, each an object:
    { "action": short instruction in simple English,
      "dueDate": the deadline for that action as an ISO date "yyyy-mm-dd" if the circular states one, otherwise null,
      "amount": the exact amount as written in the circular (for example "₹8,450") if the parent must pay it, otherwise null,
      "document": the name of any document or form the parent must submit, sign or bring, otherwise null }
}
Copy dates and amounts from the circular text; never invent a date, amount or document that is not stated. If the circular asks for nothing, return an empty actions list.`;

export async function extractStructured(circularText: string): Promise<Extraction> {
  const messages: ChatMessage[] = [
    { role: "system", content: EXTRACTION_SYSTEM },
    { role: "user", content: circularText },
  ];

  let lastError = "";
  for (let attempt = 0; attempt < 2; attempt++) {
    const raw = await chat(messages, true);
    try {
      const parsed: unknown = JSON.parse(raw);
      return ExtractionSchema.parse(parsed);
    } catch (err) {
      lastError = err instanceof Error ? err.message : String(err);
      if (attempt === 0) {
        messages.push({
          role: "user",
          content: `Your previous reply was not valid for the required schema: ${lastError}. Reply again with ONLY the JSON object, exactly matching the schema.`,
        });
      }
    }
  }
  throw new Error(`Extraction failed validation twice: ${lastError}`);
}

export interface NewCircularInput {
  sourceType: "PDF" | "TEXT" | "PHOTO";
  createdById: string;
  originalText?: string;
  fileBuffer?: Uint8Array;
  originalFileName?: string | null;
  imageBase64?: string;
  imageMimeType?: string;
  isSample?: boolean;
}

/**
 * Acquires the circular text, runs the extraction, and persists everything.
 * Returns the saved circular's id. Extraction failure is persisted as an
 * honest failed state rather than thrown, so the teacher can see it.
 */
export async function processCircular(input: NewCircularInput): Promise<string> {
  let text = input.originalText ?? "";
  if (input.sourceType === "PDF" && input.fileBuffer) {
    text = await extractPdfText(input.fileBuffer);
  } else if (input.sourceType === "PHOTO" && input.imageBase64 && input.imageMimeType) {
    text = await ocrImage(input.imageBase64, input.imageMimeType);
  }
  text = text.trim();

  let extraction: Extraction | null = null;
  if (text.length >= 20) {
    try {
      extraction = await extractStructured(text);
    } catch {
      extraction = null;
    }
  }

  const parents = await prisma.user.findMany({
    where: { role: "PARENT" },
    select: { id: true },
  });

  const circular = await prisma.$transaction(async (tx) => {
    const created = await tx.circular.create({
      data: {
        title: extraction?.title ?? null,
        originalText: text,
        sourceType: input.sourceType,
        originalFileName: input.originalFileName ?? null,
        summaryEn: extraction?.summaryEn ?? null,
        summaryHi: extraction?.summaryHi ?? null,
        extractionFailed: extraction === null,
        isSample: input.isSample ?? false,
        createdById: input.createdById,
      },
    });

    if (extraction) {
      for (const [i, a] of extraction.actions.entries()) {
        const item = await tx.actionItem.create({
          data: {
            circularId: created.id,
            action: a.action,
            dueDate: a.dueDate,
            amount: a.amount,
            document: a.document,
            position: i,
          },
        });
        if (a.dueDate) {
          await tx.reminder.createMany({
            data: parents.map((p) => ({
              circularId: created.id,
              actionItemId: item.id,
              parentId: p.id,
              dueDate: new Date(`${a.dueDate}T00:00:00Z`),
            })),
          });
        }
      }
    }
    return created;
  });

  return circular.id;
}
