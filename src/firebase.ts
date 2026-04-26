/**
 * firebase.ts
 * Inizializzazione Firebase App, Firestore e Authentication
 * per il progetto verifiche-strutturate.
 */
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyBTTcIchikMmEVmmIxcAd0JtfCjqJ7K_mM",
  authDomain: "verifiche-strutturate.firebaseapp.com",
  projectId: "verifiche-strutturate",
  storageBucket: "verifiche-strutturate.firebasestorage.app",
  messagingSenderId: "960509236517",
  appId: "1:960509236517:web:3af5036cdc5251bf65f6cc",
  measurementId: "G-BH33YJQF8Q",
};

const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);
export const auth = getAuth(app);
export default app;
