import {onCall, HttpsError} from "firebase-functions/v2/https";
import {db} from "../admin";
import {buildResponse} from "../utils/response";

export const saveFavorites = onCall(async (request) => {
  const uid = request.auth?.uid;

  if (!uid) {
    throw new HttpsError("unauthenticated", "User must be logged in");
  }

  const {leagues, teams} = request.data;

  if (!Array.isArray(leagues) || !Array.isArray(teams)) {
    throw new HttpsError("invalid-argument", "Invalid data");
  }

  await db
    .collection("users")
    .doc(uid)
    .collection("preferences")
    .doc("favorites")
    .set({
      leagues,
      teams,
      updatedAt: Date.now(),
    });

  return buildResponse(
    {success: true},
    {cached: false}
  );
});

export const getFavorites = onCall(async (request) => {
  const uid = request.auth?.uid;

  if (!uid) {
    throw new HttpsError("unauthenticated", "User must be logged in");
  }

  const doc = await db
    .collection("users")
    .doc(uid)
    .collection("preferences")
    .doc("favorites")
    .get();

  const data = doc.exists ?
    doc.data() : {
      leagues: [],
      teams: [],
    };

  return buildResponse(data, {cached: false});
});
