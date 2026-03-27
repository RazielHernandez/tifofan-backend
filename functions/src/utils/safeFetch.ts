// data/safeFetch.ts
import {getCached, setCached} from "../cache/firestoreCache";

type CacheEntry<T> = {
  value: T;
  expiresAt: number;
};

const inFlight = new Map<string, Promise<any>>();
const memoryCache = new Map<string, CacheEntry<any>>();

/**
 * Retrieves a value from the memory cache if it exists and has not expired.
 * @template T The type of the cached value.
 * @param {string} key The cache key.
 * @return {T | null} The cached value or null if not found or expired.
 */
function getMemory<T>(key: string): T | null {
  const entry = memoryCache.get(key);
  if (!entry) return null;

  if (Date.now() > entry.expiresAt) {
    memoryCache.delete(key);
    return null;
  }

  return entry.value as T;
}

/**
 * Stores a value in the memory cache with a specified time-to-live.
 * @template T The type of the value being cached.
 * @param {string} key The cache key.
 * @param {T} value The value to cache.
 * @param {number} ttlSeconds The time-to-live in seconds.
 */
function setMemory<T>(key: string, value: T, ttlSeconds: number) {
  memoryCache.set(key, {
    value,
    expiresAt: Date.now() + ttlSeconds * 1000,
  });
}

/**
 * Safely fetches data with multi-layer caching strategy.
 *
 * @template T The type of the data being fetched.
 * @param {string} key The cache key.
 * @param {number} ttlSeconds The time-to-live in seconds.
 * @param {Function} fetcher The async function to fetch data.
 * @return {Promise<Object>} Promise an object with data and cached flag.
 */
export async function safeFetch<T>(
  key: string,
  ttlSeconds: number,
  fetcher: () => Promise<T>
): Promise<{data: T; cached: boolean}> {
  // 1️⃣ Memory cache (fastest)
  const mem = getMemory<T>(key);
  if (mem) {
    return {data: mem, cached: true};
  }

  // 2️⃣ Firestore cache
  const cached = await getCached<T>(key);
  if (cached) {
    setMemory(key, cached, ttlSeconds);
    return {data: cached, cached: true};
  }

  // 3️⃣ Deduplicate concurrent requests
  if (inFlight.has(key)) {
    const promise = inFlight.get(key);
    if (promise) {
      const data = await promise;
      return {data, cached: false};
    }
  }

  // 4️⃣ Fetch from API
  const promise = (async () => {
    try {
      const fresh = await fetcher();

      await setCached(key, fresh, ttlSeconds);
      setMemory(key, fresh, ttlSeconds);

      return fresh;
    } finally {
      inFlight.delete(key);
    }
  })();

  inFlight.set(key, promise);

  const data = await promise;
  return {data, cached: false};
}
