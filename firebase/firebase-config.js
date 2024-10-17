import { initializeApp } from 'firebase/app';
import { initializeAuth, getReactNativePersistence } from 'firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: "AIzaSyBeZr0RwYv37DNycEMYxhkc1qiC_qNBAQU",
  authDomain: "recetas-instantaneas.firebaseapp.com",
  projectId: "recetas-instantaneas",
  storageBucket: "recetas-instantaneas.appspot.com",
  messagingSenderId: "980458678152",
  appId: "1:980458678152:web:4467cefda3b93f6edd3c3d"
};

const app = initializeApp(firebaseConfig);

const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage)
});

const storage = getStorage(app);
const db = getFirestore(app);

export { auth, storage, db };
