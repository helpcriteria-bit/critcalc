import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  addDoc,
  deleteDoc,
  updateDoc,
  query,
  orderBy,
  serverTimestamp
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage, isFirebaseConfigured } from './config';

/**
 * Checks if Firebase Firestore is available and ready.
 */
function assertFirestore() {
  if (!isFirebaseConfigured || !db) {
    throw new Error('Firebase Firestore is not configured. Please add your Firebase credentials to .env.');
  }
}

/**
 * Save or update a student canvas document in Firestore:
 * users/{uid}/canvases/{canvasId}
 */
export async function saveStudentCanvas(uid, canvasId, { name, canvasData, thumbnail }) {
  assertFirestore();
  if (!uid) throw new Error('Student UID is required to save canvas.');

  const canvasName = (name && name.trim()) || 'Untitled Geometry Canvas';
  const canvasesCol = collection(db, 'users', uid, 'canvases');

  if (canvasId) {
    // Update existing canvas
    const canvasRef = doc(db, 'users', uid, 'canvases', canvasId);
    const payload = {
      name: canvasName,
      canvasData,
      updatedAt: serverTimestamp()
    };
    if (thumbnail) {
      payload.thumbnail = thumbnail;
    }
    await updateDoc(canvasRef, payload);
    return canvasId;
  } else {
    // Create new canvas document
    const payload = {
      name: canvasName,
      canvasData,
      thumbnail: thumbnail || null,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    };
    const newDoc = await addDoc(canvasesCol, payload);
    return newDoc.id;
  }
}

/**
 * Fetch all canvases for a student, sorted by most recently updated.
 */
export async function getStudentCanvases(uid) {
  assertFirestore();
  if (!uid) return [];

  const canvasesCol = collection(db, 'users', uid, 'canvases');
  let snapshot;
  try {
    const q = query(canvasesCol, orderBy('updatedAt', 'desc'));
    snapshot = await getDocs(q);
  } catch (err) {
    // Fallback without index if orderBy fails
    console.warn('OrderBy query failed, falling back to unordered fetch:', err);
    snapshot = await getDocs(canvasesCol);
  }

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

  // Client-side sort fallback
  list.sort((a, b) => {
    const timeA = a.updatedAt ? new Date(a.updatedAt).getTime() : 0;
    const timeB = b.updatedAt ? new Date(b.updatedAt).getTime() : 0;
    return timeB - timeA;
  });

  return list;
}

/**
 * Fetch a single canvas by ID.
 */
export async function getStudentCanvasById(uid, canvasId) {
  assertFirestore();
  if (!uid || !canvasId) return null;

  const canvasRef = doc(db, 'users', uid, 'canvases', canvasId);
  const snap = await getDoc(canvasRef);
  if (!snap.exists()) return null;

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
  const canvasRef = doc(db, 'users', uid, 'canvases', canvasId);
  await updateDoc(canvasRef, {
    name: (newName && newName.trim()) || 'Untitled Geometry Canvas',
    updatedAt: serverTimestamp()
  });
}

/**
 * Upload a binary asset/image to Firebase Storage under users/{uid}/assets/{assetId}.
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
