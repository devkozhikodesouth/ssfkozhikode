import { z } from "zod";

/* Shared constants + zod schemas for the Muta'allim Sammelanam (Mukkam) forms.
 * The same schemas run in the browser and on the server. */

export const CATEGORIES = ["Muthavval", "Mahalli", "Fathul mueen", "Others"] as const;
export type Category = (typeof CATEGORIES)[number];

export const EVENT_NAME = "Muta'allim Sammelanam";
/* Event start (time not specified in the design: start of the day, IST) */
export const EVENT_DATE = "2026-11-25T00:00:00+05:30";

/* Normalise to a 10-digit Indian mobile; null when invalid.
 * Accepts spaces/dashes and an optional +91 / 91 / 0 prefix. */
export function normalizePhone(input: string): string | null {
  let s = String(input || "").replace(/[\s\-()]/g, "");
  if (s.startsWith("+91")) s = s.slice(3);
  else if (/^91\d{10}$/.test(s)) s = s.slice(2);
  else if (/^0\d{10}$/.test(s)) s = s.slice(1);
  return /^[6-9]\d{9}$/.test(s) ? s : null;
}

const OBJECT_ID = /^[a-f\d]{24}$/i;

export const phoneSchema = z
  .string({ error: "Please enter your mobile number." })
  .trim()
  .min(1, "Please enter your mobile number.")
  .refine((v) => !v || normalizePhone(v) !== null, "Enter a valid 10-digit Indian mobile number (starts with 6–9).")
  .transform((v) => normalizePhone(v) ?? v);

export const registrationSchema = z.object({
  divisionId: z.string({ error: "Please select your division." }).regex(OBJECT_ID, "Please select your division."),
  campusId: z.string({ error: "Please select your campus." }).regex(OBJECT_ID, "Please select your campus."),
  name: z.string({ error: "Please enter your name." }).trim().min(1, "Please enter your name.").max(100, "Name is too long."),
  place: z.string({ error: "Please enter your place." }).trim().min(1, "Please enter your place.").max(100, "Place is too long."),
  phone: phoneSchema,
  category: z.enum(CATEGORIES, { error: "Please select a category." }),
});

export const campusNameSchema = z
  .string({ error: "Campus name is required" })
  .trim()
  .min(1, "Campus name is required")
  .max(100, "Campus name is too long");

export const lookupSchema = z.object({ phone: phoneSchema });

/* Admin: campus management */
export const campusCreateSchema = z.object({
  divisionId: z.string().regex(OBJECT_ID, "Invalid division"),
  name: z.string().trim().min(1, "Campus name is required").max(100, "Campus name is too long"),
});
export const campusUpdateSchema = z
  .object({
    name: z.string().trim().min(1, "Campus name is required").max(100, "Campus name is too long").optional(),
    isActive: z.boolean().optional(),
    sortOrder: z.number().int().optional(),
  })
  .refine((v) => Object.keys(v).length > 0, { message: "Nothing to update" });

export type RegistrationInput = z.input<typeof registrationSchema>;

/* field -> first message, from a failed zod parse */
export function fieldErrors(error: z.ZodError): Record<string, string> {
  const out: Record<string, string> = {};
  for (const issue of error.issues) {
    const key = String(issue.path[0] ?? "form");
    if (!out[key]) out[key] = issue.message;
  }
  return out;
}

/* Same schema on client and server. Returns normalised data or per-field errors. */
export function parseRegistration(v: Record<string, unknown>) {
  const r = registrationSchema.safeParse(v);
  return r.success
    ? ({ ok: true, data: r.data } as const)
    : ({ ok: false, errors: fieldErrors(r.error) } as const);
}

export const validateRegistration = (v: Record<string, unknown>): Record<string, string> => {
  const r = parseRegistration(v);
  return r.ok ? {} : r.errors;
};

/* What the public ticket needs — nothing more (no phone, no place) */
export type TicketData = {
  registrationCode: string;
  name: string;
  division: string;
  campus: string;
  category: string;
};
