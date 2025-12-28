/**
 * Base URL for API-Football v3
 */
const BASE_URL = "https://v3.football.api-sports.io";

/**
 * Fetches data from the API-Football service.
 *
 * @param {string} endpoint - API-Football endpoint (e.g. "fixtures","players").
 * @param {Record<string, string | number>} query - Query parameters.
 * @param {string} apiKey - API-Football API key.
 * @return {Promise<any[]>} API-Football response array.
 * @throws {Error} When the API request fails.
 */
export async function fetchFromApiFootball(
  endpoint: string,
  query: Record<string, string | number>,
  apiKey: string
): Promise<any[]> {
  const url = new URL(`${BASE_URL}/${endpoint}`);

  Object.entries(query).forEach(([key, value]) => {
    url.searchParams.append(key, String(value));
  });

  const response = await fetch(url.toString(), {
    headers: {
      "x-apisports-key": apiKey,
    },
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`API-Football error ${response.status}: ${text}`);
  }

  const json = await response.json();
  return json.response;
}
