/**
 * Default pagination values.
 */
export const DEFAULT_PAGE = 1;
export const DEFAULT_LIMIT = 20;
export const MAX_LIMIT = 50;

/**
 * Normalizes pagination params.
 *
 * @param {any} query - The query object containing optional 'page' and
 *                      'limit' properties.
 * @return {{page: number, limit: number}} Normalized pagination values.
 */
export function getPagination(query: any) {
  const page = Math.max(Number(query.page) || DEFAULT_PAGE, 1);
  const limit = Math.min(
    Number(query.limit) || DEFAULT_LIMIT,
    MAX_LIMIT
  );

  return {page, limit};
}
