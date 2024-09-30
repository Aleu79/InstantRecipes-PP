import React, { useContext, useState } from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet, ScrollView, Alert } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { UserContext } from '../context/UserContext';
import { useNavigation } from '@react-navigation/native';
import * as ImagePicker from 'expo-image-picker'; // Importar ImagePicker
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage'; // Importar métodos de Firebase Storage
import { storage } from '../../firebase/firebase-config'; // Asegúrate de que el path sea correcto

const UserProfile = () => {
  const { user } = useContext(UserContext);
  const navigation = useNavigation();
  const [image, setImage] = useState(null);

  const pickImage = async () => {
    // Solicitar permisos para la galería
    const { status: mediaLibraryStatus } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (mediaLibraryStatus !== 'granted') {
      console.log('Permiso de galería no concedido:', mediaLibraryStatus);
      alert('Lo sentimos, necesitamos permisos para acceder a la galería.');
      return;
    }

    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    console.log('Resultado de la selección de imagen:', result);

    if (result.assets && result.assets.length > 0) {
      const selectedImage = result.assets[0];
      console.log('URI de la imagen seleccionada:', selectedImage.uri);

      // Subir la imagen a Firebase Storage
      const response = await fetch(selectedImage.uri);
      const blob = await response.blob();

      const filename = selectedImage.uri.substring(selectedImage.uri.lastIndexOf('/') + 1);
      const imageRef = ref(storage, `profileImages/${filename}`); // Asegúrate de que la carpeta sea correcta

      try {
        await uploadBytes(imageRef, blob);
        const url = await getDownloadURL(imageRef);
        console.log('URL de la imagen subida:', url);
        setImage(url); // Actualiza el estado con la URL de la imagen subida
      } catch (error) {
        console.error('Error al subir la imagen:', error);
        Alert.alert('Error', 'No se pudo subir la imagen.'); // Mostrar un mensaje de error
      }
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.iconsContainer}>
        <TouchableOpacity style={styles.backIcon} onPress={() => navigation.goBack()}>
          <Icon name="chevron-back" size={26} color="#333" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.editIcon} onPress={() => navigation.navigate('UserEdit')}>
          <Icon name="pencil" size={26} color="#333" />
        </TouchableOpacity>
      </View>
      <View style={styles.profileContainer}>
        <TouchableOpacity onPress={pickImage}> 
          {image ? (
            <Image source={{ uri: image }} style={styles.profileImage} />
          ) : (
            <Icon name="person-circle-outline" size={100} color="#333" />
          )}
        </TouchableOpacity>
        <Text style={styles.username}>{user ? user.username : 'Invitado'}</Text>
        <Text style={styles.userEmail}>{user ? user.email : 'emma.phillips@gmail.com'}</Text>
      </View>
      <View style={styles.menuContainer}>
        <TouchableOpacity style={styles.menuItem} onPress={() => navigation.navigate('SavedRecipes')}>
          <Icon name="bookmark-outline" size={24} color="#333" />
          <Text style={styles.menuText}>Guardados</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.menuItem} onPress={() => navigation.navigate('MyRecipes')}>
          <Icon name="cafe-outline" size={24} color="#333" />
          <Text style={styles.menuText}>Tus recetas</Text>
        </TouchableOpacity>
        {/* <TouchableOpacity style={styles.menuItem}>
          <Icon name="settings-outline" size={24} color="#333" />
          <Text style={styles.menuText}>Ajustes</Text>
        </TouchableOpacity> */}
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
