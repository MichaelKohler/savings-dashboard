/**
 * Converts Astro Action input error fields, which hold a list of messages per
 * field, into a single readable message per field.
 */
export function toFieldErrors<T extends string>(
  fields: Partial<Record<T, string[]>>
): Partial<Record<T, string>> {
  const errors: Partial<Record<T, string>> = {};

  for (const [field, messages] of Object.entries(fields) as [
    T,
    string[] | undefined,
  ][]) {
    if (messages?.length) {
      errors[field] = messages.join(". ");
    }
  }

  return errors;
}
