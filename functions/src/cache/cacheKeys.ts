import {CACHE_VERSION} from "./cacheConfig";

/**
 * Builds a versioned cache key.
 *
 * @param {string} resource Cache resource name
 * @param {Array<string|number>} parts Dynamic key parts
 * @return {string} Versioned cache key
 */
export function buildCacheKey(
  resource: keyof typeof CACHE_VERSION,
  ...parts: Array<string | number>
): string {
  const version = CACHE_VERSION[resource];
  return [`v${version}`, resource, ...parts].join("_");
}
