import React, { createContext, useState, useEffect } from 'react';
import { auth } from '../../firebase/firebase-config'; 
import { getFirestore, doc, getDoc } from 'firebase/firestore';

const db = getFirestore();

export const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  

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

  return (
    <UserContext.Provider value={{ user, setUser }}>
      {children}
    </UserContext.Provider>
  );
};