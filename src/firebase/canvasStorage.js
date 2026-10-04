import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  deleteDoc,
  updateDoc,
  query,
  orderBy,
  startAfter,
  limit,
  serverTimestamp
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage, isFirebaseConfigured } from './config.js';

/**
 * Checks if Firebase Firestore is available and ready.
 */
function assertFirestore() {
  if (!isFirebaseConfigured || !db) {
    throw new Error('Firebase Firestore is not configured. Please add your Firebase credentials to .env.');
  }
}

const LOCAL_STORAGE_PREFIX = 'critcalc_canvas_draft_';
const PENDING_SYNC_KEY = 'critcalc_pending_syncs';
const AI_KEY_STORAGE_KEYS = ['mathcanvas_gemini_key', 'mathcanvas_groq_key'];

export function clearStudentLocalData() {
  if (typeof window === 'undefined') return;

  try {
    if (!window.localStorage) return;
    const draftKeys = Object.keys(window.localStorage).filter((key) => key.startsWith(LOCAL_STORAGE_PREFIX));
    for (const key of [...draftKeys, PENDING_SYNC_KEY, ...AI_KEY_STORAGE_KEYS]) {
      window.localStorage.removeItem(key);
    }
  } catch (err) {
    console.error('Failed to clear all student data from local storage:', err);
  } finally {
    window.dispatchEvent(new Event('critcalc:signout'));
  }
}

/**
 * Save a local fallback draft to localStorage in case user is offline or Firestore is unreachable.
 */
export function saveLocalCanvasDraft(uid, canvasId, { name, canvasData }) {
  if (typeof window === 'undefined' || !window.localStorage) return;
  try {
    const key = `${LOCAL_STORAGE_PREFIX}${uid || 'anon'}_${canvasId || 'new'}`;
    const payload = {
      canvasId: canvasId || null,
      userId: uid || null,
      name: (name && name.trim()) || 'Untitled Geometry Canvas',
      canvasData: canvasData || {},
      savedAt: new Date().toISOString()
    };
    window.localStorage.setItem(key, JSON.stringify(payload));
  } catch (err) {
    console.warn('Failed to save local canvas draft:', err);
  }
}

/**
 * Retrieve local fallback draft from localStorage.
 */
export function getLocalCanvasDraft(uid, canvasId) {
  if (typeof window === 'undefined' || !window.localStorage) return null;
  try {
    const key = `${LOCAL_STORAGE_PREFIX}${uid || 'anon'}_${canvasId || 'new'}`;
    const raw = window.localStorage.getItem(key);
    return raw ? JSON.parse(raw) : null;
  } catch (err) {
    console.warn('Failed to read local canvas draft:', err);
    return null;
  }
}

/**
 * Remove local fallback draft once successfully synced to Firestore.
 */
export function clearLocalCanvasDraft(uid, canvasId) {
  if (typeof window === 'undefined' || !window.localStorage) return;
  try {
    const key = `${LOCAL_STORAGE_PREFIX}${uid || 'anon'}_${canvasId || 'new'}`;
    window.localStorage.removeItem(key);
  } catch (_) {}
}

/**
 * Mark a canvas as needing synchronization when connection restores.
 */
export function markPendingCanvasSync(uid, canvasId) {
  if (typeof window === 'undefined' || !window.localStorage || !uid) return;
  try {
    const current = JSON.parse(window.localStorage.getItem(PENDING_SYNC_KEY) || '[]');
    const item = { uid, canvasId: canvasId || 'new', timestamp: Date.now() };
    const exists = current.some((s) => s.uid === uid && s.canvasId === (canvasId || 'new'));
    if (!exists) {
      current.push(item);
      window.localStorage.setItem(PENDING_SYNC_KEY, JSON.stringify(current));
    }
  } catch (_) {}
}

/**
 * Clear a pending sync record.
 */
export function clearPendingCanvasSync(uid, canvasId) {
  if (typeof window === 'undefined' || !window.localStorage || !uid) return;
  try {
    const current = JSON.parse(window.localStorage.getItem(PENDING_SYNC_KEY) || '[]');
    const filtered = current.filter((s) => !(s.uid === uid && s.canvasId === (canvasId || 'new')));
    window.localStorage.setItem(PENDING_SYNC_KEY, JSON.stringify(filtered));
  } catch (_) {}
}

/**
 * Get all pending syncs for a user.
 */
export function getPendingCanvasSyncs(uid) {
  if (typeof window === 'undefined' || !window.localStorage || !uid) return [];
  try {
    const current = JSON.parse(window.localStorage.getItem(PENDING_SYNC_KEY) || '[]');
    return current.filter((s) => s.uid === uid);
  } catch (_) {
    return [];
  }
}

/**
 * Save or update a student canvas document in Firestore:
 * users/{uid}/canvases/{canvasId}
 */
export async function saveStudentCanvas(uid, canvasId, { name, canvasData, thumbnail }) {
  assertFirestore();
  if (!uid) throw new Error('Student UID is required to save canvas.');

  const trimmedName = (name && name.trim()) || 'Untitled Geometry Canvas';
  const canvasName = trimmedName.slice(0, 200);
  const data = canvasData && typeof canvasData === 'object' ? canvasData : {};

  // Always keep a local copy as backup
  saveLocalCanvasDraft(uid, canvasId, { name: canvasName, canvasData: data });

  const canvasesCol = collection(db, 'users', uid, 'canvases');

  if (canvasId) {
    // Update existing canvas
    const canvasRef = doc(db, 'users', uid, 'canvases', canvasId);
    const payload = {
      userId: uid,
      name: canvasName,
      canvasData: data,
      updatedAt: serverTimestamp()
    };
    if (thumbnail !== undefined && thumbnail !== null) {
      payload.thumbnail = thumbnail;
    }
    await updateDoc(canvasRef, payload);
    clearPendingCanvasSync(uid, canvasId);
    return canvasId;
  } else {
    // Create new canvas document
    const payload = {
      userId: uid,
      name: canvasName,
      canvasData: data,
      thumbnail: thumbnail || null,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    };
    const newDoc = await addDoc(canvasesCol, payload);
    clearPendingCanvasSync(uid, 'new');
    clearLocalCanvasDraft(uid, 'new');
    saveLocalCanvasDraft(uid, newDoc.id, { name: canvasName, canvasData: data });
    return newDoc.id;
  }
}

/**
 * Fetch one page of a student's canvases, sorted by most recently updated.
 */
export async function getStudentCanvases(uid, cursor = null, pageSize = 20) {
  assertFirestore();
  if (!uid) return { canvases: [], nextCursor: null, hasMore: false };

  const canvasesCol = collection(db, 'users', uid, 'canvases');
  const q = query(
    canvasesCol,
    orderBy('updatedAt', 'desc'),
    ...(cursor ? [startAfter(cursor)] : []),
    limit(pageSize)
  );
  const snapshot = await getDocs(q);

  const list = [];
  snapshot.forEach((docSnap) => {
    const data = docSnap.data();
    list.push({
      id: docSnap.id,
      ...data,
      // Convert Timestamps to ISO strings or null for easy UI formatting
      createdAt: data.createdAt?.toDate ? data.createdAt.toDate().toISOString() : null,
      updatedAt: data.updatedAt?.toDate ? data.updatedAt.toDate().toISOString() : null
    });
  });

  const hasMore = snapshot.docs.length === pageSize;
  return {
    canvases: list,
    nextCursor: hasMore ? snapshot.docs[snapshot.docs.length - 1] : null,
    hasMore
  };
}

/**
 * Fetch a single canvas by ID.
 */
export async function getStudentCanvasById(uid, canvasId) {
  assertFirestore();
  if (!uid || !canvasId) return null;

  const canvasRef = doc(db, 'users', uid, 'canvases', canvasId);
  const snap = await getDoc(canvasRef);
  if (!snap.exists()) {
    // Check if there is a local draft
    const draft = getLocalCanvasDraft(uid, canvasId);
    if (draft) {
      return {
        id: canvasId,
        name: draft.name,
        canvasData: draft.canvasData,
        createdAt: draft.savedAt,
        updatedAt: draft.savedAt,
        isLocalDraft: true
      };
    }
    return null;
  }

  const data = snap.data();
  return {
    id: snap.id,
    ...data,
    createdAt: data.createdAt?.toDate ? data.createdAt.toDate().toISOString() : null,
    updatedAt: data.updatedAt?.toDate ? data.updatedAt.toDate().toISOString() : null
  };
}

/**
 * Delete a student canvas.
 */
export async function deleteStudentCanvas(uid, canvasId) {
  assertFirestore();
  if (!uid || !canvasId) throw new Error('UID and canvas ID are required.');
  const canvasRef = doc(db, 'users', uid, 'canvases', canvasId);
  await deleteDoc(canvasRef);
  clearLocalCanvasDraft(uid, canvasId);
  clearPendingCanvasSync(uid, canvasId);
}

/**
 * Duplicate an existing student canvas.
 */
export async function duplicateStudentCanvas(uid, canvasId) {
  const original = await getStudentCanvasById(uid, canvasId);
  if (!original) throw new Error('Original canvas not found.');

  return await saveStudentCanvas(uid, null, {
    name: `${original.name} (Copy)`,
    canvasData: original.canvasData,
    thumbnail: original.thumbnail
  });
}

/**
 * Rename a canvas.
 */
export async function renameStudentCanvas(uid, canvasId, newName) {
  assertFirestore();
  if (!uid || !canvasId) throw new Error('UID and canvas ID are required.');
  const trimmedName = (newName && newName.trim()) || 'Untitled Geometry Canvas';
  const canvasRef = doc(db, 'users', uid, 'canvases', canvasId);
  await updateDoc(canvasRef, {
    name: trimmedName.slice(0, 200),
    updatedAt: serverTimestamp()
  });
}

/**
 * Upload a binary asset/image to Firebase Storage under users/{uid}/assets/{assetId}.
 * Note: Only used if future canvas tools specifically support file/image uploads.
 */
export async function uploadCanvasAsset(uid, file) {
  if (!isFirebaseConfigured || !storage) {
    throw new Error('Firebase Storage is not configured.');
  }
  if (!uid || !file) throw new Error('UID and file are required.');

  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
  const assetPath = `users/${uid}/assets/${Date.now()}_${safeName}`;
  const assetRef = ref(storage, assetPath);

  await uploadBytes(assetRef, file);
  const downloadUrl = await getDownloadURL(assetRef);
  return {
    path: assetPath,
    url: downloadUrl
  };
}
