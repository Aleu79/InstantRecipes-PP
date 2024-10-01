import React, { useContext, useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Modal } from 'react-native';
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
      presentationStyle="overFullScreen"
    >
      <View className="flex-1 bg-black/50">
        <View className="bg-[#F2F2F2] w-[70%] h-full p-5">
          <TouchableOpacity className="self-end" onPress={onClose}>
            <Icon name="close" size={24} color="#333" />
          </TouchableOpacity>
          <View className="flex-row items-center mb-5">
            <Icon name="person-circle-outline" size={50} color="#333" />
            <Text className="ml-3 text-lg text-[#333]">{username}</Text>
          </View>
          <TouchableOpacity
            className="flex-row items-center py-4"
            onPress={() => handleNavigation('UserProfile')}
          >
            <Icon name="person-outline" size={20} color="#333" />
            <Text className="ml-3 text-base text-[#333]">Perfil</Text>
          </TouchableOpacity>
          <TouchableOpacity
            className="flex-row items-center py-4"
            onPress={() => handleNavigation('MyRecipes')}
          >
            <Icon name="book-outline" size={20} color="#333" />
            <Text className="ml-3 text-base text-[#333]">Mis recetas</Text>
          </TouchableOpacity>
          <TouchableOpacity
            className="flex-row items-center py-4"
            onPress={() => handleNavigation('SavedRecipes')}
          >
            <Icon name="bookmark-outline" size={20} color="#333" />
            <Text className="ml-3 text-base text-[#333]">Guardados</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

export default SideMenu;
