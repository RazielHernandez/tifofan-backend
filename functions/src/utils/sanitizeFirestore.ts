/**
 * Recursively removes empty-string keys from objects
 * so the data can be safely stored in Firestore.
 *
 * @param {unknown} input Any JSON-compatible value.
 * @return {unknown} Sanitized value.
 */
export function sanitizeForFirestore(input: unknown): unknown {
  if (Array.isArray(input)) {
    return input.map(sanitizeForFirestore);
  }

  if (input !== null && typeof input === "object") {
    const result: Record<string, unknown> = {};

    for (const [key, value] of Object.entries(input)) {
      if (key === "") continue;
      result[key] = sanitizeForFirestore(value);
    }

    return result;
  }

  return input;
}
