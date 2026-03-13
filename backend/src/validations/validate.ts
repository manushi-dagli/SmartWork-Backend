import type { z } from "zod";
import { BadRequestError } from "../common/errors.js";

/**
 * Validate request body against a Zod schema. Returns parsed value or throws BadRequestError with first error message.
 */
export function validateBody<T>(body: unknown, schema: z.ZodType<T>): T {
  const result = schema.safeParse(body);
  if (result.success) return result.data;
  const flattened = result.error.flatten();
  const fieldMessages = Object.values(flattened.fieldErrors).flat();
  const message =
    fieldMessages.length > 0
      ? String(fieldMessages[0])
      : flattened.formErrors[0] ?? result.error.errors[0]?.message ?? "Validation failed";
  throw new BadRequestError(message, "VALIDATION_ERROR");
}
