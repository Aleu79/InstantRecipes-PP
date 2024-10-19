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
import { storage, db, auth } from '../../../firebase/firebase-config';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import HeaderUserP from '../Headers/HeaderUserP';
import { signOut } from 'firebase/auth';
import BottomNavBar from '../BottomNavbar';

const UserProfile = () => {
  const { user } = useContext(UserContext);
  const navigation = useNavigation();

  const [image, setImage] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);

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

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigation.navigate('Login');
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
      Alert.alert('Error', 'No se pudo cerrar la sesión.');
    }
  };

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

      const userEmailSafe = user.email.replace(/[@.]/g, (c) => (c === '@' ? '%40' : '%2E'));
      const imageRef = ref(storage, `users/${userEmailSafe}/${filename}`);

      try {
        console.log("Subiendo imagen...", { uri: selectedImage.uri, blob });

        const userDocRef = doc(db, 'users', user.email);
        const userDocSnap = await getDoc(userDocRef);
        
        // Crear el documento si no existe
        if (!userDocSnap.exists()) {
          await setDoc(userDocRef, { email: user.email }, { merge: true });
        }

        // Subir la imagen y obtener la URL
        const uploadTask = await uploadBytes(imageRef, blob);
        const url = await getDownloadURL(uploadTask.ref);
        setImage(url);
        await setDoc(userDocRef, { myuserfoto: url }, { merge: true });

        Alert.alert('Éxito', 'Imagen subida correctamente.');
      } catch (error) {
        console.error('Error al subir la imagen:', error);
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

        <TouchableOpacity style={styles.menuItem} onPress={() => navigation.navigate('Notifications')}>
          <Icon name="mail-outline" size={24} color="#333" />
          <Text style={styles.menuText}>Bandeja de Notificaciones</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuItem} onPress={() => navigation.navigate('Settings')}>
          <Icon name="settings-outline" size={24} color="#333" />
          <Text style={styles.menuText}>Ajustes</Text>
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
              <View style={styles.editIconBackground}>
                <Icon name="pencil" size={24} color="#A9A9A9" /> 
              </View>
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
  username: {
    fontSize: 22, 
    fontWeight: 'bold',
    marginTop: 10,
  },
  profileContainer: {
    alignItems: 'center',
    marginBottom: 10,
  },
  profileImage: {
    width: 120, 
    height: 120, 
    borderRadius: 60, 
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
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: 'transparent',
    alignItems: 'center',
  },
  modalImage: {
    width: 300,
    height: 300,
    borderRadius: 150, 
    overflow: 'hidden',
  },
  editIconContainer: {
    position: 'absolute',
    bottom: 10,
    right: 10,
    backgroundColor: 'transparent',
    borderRadius: 50,
    padding: 10,
  },
  editIconBackground: {
    backgroundColor: 'black', // Fondo negro redondeado
    borderRadius: 50,
    padding: 8,
  },
});

export default UserProfile;
