import admin from "firebase-admin";
import { getApps, cert } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";

if (getApps().length === 0) {
  admin.initializeApp({
    credential: cert(JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT ?? "")),
  });
}

export const auth = getAuth(admin.app());
