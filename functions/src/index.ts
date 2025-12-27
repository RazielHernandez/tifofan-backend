import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import {defineSecret} from "firebase-functions/params";
import {onRequest} from "firebase-functions/v2/https";

admin.initializeApp();
const db = admin.firestore();

// 🔐 API-Football config (stored securely)
const API_BASE_URL = "https://v3.football.api-sports.io";
const API_KEY = defineSecret("FOOTBALL_API_KEY");
// const API_KEY = functions.config().football.key;

/**
 * Fetch data from the API-Football endpoint using the provided API key.
 *
 * @param {string} endpoint - The API endpoint path (e.g. '/players?id=276').
 * @param {string} apiKey - The APIKey to include in the x-apisports-key header.
 * @return {Promise<unknown>} The parsed `response` property from the API JSON.
 */
async function fetchFromApiFootball(endpoint: string, apiKey: string) {
  const response = await fetch(`https://v3.football.api-sports.io${endpoint}`, {
    headers: {
      "x-apisports-key": apiKey,
    },
  });

  if (!response.ok) {
    throw new Error(`API error ${response.status}`);
  }

  const json = await response.json();
  return json.response;
}


export const getPlayer = onRequest(
  {secrets: [API_KEY]},
  async (req, res) => {
    try {
      const playerId = Number(req.query.playerId);
      const season = Number(req.query.season ?? 2024);

      if (!playerId) {
        res.status(400).json({error: "playerId required"});
        return;
      }

      const apiKey = API_KEY.value(); // ✅ STRING HERE

      const data = await fetchFromApiFootball(
        `/players?id=${playerId}&season=${season}`,
        apiKey
      );

      res.json({source: "api", data});
    } catch (err) {
      console.error(err);
      res.status(500).json({error: "Internal error"});
    }
  }
);


/**
 * Health check
 */
export const helloWorld = functions.https.onRequest((_, res) => {
  res.json({status: "TifoFan backend running 🚀"});
});
