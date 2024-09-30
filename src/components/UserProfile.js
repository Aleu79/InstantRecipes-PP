import React, { useContext, useState } from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet, ScrollView } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { UserContext } from '../context/UserContext';
import { useNavigation } from '@react-navigation/native';

const UserProfile = () => {
  const { user } = useContext(UserContext);
  const navigation = useNavigation();
  const [image, setImage] = useState(null);

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* Íconos de editar y retroceder */}
      <View style={styles.iconsContainer}>
        <TouchableOpacity style={styles.backIcon} onPress={() => navigation.goBack()}>
          <Icon name="chevron-back" size={26} color="#333" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.editIcon} onPress={() => navigation.navigate('UserEdit')}>
          <Icon name="pencil" size={26} color="#333" />
        </TouchableOpacity>
      </View>

      {/* Contenedor del perfil */}
      <View style={styles.profileContainer}>
        <TouchableOpacity>
          {image ? (
            <Image source={{ uri: image }} style={styles.profileImage} />
          ) : (
            <Icon name="person-circle-outline" size={100} color="#333" />
          )}
        </TouchableOpacity>
        <Text style={styles.username}>{user ? user.username : 'Invitado'}</Text>
        <Text style={styles.userEmail}>{user ? user.email : 'emma.phillips@gmail.com'}</Text>
      </View>

      {/* Opciones del menú */}
      <View style={styles.menuContainer}>
        <TouchableOpacity style={styles.menuItem} onPress={() => navigation.navigate('SavedRecipes')}>
          <Icon name="bookmark-outline" size={24} color="#333" />
          <Text style={styles.menuText}>Guardados</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.menuItem} onPress={() => navigation.navigate('MyRecipes')}>
          <Icon name="cafe-outline" size={24} color="#333" />
          <Text style={styles.menuText}>Tus recetas</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.menuItem}>
          <Icon name="settings-outline" size={24} color="#333" />
          <Text style={styles.menuText}>Ajustes</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.menuItem}>
          <Icon name="log-out-outline" size={24} color="#333" />
          <Text style={styles.menuText}>Cerrar sesión</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: '#fafafa',
    padding: 20,
  },
  iconsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 50,
    marginTop: 6,
    position: 'static',
  },
  profileContainer: {
    alignItems: 'center',
    marginBottom: 30,
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 15,
  },
  username: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  userEmail: {
    fontSize: 14,
    color: '#666',
  },
  walletContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
    paddingHorizontal: 20,
    backgroundColor: '#f5f5f5',
    borderRadius: 10,
    marginBottom: 20,
  },
  walletText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  ordersText: {
    fontSize: 18,
    color: '#666',
  },
  menuContainer: {
    borderTopWidth: 1,
    borderTopColor: '#eaeaea',
    paddingTop: 20,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eaeaea',
  },
  menuText: {
    fontSize: 16,
    marginLeft: 15,
    color: '#333',
  },
  backIcon: {
    position: 'absolute',
    top: 10,
    left: 10,
  },
  editIcon: {
    position: 'absolute',
    top: 10,
    right: 10,
  },
});

export default UserProfile;
