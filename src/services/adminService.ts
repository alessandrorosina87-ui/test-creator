/**
 * adminService.ts
 * Servizio per l'area amministratore: gestione utenti, statistiche piattaforma e controllo ruoli.
 * Utilizza Firebase Custom Claims per la verifica dei ruoli.
 */
import {
  collection,
  doc,
  getDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  query,
  where,
  setDoc,
} from 'firebase/firestore';
import { db, auth } from '../firebase';
import type { UserProfile, VerificaDB } from '../types';

const USERS_COLLECTION = 'users';
const VERIFICHE_COLLECTION = 'verifiche';

// ── Verifica se l'utente corrente è admin (via Custom Claims nel token JWT) ──
export async function isCurrentUserAdmin(): Promise<boolean> {
  const user = auth.currentUser;
  if (!user) return false;
  const tokenResult = await user.getIdTokenResult();
  return tokenResult.claims.admin === true;
}

// ── Forza il refresh del token (utile dopo che il claim admin viene settato) ──
export async function forceTokenRefresh(): Promise<void> {
  const user = auth.currentUser;
  if (user) {
    await user.getIdToken(true);
  }
}

// ── Recupera tutti i profili utente (solo admin) ──
export async function getAllUsers(): Promise<UserProfile[]> {
  const snapshot = await getDocs(collection(db, USERS_COLLECTION));
  const users: UserProfile[] = [];
  snapshot.forEach((docSnap) => {
    const data = docSnap.data();
    users.push({
      uid: docSnap.id,
      displayName: data.displayName || '',
      email: data.email || '',
      role: data.role || 'user',
      status: data.status || 'active',
      created_at: data.created_at || '',
      last_login: data.last_login || '',
      verifiche_count: data.verifiche_count || 0,
    });
  });
  return users.sort((a, b) => b.created_at.localeCompare(a.created_at));
}

// ── Recupera un profilo utente singolo ──
export async function getUserProfile(uid: string): Promise<UserProfile | null> {
  const docSnap = await getDoc(doc(db, USERS_COLLECTION, uid));
  if (!docSnap.exists()) return null;
  const data = docSnap.data();
  return {
    uid: docSnap.id,
    displayName: data.displayName || '',
    email: data.email || '',
    role: data.role || 'user',
    status: data.status || 'active',
    created_at: data.created_at || '',
    last_login: data.last_login || '',
    verifiche_count: data.verifiche_count || 0,
  };
}

// ── Recupera le verifiche di un utente specifico (solo admin) ──
export async function getUserVerifiche(userId: string): Promise<VerificaDB[]> {
  const snapshot = await getDocs(
    query(collection(db, VERIFICHE_COLLECTION), where('user_id', '==', userId))
  );
  const risultati: VerificaDB[] = [];
  snapshot.forEach((docSnap) => {
    const data = docSnap.data();
    if (data._tipo !== 'contatore' && data.codice_verifica) {
      risultati.push(data as VerificaDB);
    }
  });
  return risultati.sort((a, b) => b.data_creazione.localeCompare(a.data_creazione));
}

// ── Blocca/Sblocca utente ──
export async function updateUserStatus(uid: string, status: 'active' | 'blocked'): Promise<void> {
  await updateDoc(doc(db, USERS_COLLECTION, uid), { status });
}

// ── Elimina profilo utente (solo da Firestore, non da Auth) ──
export async function deleteUserProfile(uid: string): Promise<void> {
  await deleteDoc(doc(db, USERS_COLLECTION, uid));
}

// ── Statistiche globali piattaforma ──
export async function getPlatformStats(): Promise<{
  totalUsers: number;
  totalVerifiche: number;
  activeUsersMonth: number;
  verificheToday: number;
}> {
  const users = await getAllUsers();
  
  // Conta tutte le verifiche (non solo dell'utente corrente)
  const verSnapshot = await getDocs(collection(db, VERIFICHE_COLLECTION));
  let totalVerifiche = 0;
  let verificheToday = 0;
  const today = new Date().toISOString().split('T')[0];
  
  verSnapshot.forEach((docSnap) => {
    const data = docSnap.data();
    if (data._tipo !== 'contatore' && data.codice_verifica) {
      totalVerifiche++;
      if (data.data_creazione && data.data_creazione.startsWith(today)) {
        verificheToday++;
      }
    }
  });

  const now = new Date();
  const oneMonthAgo = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate()).toISOString();
  const activeUsersMonth = users.filter(u => u.last_login > oneMonthAgo).length;

  return {
    totalUsers: users.length,
    totalVerifiche,
    activeUsersMonth,
    verificheToday,
  };
}

// ── Crea/aggiorna profilo utente su Firestore ──
export async function upsertUserProfile(
  uid: string,
  data: Partial<UserProfile>,
): Promise<void> {
  const ref = doc(db, USERS_COLLECTION, uid);
  const existing = await getDoc(ref);
  if (existing.exists()) {
    await updateDoc(ref, data);
  } else {
    await setDoc(ref, {
      uid,
      displayName: '',
      email: '',
      role: 'user',
      status: 'active',
      created_at: new Date().toISOString(),
      last_login: new Date().toISOString(),
      verifiche_count: 0,
      ...data,
    });
  }
}
