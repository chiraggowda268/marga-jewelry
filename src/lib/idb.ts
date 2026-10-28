/**
 * IndexedDB lightweight key-value store.
 * Provides multi-gigabyte client-side persistence for product catalogs,
 * multi-image Base64 uploads, and order history without the 5MB browser quota limits of localStorage.
 */

const DB_NAME = "marga_store_db";
const DB_VERSION = 1;
const STORE_NAME = "keyval";

function openDB(): Promise<IDBDatabase | null> {
  return new Promise((resolve) => {
    if (typeof window === "undefined" || !("indexedDB" in window)) {
      resolve(null);
      return;
    }

    try {
      const request = window.indexedDB.open(DB_NAME, DB_VERSION);

      request.onupgradeneeded = () => {
        const db = request.result;
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          db.createObjectStore(STORE_NAME);
        }
      };

      request.onsuccess = () => {
        resolve(request.result);
      };

      request.onerror = (e) => {
        console.warn("[IndexedDB] Error opening database:", e);
        resolve(null);
      };

      request.onblocked = () => {
        console.warn("[IndexedDB] Database open request blocked by other tabs");
        resolve(null);
      };
    } catch (err) {
      console.warn("[IndexedDB] Exception during openDB:", err);
      resolve(null);
    }
  });
}

export async function idbGet<T>(key: string): Promise<T | undefined> {
  const db = await openDB();
  if (!db) return undefined;

  return new Promise((resolve) => {
    try {
      const tx = db.transaction(STORE_NAME, "readonly");
      const store = tx.objectStore(STORE_NAME);
      const req = store.get(key);

      req.onsuccess = () => {
        resolve(req.result as T | undefined);
      };

      req.onerror = (e) => {
        console.warn(`[IndexedDB] Get "${key}" failed:`, e);
        resolve(undefined);
      };
    } catch (err) {
      console.warn(`[IndexedDB] Transaction error for "${key}":`, err);
      resolve(undefined);
    }
  });
}

export async function idbSet<T>(key: string, value: T): Promise<boolean> {
  const db = await openDB();
  if (!db) return false;

  return new Promise((resolve) => {
    try {
      const tx = db.transaction(STORE_NAME, "readwrite");
      const store = tx.objectStore(STORE_NAME);
      const req = store.put(value, key);

      req.onsuccess = () => {
        resolve(true);
      };

      req.onerror = (e) => {
        console.warn(`[IndexedDB] Set "${key}" failed:`, e);
        resolve(false);
      };
    } catch (err) {
      console.warn(`[IndexedDB] Transaction set error for "${key}":`, err);
      resolve(false);
    }
  });
}

export async function idbDel(key: string): Promise<boolean> {
  const db = await openDB();
  if (!db) return false;

  return new Promise((resolve) => {
    try {
      const tx = db.transaction(STORE_NAME, "readwrite");
      const store = tx.objectStore(STORE_NAME);
      const req = store.delete(key);

      req.onsuccess = () => resolve(true);
      req.onerror = () => resolve(false);
    } catch {
      resolve(false);
    }
  });
}

export async function idbClear(): Promise<boolean> {
  const db = await openDB();
  if (!db) return false;

  return new Promise((resolve) => {
    try {
      const tx = db.transaction(STORE_NAME, "readwrite");
      const store = tx.objectStore(STORE_NAME);
      const req = store.clear();

      req.onsuccess = () => resolve(true);
      req.onerror = () => resolve(false);
    } catch {
      resolve(false);
    }
  });
}
