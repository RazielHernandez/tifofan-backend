/* -------------------------------------------------------------------------- */
/*                                   Helpers                                  */
/* -------------------------------------------------------------------------- */

/**
 * Safely extracts a single query parameter as a string.
 *
 * @param {unknown} value Query parameter value.
 * @return {string | undefined} Normalized string or undefined.
 */
export function getQueryParam(value: unknown): string | undefined {
  if (typeof value === "string") {
    return value;
  }
  if (Array.isArray(value) && typeof value[0] === "string") return value[0];
  return undefined;
}

/**
 * Safely extracts a query parameter as a number.
 *
 * @param {unknown} value Query parameter value.
 * @return {number | undefined} Parsed number or undefined.
 */
export function getQueryNumber(value: unknown): number | undefined {
  const str = getQueryParam(value);
  if (!str) return undefined;

  const num = Number(str);
  return Number.isFinite(num) ? num : undefined;
}
