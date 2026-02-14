// ═══════════════════════════════════════════════════════════════════════════════
// DYNAMIC SCHEMA BUILDER — Generates Zod schemas from form-config.ts
// ═══════════════════════════════════════════════════════════════════════════════

import { z, type ZodTypeAny } from "zod";
import {
  FORM_STEPS,
  type FieldConfig,
  type ArraySectionConfig,
  type StepConfig,
} from "./form-config";

// ── Build a Zod schema for a single field ────────────────────────────────────

function buildFieldSchema(field: FieldConfig): ZodTypeAny {
  const v = field.validation;
  const e = field.errorMessages ?? {};

  // Checkbox → boolean
  if (field.type === "checkbox") {
    return z.boolean().default(false);
  }

  // File → any optional
  if (field.type === "file") {
    return z.any().optional();
  }

  // All others → string-based
  let schema = z.string();

  if (v?.required) {
    schema = schema.min(1, e.required ?? `${field.label} is required`);
  }

  if (v?.minLength) {
    schema = schema.min(
      v.minLength,
      e.minLength ?? `${field.label} must be at least ${v.minLength} characters`
    );
  }

  if (v?.maxLength) {
    schema = schema.max(
      v.maxLength,
      e.maxLength ?? `${field.label} must be at most ${v.maxLength} characters`
    );
  }

  if (v?.pattern) {
    schema = schema.regex(
      new RegExp(v.pattern.value, v.pattern.flags),
      e.pattern ?? `${field.label} is invalid`
    );
  }

  if (v?.isEmail) {
    schema = schema.email(e.isEmail ?? "Please enter a valid email address");
  }

  // URL validation — allow empty string OR valid URL
  if (v?.isUrl && !v?.required) {
    return z
      .string()
      .url(e.isUrl ?? "Please enter a valid URL")
      .or(z.literal(""))
      .optional();
  }

  if (v?.isUrl && v?.required) {
    return z.string().url(e.isUrl ?? "Please enter a valid URL");
  }

  // If not required, make it optional (allow empty)
  if (!v?.required && !v?.minLength) {
    return schema.optional().or(z.literal(""));
  }

  return schema;
}

// ── Build schema for an array section ────────────────────────────────────────

function buildArraySectionSchema(section: ArraySectionConfig) {
  const shape: Record<string, ZodTypeAny> = {};
  for (const field of section.fields) {
    shape[field.name] = buildFieldSchema(field);
  }
  const itemSchema = z.object(shape);
  return z
    .array(itemSchema)
    .min(section.minItems, section.minItemsError);
}

// ── Build schema for a whole step ────────────────────────────────────────────

function buildStepSchema(step: StepConfig) {
  const shape: Record<string, ZodTypeAny> = {};

  for (const field of step.fields) {
    shape[field.name] = buildFieldSchema(field);
  }

  if (step.arraySections) {
    for (const section of step.arraySections) {
      shape[section.name] = buildArraySectionSchema(section);
    }
  }

  return z.object(shape);
}

// ── Exported schemas ─────────────────────────────────────────────────────────

/** Per-step Zod schemas, indexed by step index */
export const stepSchemas = FORM_STEPS.map((step) =>
  z.object({ [step.id]: buildStepSchema(step) })
);

/** Full combined schema for the entire form */
export const fullSchema = z.object(
  Object.fromEntries(
    FORM_STEPS.map((step) => [step.id, buildStepSchema(step)])
  )
);

/** TypeScript type derived from the full schema */
export type RegistrationFormData = z.infer<typeof fullSchema>;

// ── Default values builder ───────────────────────────────────────────────────

function buildFieldDefault(field: FieldConfig): unknown {
  if (field.type === "checkbox") return false;
  if (field.type === "file") return undefined;
  return "";
}

function buildStepDefaults(step: StepConfig): Record<string, unknown> {
  const defaults: Record<string, unknown> = {};

  for (const field of step.fields) {
    defaults[field.name] = buildFieldDefault(field);
  }

  if (step.arraySections) {
    for (const section of step.arraySections) {
      defaults[section.name] = [{ ...section.defaultItem }];
    }
  }

  return defaults;
}

/** Default values for the entire form, generated from config */
export const formDefaultValues: RegistrationFormData = Object.fromEntries(
  FORM_STEPS.map((step) => [step.id, buildStepDefaults(step)])
) as unknown as RegistrationFormData;
