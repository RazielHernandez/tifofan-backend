import {db} from "../admin";

/**
 * Retrieves a cached value from Firestore if it exists and is not expired.
 *
 * @template T
 * @param {string} key Cache document key.
 * @return {Promise<T | null>} Cached value or null.
 */
export async function getCached<T>(key: string): Promise<T | null> {
  if (!key) {
    throw new Error("Cache key must not be empty");
  }

  const doc = await db.collection("cache").doc(key).get();

  if (!doc.exists) return null;

  const data = doc.data();
  if (!data) return null;

  if (Date.now() > data.expiresAt) {
    await doc.ref.delete();
    return null;
  }

  return data.value as T;
}

/**
 * Stores a value in Firestore cache with a TTL.
 *
 * @template T
 * @param {string} key Cache document key.
 * @param {T} value Value to cache.
 * @param {number} ttlSeconds Time to live in seconds.
 * @return {Promise<void>}
 */
export async function setCached<T>(
  key: string,
  value: T,
  ttlSeconds: number
): Promise<void> {
  if (!key) {
    throw new Error("Cache key must not be empty");
  }

  await db.collection("cache").doc(key).set({
    value,
    expiresAt: Date.now() + ttlSeconds * 1000,
  });
}
