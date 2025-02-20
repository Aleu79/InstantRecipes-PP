import React, { createContext, useState, useEffect} from 'react';
import { auth } from '../../firebase/firebase-config'; 
import { getFirestore, doc, getDoc } from 'firebase/firestore';
import { signOut } from 'firebase/auth'; 
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Alert } from 'react-native';

const db = getFirestore();

export const UserContext = createContext();

export const UserProvider = ({ children, navigation }) => {
  const [user, setUser] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [readNotifications, setReadNotifications] = useState([]);
  const [unreadNotifications, setUnreadNotifications] = useState(0);


  useEffect(() => {
    const loadToken = async () => {
      const token = await AsyncStorage.getItem('userToken');
      if (token) {
        const user = auth.currentUser;
        if (user) {
          const userDoc = await getDoc(doc(db, 'users', user.email));
          const userData = userDoc.data();
          setUser({ email: user.email, username: userData.username, phone: userData.phone, token });
        }
      }
    };
  
    loadToken();
  
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (user) {
        const userDoc = await getDoc(doc(db, 'users', user.email));
        const userData = userDoc.data();
        const token = await user.getIdToken();
        setUser({ email: user.email, username: userData.username, phone: userData.phone, token });
      } else {
        setUser(null);
      }
    });
    return unsubscribe;
  }, []);
  
  const handleLogout = async (navigation) => {
    try {
      await signOut(auth);
      await AsyncStorage.removeItem('userToken');
      setUser(null);
      checkTokenAfterLogout();
      if (navigation) {
        navigation.navigate('Login');
      }
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
      Alert.alert('Error', 'No se pudo cerrar la sesión.');
    }
  };
  
  
  const checkTokenAfterLogout = async () => {
    const token = await AsyncStorage.getItem('userToken');
    console.log('Token después de cerrar sesión:', token); 
  };
  
  checkTokenAfterLogout();

  const addNotification = (title, body) => {
    const newNotification = {
      id: Date.now().toString(),
      title,
      body,
      date: new Date().toLocaleDateString('es-ES', { 
        day: '2-digit', 
        month: '2-digit', 
        year: 'numeric' 
      }) + ' ' + new Date().toLocaleTimeString([], { 
        hour: '2-digit', 
        minute: '2-digit', 
        hour12: false 
      }), 
      pinned: false,
    };
    setNotifications((prevNotifications) => [...prevNotifications, newNotification]);
  };
  // Función para contar las notificaciones no leídas
  const countUnreadNotifications = () => {
    setUnreadNotifications(notifications.filter(notification => !notification.read).length);
  };

  useEffect(() => {
    countUnreadNotifications();
  }, [notifications]);
  

  const removeNotification = (id) => {
    setNotifications((prevNotifications) => prevNotifications.filter(notification => notification.id !== id));
  };

  const clearNotifications = () => {
    setReadNotifications(notifications);
    setNotifications([]);
  };

  return (
    <UserContext.Provider value={{ user, setUser, notifications, addNotification, removeNotification, clearNotifications, handleLogout, setNotifications }}>
      {children}
    </UserContext.Provider>
  );
};
