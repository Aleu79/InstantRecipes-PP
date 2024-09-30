import React, { useContext, useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native'; 
import { UserContext } from '../context/UserContext';
import { getFirestore, doc, getDoc } from 'firebase/firestore';

const db = getFirestore();

const SideMenu = ({ visible, onClose }) => {
  const navigation = useNavigation(); // Hook para manejar la navegación
  const { user } = useContext(UserContext); // Obtener el usuario del contexto

  console.log('Usuario:', user); // Verificar si el usuario está cargado

  const [username, setUsername] = useState('');

  useEffect(() => {
    const getUserData = async () => {
      console.log('getUserData llamado');
      const userRef = doc(db, 'users', user.email);
      console.log('userRef:', userRef);
      const userDoc = await getDoc(userRef);
      console.log('userDoc:', userDoc);
      const userData = userDoc.data();
      console.log('userData:', userData);
      if (userData) {
        console.log('userData tiene propiedades:', Object.keys(userData));
        if (userData['username']) {
          console.log('userData tiene propiedad username:', userData['username']);
          setUsername(userData['username']);
        } else {
          console.log('No se encontró la propiedad username en userData');
        }
      } else {
        console.log('No se encontró el documento del usuario en Firestore');
      }
    };
    getUserData();
  }, [user]);

  // Verificar si la información del usuario ha sido cargada
  if (!user) {
    return null; // Si no ha sido cargada, no mostrar nada
  }

  console.log('Username:', username); // Verificar si el username está cargado

  // Función para manejar la navegación a una ruta específica
  const handleNavigation = (route) => {
    onClose(); // Cierra el menú
    navigation.navigate(route); // Navega a la ruta especificada
  };

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.menuContainer}>
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Icon name="close" size={24} color="#333" />
          </TouchableOpacity>
          <View style={styles.userContainer}>
            <Icon name="person-circle-outline" size={50} color="#333" />
            <Text style={styles.username}>{username}</Text>
          </View>
          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => handleNavigation('UserProfile')} // Redirige a la pantalla de perfil
          >
            <Icon name="person-outline" size={20} color="#333" />
            <Text style={styles.menuText}>Perfil</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => handleNavigation('MyRecipes')} // Redirige a la pantalla de mis recetas
          >
            <Icon name="book-outline" size={20} color="#333" />
            <Text style={styles.menuText}>Mis recetas</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => handleNavigation('SavedItems')} // Redirige a la pantalla de guardados
          >
            <Icon name="bookmark-outline" size={20} color="#333" />
            <Text style={styles.menuText}>Guardados</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  menuContainer: {
    backgroundColor: '#F2F2F2',
    width: '70%',
    height: '100%',
    padding: 20,
  },
  closeButton: {
    alignSelf: 'flex-end',
  },
  userContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  username: {
    marginLeft: 10,
    fontSize: 18,
    color: '#333',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
  },
  menuText: {
    marginLeft: 10,
    fontSize: 16,
    color: '#333',
  },
});

export default SideMenu;