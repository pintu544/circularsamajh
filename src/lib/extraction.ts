import { z } from "zod";

/**
 * The structured shape the language model must return for every circular.
 * Dates and amounts are data, not prose: the model copies them verbatim from
 * the circular text (dates normalised to ISO yyyy-mm-dd) and returns null for
 * anything that is not stated. Empty strings are coerced to null because
 * models occasionally emit "" instead of null for absent fields.
 */
const nullableText = z.preprocess(
  (v) => (typeof v === "string" && v.trim() === "" ? null : v),
  z.string().min(1).nullable(),
);

const nullableIsoDate = z.preprocess(
  (v) => (typeof v === "string" && v.trim() === "" ? null : v),
  z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "dueDate must be an ISO date (yyyy-mm-dd)")
    .nullable(),
);

export const ActionItemSchema = z.object({
  action: z.string().min(1),
  dueDate: nullableIsoDate,
  amount: nullableText,
  document: nullableText,
});

export const ExtractionSchema = z.object({
  title: z.string().min(1),
  summaryEn: z.string().min(1),
  summaryHi: z.string().min(1),
  actions: z.array(ActionItemSchema),
});

export type ExtractedAction = z.infer<typeof ActionItemSchema>;
export type Extraction = z.infer<typeof ExtractionSchema>;
