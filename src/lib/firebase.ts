import { initializeApp, getApps, getApp, type FirebaseApp } from "firebase/app";
import {
  getFirestore,
  collection,
  doc,
  setDoc,
  deleteDoc,
  updateDoc,
  getDocs,
  onSnapshot,
  type Firestore,
} from "firebase/firestore";
import {
  getStorage,
  ref as storageRef,
  uploadBytes,
  getDownloadURL,
  type FirebaseStorage,
} from "firebase/storage";
import type { Product } from "./db";

// Official Firebase configuration for Marga Jewelry
const firebaseConfig = {
  apiKey:
    (import.meta.env["VITE_FIREBASE_API_KEY"] as string | undefined) ||
    "AIzaSyCzYSu1j87Sdh11mIsQM8STcZ-gWW-A2sY",
  authDomain:
    (import.meta.env["VITE_FIREBASE_AUTH_DOMAIN"] as string | undefined) ||
    "marga-jewelry.firebaseapp.com",
  projectId:
    (import.meta.env["VITE_FIREBASE_PROJECT_ID"] as string | undefined) ||
    "marga-jewelry",
  storageBucket:
    (import.meta.env["VITE_FIREBASE_STORAGE_BUCKET"] as string | undefined) ||
    "marga-jewelry.firebasestorage.app",
  messagingSenderId:
    (import.meta.env["VITE_FIREBASE_MESSAGING_SENDER_ID"] as string | undefined) ||
    "354958562891",
  appId:
    (import.meta.env["VITE_FIREBASE_APP_ID"] as string | undefined) ||
    "1:354958562891:web:f18790f16c66794837dfce",
  measurementId:
    (import.meta.env["VITE_FIREBASE_MEASUREMENT_ID"] as string | undefined) ||
    "G-92HJ035E6C",
};

// Singleton Firebase App instance
export const app: FirebaseApp = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);

// Cloud Firestore Database instance
export const db: Firestore = getFirestore(app);

// Cloud Storage instance
export const storage: FirebaseStorage = getStorage(app);

// Optional Client Analytics
if (typeof window !== "undefined") {
  import("firebase/analytics")
    .then(({ getAnalytics, isSupported }) => {
      isSupported().then((supported) => {
        if (supported) {
          getAnalytics(app);
        }
      });
    })
    .catch(() => {});
}

/**
 * Uploads a file directly to Firebase Cloud Storage and returns its permanent HTTPS CDN URL
 */
export async function uploadToFirebaseStorage(
  file: File | Blob,
  folder = "products",
  fileName?: string
): Promise<string> {
  const cleanName = (fileName || (file instanceof File ? file.name : "image.jpg"))
    .replace(/[^a-zA-Z0-9._-]/g, "_");
  const uniquePath = `${folder}/${Date.now()}_${cleanName}`;
  const fileRef = storageRef(storage, uniquePath);

  const snapshot = await uploadBytes(fileRef, file, {
    contentType: file.type || "image/jpeg",
  });

  const downloadURL = await getDownloadURL(snapshot.ref);
  return downloadURL;
}

/**
 * Persists a product document in Firestore
 */
export async function saveProductToFirestore(product: Product): Promise<void> {
  const productDoc = doc(db, "products", product.id);
  // Clean undefined fields to keep Firestore strict
  const cleaned = JSON.parse(JSON.stringify(product));
  await setDoc(productDoc, cleaned, { merge: true });
}

/**
 * Updates partial product fields in Firestore
 */
export async function updateProductInFirestore(
  id: string,
  updates: Partial<Product>
): Promise<void> {
  const productDoc = doc(db, "products", id);
  const cleaned = JSON.parse(JSON.stringify(updates));
  await updateDoc(productDoc, cleaned);
}

/**
 * Deletes a product from Firestore
 */
export async function deleteProductFromFirestore(id: string): Promise<void> {
  const productDoc = doc(db, "products", id);
  await deleteDoc(productDoc);
}

/**
 * Loads all products from Firestore
 */
export async function fetchProductsFromFirestore(): Promise<Product[]> {
  const colRef = collection(db, "products");
  const snap = await getDocs(colRef);
  const items: Product[] = [];
  snap.forEach((d) => {
    items.push(d.data() as Product);
  });
  return items;
}

/**
 * Real-time listener for products in Firestore
 * Instantly synchronizes changes across all visitors, devices, and admin sessions
 */
export function subscribeToProducts(
  onUpdate: (products: Product[]) => void,
  onError?: (err: any) => void
): () => void {
  const colRef = collection(db, "products");
  return onSnapshot(
    colRef,
    (snap) => {
      const items: Product[] = [];
      snap.forEach((d) => {
        items.push(d.data() as Product);
      });
      onUpdate(items);
    },
    (error) => {
      console.warn("[Firebase] Real-time products sync warning:", error);
      onError?.(error);
    }
  );
}

/**
 * Seeds Firestore with default products if the collection is empty
 */
export async function seedFirestoreIfEmpty(defaults: Product[]): Promise<boolean> {
  try {
    const existing = await fetchProductsFromFirestore();
    if (existing.length === 0 && defaults.length > 0) {
      console.info("[Firebase] First-time cloud seed: saving initial catalog to Firestore...");
      for (const prod of defaults) {
        await saveProductToFirestore(prod);
      }
      return true;
    }
    return false;
  } catch (err) {
    console.warn("[Firebase] Could not seed Firestore:", err);
    return false;
  }
}
