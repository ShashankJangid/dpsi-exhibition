import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getFirestore,
  collection,
  doc,
  onSnapshot,
  writeBatch,
  query,
  where,
  runTransaction,
  serverTimestamp,
} from 'firebase/firestore';
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  signOut,
  signInAnonymously,
  updateProfile,
  onAuthStateChanged,
  User,
  browserPopupRedirectResolver,
} from 'firebase/auth';
import { Project } from '../types';
import { SEED_PROJECTS } from '../data/seedProjects';

const defaultApiKey = 'AIzaSyAhHFaRagTK_99jhT1eJK6lJqzGfxcyGec';
const rawApiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY || defaultApiKey;
export const isFirebaseConfigured = Boolean(
  rawApiKey &&
    !rawApiKey.includes('placeholder') &&
    rawApiKey !== 'AIzaSyDPSIExhibitionBuildPlaceholderKey000'
);

const firebaseConfig = {
  apiKey: rawApiKey,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || 'smarthome-88486.firebaseapp.com',
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 'smarthome-88486',
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || 'smarthome-88486.firebasestorage.app',
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || '392256373743',
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || '1:392256373743:web:4a43b6001ba3d31afe6c1a',
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID || 'G-3TF3J2HHGG',
};

// Initialize Firebase singleton
export const firebaseApp = !getApps().length ? initializeApp(firebaseConfig) : getApp();
export const db = getFirestore(firebaseApp);
export const auth = getAuth(firebaseApp);

export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: 'select_account' });

/**
 * Sign in using Google OAuth with automatic redirect fallback if popup is blocked
 */
export async function signInWithGoogle() {
  if (!isFirebaseConfigured) {
    throw new Error('Google OAuth is not configured in this environment. Please use the Visitor Pass tab to vote.');
  }
  const result = await signInWithPopup(auth, googleProvider, browserPopupRedirectResolver);
  return result.user;
}

/**
 * Direct redirect-based Google sign in (useful for mobile browsers or strict popup blockers)
 */
export async function signInWithGoogleRedirect() {
  if (!isFirebaseConfigured) {
    throw new Error('Google OAuth is not configured in this environment. Please use the Visitor Pass tab to vote.');
  }
  await signInWithRedirect(auth, googleProvider, browserPopupRedirectResolver);
}

/**
 * Check and resolve any pending redirect sign-in result on page load
 */
export async function checkRedirectResult(): Promise<User | null> {
  if (!isFirebaseConfigured || typeof window === 'undefined') {
    return null;
  }
  try {
    const result = await getRedirectResult(auth, browserPopupRedirectResolver);
    return result?.user ?? null;
  } catch (err) {
    console.error('Redirect sign-in resolution error:', err);
    return null;
  }
}

/**
 * Sign in as a verified guest/judge visitor.
 * Guaranteed to succeed even if Firebase Anonymous Auth is unconfigured or blocked by network.
 */
export async function signInAsGuest(name: string, email: string) {
  const fallbackGuest = () => ({
    uid: 'guest_' + Math.random().toString(36).substring(2, 12),
    displayName: name,
    email: email || `${name.toLowerCase().replace(/\s+/g, '')}@dpsi-visitor.in`,
  });

  if (!isFirebaseConfigured) {
    return fallbackGuest();
  }

  try {
    const userCredential = await signInAnonymously(auth);
    if (auth.currentUser) {
      await updateProfile(auth.currentUser, {
        displayName: name,
      });
    }
    return {
      uid: userCredential.user.uid,
      displayName: name,
      email: email || `${name.toLowerCase().replace(/\s+/g, '')}@dpsi-visitor.in`,
    };
  } catch (err) {
    console.warn('Notice: Firebase anonymous auth fallback used:', err);
    return fallbackGuest();
  }
}

/**
 * Retrieves the current Firebase Auth user ID token for backend Authorization headers
 */
export async function getCurrentUserIdToken(): Promise<string | null> {
  if (!isFirebaseConfigured || typeof window === 'undefined') {
    return null;
  }
  try {
    if (auth.currentUser) {
      return await auth.currentUser.getIdToken();
    }
  } catch {
    return null;
  }
  return null;
}

/**
 * Sign out
 */
export async function signOutFromFirebase() {
  await signOut(auth);
}

/**
 * Listen for auth state changes
 */
export function onFirebaseAuthStateChange(callback: (user: User | null) => void) {
  if (!isFirebaseConfigured || typeof window === 'undefined') {
    return () => {};
  }
  return onAuthStateChanged(auth, callback);
}

/**
 * Real-time subscription to all exhibition projects from Cloud Firestore.
 * Always guarantees ALL 35 blueprint projects are returned and rendered,
 * hydrated with live votes and updates from Firestore.
 */
export function subscribeToProjects(onUpdate: (projects: Project[]) => void) {
  if (!isFirebaseConfigured || typeof window === 'undefined') {
    onUpdate(SEED_PROJECTS);
    return () => {};
  }
  const projectsCol = collection(db, 'projects');
  const q = query(projectsCol);

  return onSnapshot(
    q,
    (snapshot) => {
      if (snapshot.empty) {
        // If Firestore collection is empty, render canonical seed list without unauthorized writes
        onUpdate(SEED_PROJECTS);
        return;
      }

      // Map Firestore docs by ID (case-insensitive for safety)
      const firestoreMap = new Map<string, Record<string, unknown>>();
      snapshot.forEach((docSnap) => {
        firestoreMap.set(docSnap.id.toLowerCase(), docSnap.data());
      });

      // Always merge against canonical SEED_PROJECTS so no booth is EVER missing from the 3D scene
      const mergedProjects: Project[] = SEED_PROJECTS.map((seedProj) => {
        const remoteData = firestoreMap.get(seedProj.id.toLowerCase());
        if (remoteData) {
          return {
            ...seedProj,
            vote_count:
              typeof remoteData.vote_count === 'number'
                ? remoteData.vote_count
                : seedProj.vote_count,
            title: (remoteData.title as string) || seedProj.title,
            description: (remoteData.description as string) || seedProj.description,
            members:
              Array.isArray(remoteData.members) && remoteData.members.length > 0
                ? (remoteData.members as string[])
                : seedProj.members,
            image_url: (remoteData.image_url as string) || seedProj.image_url,
          };
        }
        return seedProj;
      });

      onUpdate(mergedProjects);
    },
    (err) => {
      console.warn('Firestore subscription notice (using local seed):', err.message);
      onUpdate(SEED_PROJECTS);
    }
  );
}

/**
 * Seed all 35 blueprint projects into Firestore via atomic batch write
 */
export async function seedInitialProjects() {
  try {
    const batch = writeBatch(db);
    for (const project of SEED_PROJECTS) {
      const docRef = doc(db, 'projects', project.id);
      batch.set(
        docRef,
        {
          id: project.id,
          title: project.title,
          zone: project.zone,
          category: project.category,
          booth_code: project.booth_code,
          booth_number: project.booth_number,
          position_x: project.position_x,
          position_y: project.position_y,
          position_z: project.position_z,
          image_url: project.image_url,
          description: project.description,
          tagline: project.tagline || '',
          members: project.members,
          tech_stack: project.tech_stack || [],
          vote_count: project.vote_count || 0,
          updatedAt: serverTimestamp(),
        },
        { merge: true }
      );
    }
    await batch.commit();
  } catch (err) {
    console.warn('Firestore batch seeding notice:', err);
  }
}

export interface VoteSubmissionPayload {
  projectId: string;
  fingerprint: string;
  userId: string;
  userEmail?: string;
}

export interface VoteSubmissionResponse {
  success: boolean;
  message: string;
  alreadyVoted?: boolean;
  newVoteCount?: number;
}

/**
 * Real-time subscription to a user's verified vote receipts across all sessions.
 * Reflects in useExhibitionStore to prevent duplicate votes across reloads/devices.
 */
export function subscribeToUserVotedProjects(
  userId: string,
  onUpdate: (projectIds: string[]) => void
) {
  if (!isFirebaseConfigured || typeof window === 'undefined' || !userId) {
    return () => {};
  }
  const userVotesCol = collection(db, 'user_votes');
  const q = query(userVotesCol, where('userId', '==', userId.trim()));

  return onSnapshot(
    q,
    (snapshot) => {
      const ids: string[] = [];
      snapshot.forEach((docSnap) => {
        const data = docSnap.data();
        if (data.projectId && typeof data.projectId === 'string') {
          ids.push(data.projectId.toLowerCase());
        }
      });
      onUpdate(ids);
    },
    (err) => {
      console.warn('User votes subscription notice:', err.message);
    }
  );
}

/**
 * Cast a verified, legit vote using atomic Firestore transactions + Cloudflare Edge fallback.
 * Enforces dual-layer deduplication:
 *   - Layer 1: Account Lock (${projectId}_${userId}) in user_votes/
 *   - Layer 2: Hardware Device Lock (${projectId}_${deviceFingerprint}) in votes/
 *   - Layer 3: Atomic Firestore vote_count increment (+1) on projects/${projectId}
 */
export async function castVoteInFirebase(
  payload: VoteSubmissionPayload
): Promise<VoteSubmissionResponse> {
  const normalizedProjectId = payload.projectId.trim().toLowerCase();
  const normalizedFingerprint = payload.fingerprint.replace(/\//g, '_').trim();
  const normalizedUserId = payload.userId.trim();

  const voteApiUrl =
    process.env.NEXT_PUBLIC_VOTE_API_URL ||
    process.env.NEXT_PUBLIC_FIREBASE_FUNCTIONS_URL ||
    '/api/vote';

  // 1. Authoritative Edge / Serverless API Verification
  try {
    const idToken = await getCurrentUserIdToken();
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    if (idToken) {
      headers['Authorization'] = `Bearer ${idToken}`;
    }

    const response = await fetch(voteApiUrl, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        projectId: normalizedProjectId,
        deviceFingerprint: normalizedFingerprint,
        fingerprint: normalizedFingerprint,
        userId: normalizedUserId,
        userEmail: payload.userEmail,
      }),
    });

    const data = await response.json().catch(() => ({}));

    // If edge returns success or explicit duplicate rejection, return immediately
    if (response.ok || response.status === 409 || data.alreadyVoted) {
      return {
        success: response.ok && Boolean(data.success),
        message: data.message || (response.ok ? 'Vote recorded successfully' : 'Failed to record vote'),
        alreadyVoted: Boolean(data.alreadyVoted) || response.status === 409,
        newVoteCount: typeof data.newVoteCount === 'number' ? data.newVoteCount : undefined,
      };
    }
  } catch (fetchErr: unknown) {
    console.warn('Voting edge endpoint notice, falling back to direct Firestore atomic ledger:', fetchErr);
  }

  // 2. Direct Atomic Firestore Anti-Cheat Transaction Engine (Offline/Direct Fallback)
  if (isFirebaseConfigured && db) {
    try {
      const voteDocId = `${normalizedProjectId}_${normalizedFingerprint}`;
      const userVoteDocId = `${normalizedProjectId}_${normalizedUserId}`;

      const projectRef = doc(db, 'projects', normalizedProjectId);
      const voteRef = doc(db, 'votes', voteDocId);
      const userVoteRef = doc(db, 'user_votes', userVoteDocId);

      const newVoteTotal = await runTransaction(db, async (transaction) => {
        const [projectSnap, voteSnap, userVoteSnap] = await Promise.all([
          transaction.get(projectRef),
          transaction.get(voteRef),
          transaction.get(userVoteRef),
        ]);

        if (voteSnap.exists()) {
          const err = new Error('Hardware Anti-Cheat Alert: This device has already voted for this project.');
          (err as unknown as { alreadyVoted: boolean }).alreadyVoted = true;
          throw err;
        }

        if (userVoteSnap.exists()) {
          const err = new Error('Account Anti-Cheat Alert: Your account has already voted for this project.');
          (err as unknown as { alreadyVoted: boolean }).alreadyVoted = true;
          throw err;
        }

        const projectData = projectSnap.exists() ? projectSnap.data() : null;
        const currentCount =
          typeof projectData?.vote_count === 'number' && Number.isFinite(projectData.vote_count)
            ? projectData.vote_count
            : 0;
        const nextVoteCount = currentCount + 1;

        transaction.set(voteRef, {
          projectId: normalizedProjectId,
          userId: normalizedUserId,
          deviceFingerprint: normalizedFingerprint,
          userEmail: payload.userEmail || null,
          createdAt: serverTimestamp(),
        });

        transaction.set(userVoteRef, {
          projectId: normalizedProjectId,
          userId: normalizedUserId,
          createdAt: serverTimestamp(),
        });

        if (projectSnap.exists()) {
          transaction.update(projectRef, {
            vote_count: nextVoteCount,
            updatedAt: serverTimestamp(),
          });
        }

        return nextVoteCount;
      });

      return {
        success: true,
        message: 'Vote verified and recorded in live exhibition registry!',
        newVoteCount: newVoteTotal,
      };
    } catch (txErr: unknown) {
      const isAlreadyVoted = Boolean((txErr as { alreadyVoted?: boolean })?.alreadyVoted);
      if (isAlreadyVoted) {
        return {
          success: false,
          alreadyVoted: true,
          message:
            txErr instanceof Error
              ? txErr.message
              : 'A verified vote has already been cast for this project.',
        };
      }
    }
  }

  return {
    success: false,
    message: 'Vote submission could not be verified by server. Please check connection and try again.',
  };
}
