import React, { useContext, useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet, ScrollView, Alert } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { UserContext } from '../../context/UserContext';
import { useNavigation } from '@react-navigation/native';
import * as ImagePicker from 'expo-image-picker'; 
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage'; 
import { storage } from '../../../firebase/firebase-config'; 
import { doc, getDoc, setDoc } from 'firebase/firestore'; 
import HeaderUserP from '../Headers/HeaderUserP';
import { signOut } from 'firebase/auth';
import { auth, db } from '../../../firebase/firebase-config'; 
import BottomNavBar from '../BottomNavbar';

const UserProfile = () => {
  const { user } = useContext(UserContext);
  const navigation = useNavigation();
  const [image, setImage] = useState(null);

  useEffect(() => {
    const fetchUserImage = async () => {
      if (user) {
        const userDocRef = doc(db, 'users', user.email);
        const docSnap = await getDoc(userDocRef);
        
        if (docSnap.exists()) {
          const userData = docSnap.data();
          if (userData.myuserfoto) {
            setImage(userData.myuserfoto);
          }
        }
      }
    };

    fetchUserImage();
  }, [user]);

  const pickImage = async () => {
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

      const response = await fetch(selectedImage.uri);
      const blob = await response.blob();

      const filename = selectedImage.uri.substring(selectedImage.uri.lastIndexOf('/') + 1);
      const imageRef = ref(storage, `profileImages/${filename}`); 

      try {
        await uploadBytes(imageRef, blob);
        const url = await getDownloadURL(imageRef);
        console.log('URL de la imagen subida:', url);
        setImage(url); 
        if (user) {
          const userDocRef = doc(db, 'users', user.email); 
          await setDoc(userDocRef, { myuserfoto: url }, { merge: true });
          Alert.alert('Éxito', 'La imagen se subió y guardó correctamente.');
        } else {
          Alert.alert('Error', 'Usuario no autenticado.');
        }
      } catch (error) {
        console.error('Error al subir la imagen:', error);
        Alert.alert('Error', 'No se pudo subir la imagen.'); 
      }
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigation.navigate('Login');
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
      Alert.alert('Error', 'No se pudo cerrar la sesión.');
    }
  };
  
  return (
    <ScrollView contentContainerStyle={styles.container}>
      <HeaderUserP />
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
        <TouchableOpacity style={styles.menuItem} onPress={handleLogout}>
          <Icon name="log-out-outline" size={24} color="#333" />
          <Text style={styles.menuText}>Cerrar sesión</Text>
        </TouchableOpacity>
      </View>
      <BottomNavBar navigation={navigation} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: '#fafafa',
    padding: 20,
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
});

export default UserProfile;
