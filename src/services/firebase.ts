import { initializeApp, getApps } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getDatabase } from 'firebase/database';
import Constants from 'expo-constants';

export const getFirebaseConfig = () => {
  const cfg = {
    apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY || (Constants?.expoConfig?.extra as any)?.EXPO_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN || (Constants?.expoConfig?.extra as any)?.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID || (Constants?.expoConfig?.extra as any)?.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET || (Constants?.expoConfig?.extra as any)?.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || (Constants?.expoConfig?.extra as any)?.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID || (Constants?.expoConfig?.extra as any)?.EXPO_PUBLIC_FIREBASE_APP_ID,
  } as Record<string, string | undefined>;
  const enabled = Object.values(cfg).every(Boolean);
  return { enabled, cfg: cfg as Record<string, string> };
};

let firestoreInstance: ReturnType<typeof getFirestore> | null = null;
let databaseInstance: ReturnType<typeof getDatabase> | null = null;

export const getFirebaseDb = () => {
  if (firestoreInstance) return firestoreInstance;
  const { enabled, cfg } = getFirebaseConfig();
  if (!enabled) return null;
  if (getApps().length === 0) {
    initializeApp(cfg);
  }
  firestoreInstance = getFirestore();
  return firestoreInstance;
};

export const getFirebaseRealtimeDb = () => {
  if (databaseInstance) return databaseInstance;
  const { enabled, cfg } = getFirebaseConfig();
  if (!enabled) return null;
  if (getApps().length === 0) {
    initializeApp(cfg);
  }
  databaseInstance = getDatabase();
  return databaseInstance;
};

export const isFirebaseEnabled = () => getFirebaseConfig().enabled;


