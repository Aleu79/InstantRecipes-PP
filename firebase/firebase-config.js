// firebase/firebase-config.js

import { initializeApp } from 'firebase/app';
import { initializeAuth, getReactNativePersistence } from 'firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Tu configuración de Firebase
const firebaseConfig = {
  apiKey: "AIzaSyBeZr0RwYv37DNycEMYxhkc1qiC_qNBAQU",
  authDomain: "recetas-instantaneas.firebaseapp.com",
  projectId: "recetas-instantaneas",
  storageBucket: "recetas-instantaneas.appspot.com",
  messagingSenderId: "980458678152",
  appId: "1:980458678152:web:4467cefda3b93f6edd3c3d"
};

// Inicializa Firebase
const app = initializeApp(firebaseConfig);

// Configura la autenticación con persistencia
const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage)
});

export { auth };
