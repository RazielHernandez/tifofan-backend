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

export const removeFavorite = onCall(async (request) => {
  const uid = request.auth?.uid;

  if (!uid) {
    throw new HttpsError("unauthenticated", "User must be logged in");
  }

  const {type, id} = request.data;

  if (!type || !id) {
    throw new HttpsError("invalid-argument", "Missing params");
  }

  if (!["team", "league"].includes(type)) {
    throw new HttpsError("invalid-argument", "Invalid type");
  }

  const ref = db
    .collection("users")
    .doc(uid)
    .collection("preferences")
    .doc("favorites");

  await db.runTransaction(async (tx) => {
    const doc = await tx.get(ref);

    const data = doc.exists ? doc.data() as any : {
      leagues: [],
      teams: [],
    };

    let leagues = data.leagues || [];
    let teams = data.teams || [];

    if (type === "team") {
      teams = teams.filter((t: any) => t.id !== id);
    }

    if (type === "league") {
      leagues = leagues.filter((l: any) => l.id !== id);
    }

    tx.set(ref, {
      leagues,
      teams,
      updatedAt: Date.now(),
    });
  });

  return buildResponse(
    {success: true},
    {cached: false}
  );
});

export const addFavorite = onCall(async (request) => {
  const uid = request.auth?.uid;

  if (!uid) {
    throw new HttpsError("unauthenticated", "User must be logged in");
  }

  const {type, item} = request.data;

  if (!type || !item || !item.id) {
    throw new HttpsError("invalid-argument", "Missing params");
  }

  if (!["team", "league"].includes(type)) {
    throw new HttpsError("invalid-argument", "Invalid type");
  }

  const ref = db
    .collection("users")
    .doc(uid)
    .collection("preferences")
    .doc("favorites");

  await db.runTransaction(async (tx) => {
    const doc = await tx.get(ref);

    const data = doc.exists ? doc.data() as any : {
      leagues: [],
      teams: [],
    };

    const leagues = data.leagues || [];
    const teams = data.teams || [];

    if (type === "team") {
      const exists = teams.some((t: any) => t.id === item.id);
      if (!exists) {
        teams.push(item);
      }
    }

    if (type === "league") {
      const exists = leagues.some((l: any) => l.id === item.id);
      if (!exists) {
        leagues.push(item);
      }
    }

    tx.set(ref, {
      leagues,
      teams,
      updatedAt: Date.now(),
    });
  });

  return buildResponse(
    {success: true},
    {cached: false}
  );
});
