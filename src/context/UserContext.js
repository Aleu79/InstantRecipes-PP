import React, { createContext, useState, useEffect } from 'react';
import { auth } from '../../firebase/firebase-config'; 
import { getFirestore, doc, getDoc } from 'firebase/firestore';

const db = getFirestore();

export const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [readNotifications, setReadNotifications] = useState([]);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (user) {
        const userDoc = await getDoc(doc(db, 'users', user.email));
        const userData = userDoc.data();
        setUser({ email: user.email, username: userData.username, phone: userData.phone });
      } else {
        setUser(null);
      }
    });
    return unsubscribe;
  }, []);

  const addNotification = (title, body) => {
    const newNotification = {
      id: Date.now().toString(),
      title,
      body,
      date: new Date().toLocaleString(), 
      pinned: false,
    };
    setNotifications((prevNotifications) => [...prevNotifications, newNotification]);
  };

  const removeNotification = (id) => {
    setNotifications((prevNotifications) => prevNotifications.filter(notification => notification.id !== id));
  };

  const clearNotifications = () => {
    setReadNotifications(notifications); 
    setNotifications([]); 
  };

  return (
    <UserContext.Provider value={{ user, setUser, notifications, addNotification, removeNotification, clearNotifications }}>
      {children}
    </UserContext.Provider>
  );
};
