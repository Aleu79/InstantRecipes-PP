import React, { useContext, useState, useEffect } from 'react';
import { 
  View, Text, TouchableOpacity, Image, StyleSheet, 
  ScrollView, Alert, Modal, ActivityIndicator 
} from 'react-native';
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
  // Contexto del usuario actual
  const { user } = useContext(UserContext);
  const navigation = useNavigation();

  // Estados para gestionar imagen, carga y límites de subida
  const [image, setImage] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [uploadTime, setUploadTime] = useState(0);
  const [uploadLimitReached, setUploadLimitReached] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);

  // Carga de la imagen de perfil al montar el componente
  useEffect(() => {
    const fetchUserImage = async () => {
      if (user) {
        const userDocRef = doc(db, 'users', user.email);
        const docSnap = await getDoc(userDocRef);
        if (docSnap.exists() && docSnap.data().myuserfoto) {
          setImage(docSnap.data().myuserfoto);
        }
      }
      setIsLoading(false);
    };
    fetchUserImage();
  }, [user]);

  // Cierre de sesión y redirección al login
  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigation.navigate('Login');
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
      Alert.alert('Error', 'No se pudo cerrar la sesión.');
    }
  };

  // Selección y subida de imagen desde la galería
  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permiso denegado', 'Se necesitan permisos para acceder a la galería.');
      return;
    }

    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      const selectedImage = result.assets[0];
      const response = await fetch(selectedImage.uri);
      const blob = await response.blob();
      const filename = 'profile_picture.jpg';
      const userEmailSafe = user.email.replace(/[@.]/g, (c) => c === '@' ? '%40' : '%2E');
      const imageRef = ref(storage, `users/${userEmailSafe}/${filename}`);

      try {
        const uploadTask = await uploadBytes(imageRef, blob);
        const url = await getDownloadURL(uploadTask.ref);
        setImage(url);

        const userDocRef = doc(db, 'users', user.email);
        await setDoc(userDocRef, { myuserfoto: url }, { merge: true });

        Alert.alert('Éxito', 'Imagen subida correctamente.');
      } catch (error) {
        Alert.alert('Error', 'No se pudo subir la imagen.');
      }
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <HeaderUserP />

      <View style={styles.profileContainer}>
        <TouchableOpacity onPress={() => setModalVisible(true)}>
          {isLoading ? (
            <ActivityIndicator size="large" color="#333" />
          ) : image ? (
            <Image source={{ uri: image }} style={styles.profileImage} />
          ) : (
            <Icon name="person-circle-outline" size={100} color="#333" />
          )}
        </TouchableOpacity>
        <Text style={styles.username}>{user ? user.username : 'Invitado'}</Text>
        <Text style={styles.userEmail}>{user ? user.email : 'emma.phillips@gmail.com'}</Text>
        {uploadTime > 0 && <Text style={styles.uploadTime}>Tiempo restante: {Math.ceil(uploadTime)}s</Text>}
      </View>

      <View style={styles.separator} />

      <View style={styles.menuContainer}>
        <TouchableOpacity style={styles.menuItem} onPress={() => navigation.navigate('SavedRecipes')}>
          <Icon name="bookmark-outline" size={24} color="#333" />
          <Text style={styles.menuText}>Guardados</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuItem} onPress={() => navigation.navigate('MyRecipes')}>
          <Icon name="cafe-outline" size={24} color="#333" />
          <Text style={styles.menuText}>Tus recetas</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.menuItem} 
          onPress={() => navigation.navigate('Terminos')}
        >
          <Icon name="document-text-outline" size={24} color="#333" />
          <Text style={styles.menuText}>Términos y Condiciones</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.menuItem} onPress={handleLogout}>
          <Icon name="log-out-outline" size={24} color="#333" />
          <Text style={styles.menuText}>Cerrar sesión</Text>
        </TouchableOpacity>
      </View>

      <BottomNavBar navigation={navigation} />

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <TouchableOpacity style={styles.modalBackground} onPress={() => setModalVisible(false)} />
          <View style={styles.modalContent}>
            <Image source={{ uri: image }} style={styles.modalImage} />
            <TouchableOpacity style={styles.editIconContainer} onPress={pickImage}>
              <Icon name="pencil" size={24} color="#333" />
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
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
    marginBottom: 10,
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderColor: '#ccc',
    borderWidth: 1,
  },
  separator: {
    height: 1,
    backgroundColor: '#ccc',
    marginVertical: 20,
  },
  menuContainer: {
    marginVertical: 20,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
  },
  menuText: {
    marginLeft: 10,
    fontSize: 18,
  },
});

export default UserProfile;
