import { FirebaseApp, getApp, getApps, initializeApp } from 'firebase/app';
import { Database, getDatabase } from 'firebase/database';
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_AUTH_DOMAIN",
  databaseURL: "YOUR_DATABASE_URL",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_STORAGE_BUCKET",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID"
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

