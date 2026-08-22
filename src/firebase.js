import { initializeApp, getApps, getApp } from 'firebase/app';
import { getDatabase, ref, set, get, remove, onValue } from 'firebase/database';

// Firebase configuration from environment variables
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  databaseURL: import.meta.env.VITE_FIREBASE_DATABASE_URL,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

const hasFirebaseConfig = Boolean(
  firebaseConfig.apiKey &&
  (firebaseConfig.databaseURL || firebaseConfig.projectId)
);

let db = null;
if (hasFirebaseConfig) {
  try {
    const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
    db = getDatabase(app);
    console.log('🔥 Firebase Realtime Database initialized');
  } catch (err) {
    console.warn('⚠️ Firebase initialization failed, falling back to local sync:', err);
    db = null;
  }
} else {
  console.info('ℹ️ No Firebase credentials found. Running in local/multi-tab sync mode.');
}

// Local / BroadcastChannel fallback
const STORAGE_PREFIX = 'op_dj:';
const broadcastChannel = typeof window !== 'undefined' && 'BroadcastChannel' in window
  ? new BroadcastChannel('office_party_sync')
  : null;

const listeners = new Set();

const notifyListeners = () => {
  listeners.forEach((callback) => {
    try {
      callback();
    } catch (e) {
      console.error('Storage listener error:', e);
    }
  });
};

if (typeof window !== 'undefined') {
  if (broadcastChannel) {
    broadcastChannel.onmessage = () => {
      notifyListeners();
    };
  }

  window.addEventListener('storage', (e) => {
    if (e.key && (e.key.startsWith(STORAGE_PREFIX) || e.key.startsWith('song:') || e.key === 'now_playing')) {
      notifyListeners();
    }
  });
}

// Global Storage Interface matching App.jsx contract
export const storage = {
  async get(key) {
    if (db) {
      try {
        const snapshot = await get(ref(db, `data/${key}`));
        if (snapshot.exists()) {
          const val = snapshot.val();
          return { key, value: typeof val === 'string' ? val : JSON.stringify(val) };
        }
        return null;
      } catch (err) {
        console.warn(`Firebase get failed for ${key}, falling back to localStorage:`, err);
      }
    }

    try {
      const item = localStorage.getItem(STORAGE_PREFIX + key);
      return item !== null ? { key, value: item } : null;
    } catch (e) {
      console.error('localStorage get error:', e);
      return null;
    }
  },

  async set(key, value) {
    const stringValue = typeof value === 'string' ? value : JSON.stringify(value);

    if (db) {
      try {
        await set(ref(db, `data/${key}`), stringValue);
        return;
      } catch (err) {
        console.warn(`Firebase set failed for ${key}, falling back to localStorage:`, err);
      }
    }

    try {
      localStorage.setItem(STORAGE_PREFIX + key, stringValue);
      if (broadcastChannel) {
        broadcastChannel.postMessage({ type: 'UPDATE', key, timestamp: Date.now() });
      }
      notifyListeners();
    } catch (e) {
      console.error('localStorage set error:', e);
    }
  },

  async delete(key) {
    if (db) {
      try {
        await remove(ref(db, `data/${key}`));
        return;
      } catch (err) {
        console.warn(`Firebase delete failed for ${key}, falling back to localStorage:`, err);
      }
    }

    try {
      localStorage.removeItem(STORAGE_PREFIX + key);
      if (broadcastChannel) {
        broadcastChannel.postMessage({ type: 'DELETE', key, timestamp: Date.now() });
      }
      notifyListeners();
    } catch (e) {
      console.error('localStorage delete error:', e);
    }
  },

  async list(prefix = '') {
    if (db) {
      try {
        const snapshot = await get(ref(db, 'data'));
        if (snapshot.exists()) {
          const val = snapshot.val() || {};
          const keys = Object.keys(val).filter((k) => k.startsWith(prefix));
          return { keys };
        }
        return { keys: [] };
      } catch (err) {
        console.warn(`Firebase list failed, falling back to localStorage:`, err);
      }
    }

    try {
      const keys = [];
      for (let i = 0; i < localStorage.length; i++) {
        const fullKey = localStorage.key(i);
        if (fullKey && fullKey.startsWith(STORAGE_PREFIX)) {
          const realKey = fullKey.slice(STORAGE_PREFIX.length);
          if (realKey.startsWith(prefix)) {
            keys.push(realKey);
          }
        }
      }
      return { keys };
    } catch (e) {
      console.error('localStorage list error:', e);
      return { keys: [] };
    }
  },

  onUpdate(callback) {
    listeners.add(callback);

    let firebaseUnsubscribe = null;
    if (db) {
      try {
        const dataRef = ref(db, 'data');
        firebaseUnsubscribe = onValue(dataRef, () => {
          callback();
        });
      } catch (err) {
        console.warn('Firebase onValue listener error:', err);
      }
    }

    return () => {
      listeners.delete(callback);
      if (firebaseUnsubscribe) {
        firebaseUnsubscribe();
      }
    };
  },
};

// Bind to window for backwards compatibility with App.jsx
if (typeof window !== 'undefined') {
  window.storage = storage;
}

export default storage;
