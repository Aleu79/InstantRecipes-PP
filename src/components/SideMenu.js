// SideMenu.js
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native'; // Importar el hook de navegación

const SideMenu = ({ visible, onClose }) => {
  const navigation = useNavigation(); // Hook para manejar la navegación

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
            <Text style={styles.username}>User_203754</Text>
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
