import { initializeApp } from 'firebase/app';
import { initializeAuth, getReactNativePersistence } from 'firebase/auth';
import { getStorage } from 'firebase/storage'; 
import AsyncStorage from '@react-native-async-storage/async-storage';

// configuración de Firebase
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

// Inicializa Firebase Storage
const storage = getStorage(app);

export { auth, storage };
