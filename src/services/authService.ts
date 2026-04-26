/**
 * authService.ts
 * Servizio di autenticazione admin con Firebase Auth.
 */
import {
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged as firebaseOnAuthStateChanged,
  createUserWithEmailAndPassword,
  type User,
} from 'firebase/auth';
import { auth } from '../firebase';

// ── Login admin ──
export async function login(email: string, password: string): Promise<User> {
  const cred = await signInWithEmailAndPassword(auth, email, password);
  return cred.user;
}

// ── Logout ──
export async function logout(): Promise<void> {
  await signOut(auth);
}

// ── Listener stato autenticazione ──
export function onAuthStateChanged(callback: (user: User | null) => void): () => void {
  return firebaseOnAuthStateChanged(auth, callback);
}

// ── Registrazione primo admin (usata una volta) ──
export async function registerAdmin(email: string, password: string): Promise<User> {
  const cred = await createUserWithEmailAndPassword(auth, email, password);
  return cred.user;
}

// ── Ottieni utente corrente ──
export function getCurrentUser(): User | null {
  return auth.currentUser;
}
