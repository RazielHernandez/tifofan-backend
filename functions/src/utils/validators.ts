import {ApiError} from "./apiError";

/**
 * Requires a positive integer query param.
 *
 * @param {unknown} value Query value
 * @param {string} name Parameter name
 * @return {number}
 * @throws {ApiError}
 */
export function requirePositiveInt(
  value:unknown,
  name:string
):number {
  if (typeof value !== "string") {
    throw new ApiError(400, "invalid_param", `${name} is required`);
  }

  const num = Number(value);
  if (!Number.isInteger(num) || num <= 0) {
    throw new ApiError(
      400,
      "invalid_param",
      `${name} must be a positive integer`
    );
  }

  return num;
}

/**
 * Requires a valid season year.
 *
 * @param {unknown} value Query value
 * @return {number}
 * @throws {ApiError}
 */
export function requireSeason(value:unknown):number {
  if (typeof value !== "string") {
    throw new ApiError(400, "invalid_param", "season is required");
  }

  const year = Number(value);
  const currentYear = new Date().getFullYear();

  if (
    !Number.isInteger(year) ||
    year < 2000 ||
    year > currentYear + 1
  ) {
    throw new ApiError(
      400,
      "invalid_param",
      "season must be a valid year"
    );
  }

  return year;
}
