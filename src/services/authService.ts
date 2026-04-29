/**
 * authService.ts
 * Servizio di autenticazione con Firebase Auth.
 * Gestisce login, logout, registrazione e profili utente su Firestore.
 */
import {
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged as firebaseOnAuthStateChanged,
  createUserWithEmailAndPassword,
  updateProfile,
  type User,
} from 'firebase/auth';
import { auth } from '../firebase';
import { upsertUserProfile } from './adminService';

// ── Login utente ──
export async function login(email: string, password: string): Promise<User> {
  const cred = await signInWithEmailAndPassword(auth, email, password);
  // Aggiorna last_login nel profilo Firestore
  try {
    await upsertUserProfile(cred.user.uid, {
      last_login: new Date().toISOString(),
      email: cred.user.email || email,
      displayName: cred.user.displayName || '',
    });
  } catch (e) {
    console.warn('Impossibile aggiornare profilo utente:', e);
  }
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

// ── Registrazione nuovo utente ──
export async function registerWithEmail(email: string, password: string, name: string): Promise<User> {
  const cred = await createUserWithEmailAndPassword(auth, email, password);
  await updateProfile(cred.user, { displayName: name });
  // Crea profilo utente su Firestore
  try {
    await upsertUserProfile(cred.user.uid, {
      displayName: name,
      email: email,
      role: 'user',
      status: 'active',
      created_at: new Date().toISOString(),
      last_login: new Date().toISOString(),
      verifiche_count: 0,
    });
  } catch (e) {
    console.warn('Impossibile creare profilo utente:', e);
  }
  return cred.user;
}

// ── Ottieni utente corrente ──
export function getCurrentUser(): User | null {
  return auth.currentUser;
}
