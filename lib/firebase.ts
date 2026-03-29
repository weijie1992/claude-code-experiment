import { initializeApp, getApps } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyA-jDCN2GwwLjrxbDgCa-u2klVAQp74W94",
  authDomain: "pocket-heist-app-phuaweijie.firebaseapp.com",
  projectId: "pocket-heist-app-phuaweijie",
  storageBucket: "pocket-heist-app-phuaweijie.firebasestorage.app",
  messagingSenderId: "847228061979",
  appId: "1:847228061979:web:a4d6b0c839c948182dabbe",
};

const app =
  getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];

export const auth = getAuth(app);
export const db = getFirestore(app);
export default app;
