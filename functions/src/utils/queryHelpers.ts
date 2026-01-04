/* -------------------------------------------------------------------------- */
/*                                   Helpers                                  */
/* -------------------------------------------------------------------------- */

import {ApiError} from "./apiError";

/**
 * Safely extracts and validates a query parameter as a positive number.
 *
 * @param {unknown} value Query parameter value.
 * @param {string} name Parameter name for error messages.
 * @return {number} Validated positive number.
 * @throws {ApiError} If value is not a positive integer.
 */
export function getNumberParam(
  value: unknown,
  name: string
): number {
  const num = Number(value);

  if (!Number.isInteger(num) || num <= 0) {
    throw new ApiError(
      400, "invalid_param", `${name} must be a positive number`
    );
  }

  return num;
}


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
