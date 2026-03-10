import { FirebaseApp, getApp, getApps, initializeApp } from 'firebase/app';
import { Database, getDatabase } from 'firebase/database';
const firebaseConfig = {
  apiKey: "AIzaSyBPRTHtJKPi460LU9p0hw6JI-hL_3EYQZU",
  authDomain: "gameanalyticsapp.firebaseapp.com",
  databaseURL: "https://gameanalyticsapp-default-rtdb.europe-west1.firebasedatabase.app/",
  projectId: "gameanalyticsapp",
  storageBucket: "gameanalyticsapp.firebasestorage.app",
  messagingSenderId: "133494441136",
  appId: "1:133494441136:web:337ce3de5f095983f12775"
};

let app: FirebaseApp;
let database: Database | null = null;

try {
  if (getApps().length === 0) {
    app = initializeApp(firebaseConfig);
    console.log('✅ Firebase başarıyla başlatıldı');
  } else {
    app = getApp();
    console.log('✅ Mevcut Firebase app kullanılıyor');
  }
  
  database = getDatabase(app);
  console.log('✅ Database bağlantısı kuruldu');
} catch (error) {
  console.error('❌ Firebase başlatma hatası:', error);
  database = null;
}

export { app, database };

