// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from 'firebase/firestore';

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: process.env.API_KEY,
  authDomain: process.env.AUTH_DOMAIN,
  projectId: process.env.PROJECT_ID,
  storageBucket: process.env.STORAGE_BUCKET,
  messagingSenderId: process.env.MESSAGING_SENDER_ID,
  appId: process.env.APP_ID
};

export class FirebaseConfiguration {
  static _app = null;
  static _db = null;

  get app() {
    if (FirebaseConfiguration._app === null) {
      FirebaseConfiguration._app = initializeApp(firebaseConfig);
    }
    return FirebaseConfiguration._app;
  }

  get db() {
    if (FirebaseConfiguration._db === null) {
      FirebaseConfiguration._db = getFirestore(this.app);
    }
    return FirebaseConfiguration._db;
  }
}
