import React, { useContext, useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet, ScrollView, Alert, Modal, ActivityIndicator } from 'react-native';
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
  const [isLoading, setIsLoading] = useState(true); // Estado para el indicador de carga
  const [uploadTime, setUploadTime] = useState(0);
  const [uploadLimitReached, setUploadLimitReached] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);

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
      setIsLoading(false); // Dejar de cargar una vez que la imagen ha sido traída
    };

    fetchUserImage();
  }, [user]);

  const checkUploadLimit = async () => {
    const userEmailSafe = user.email.replace(/[@.]/g, (c) => (c === '@' ? '%40' : '%2E'));
    const uploadsRef = doc(db, 'uploads', userEmailSafe);
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth();

    const docSnap = await getDoc(uploadsRef);

    if (docSnap.exists()) {
      const data = docSnap.data();

      if (data.lastUploadMonth !== currentMonth) {
        await setDoc(uploadsRef, {
          uploadCount: 1,
          lastUploadMonth: currentMonth,
        });
        return true;
      }

      if (data.uploadCount < 3) {
        await setDoc(uploadsRef, {
          uploadCount: data.uploadCount + 1,
          lastUploadMonth: currentMonth,
        });
        return true;
      } else {
        Alert.alert('Límite alcanzado', 'Solo puedes subir hasta 3 archivos por mes.');
        setUploadLimitReached(true);
        return false;
      }
    } else {
      await setDoc(uploadsRef, {
        uploadCount: 1,
        lastUploadMonth: currentMonth,
      });
      return true;
    }
  };

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      console.log('Permiso de galería no concedido:', status);
      Alert.alert('Permiso denegado', 'Lo sentimos, necesitamos permisos para acceder a la galería.');
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

      const allowed = await checkUploadLimit();
      if (!allowed) return;

      const response = await fetch(selectedImage.uri);
      const blob = await response.blob();

      const filename = 'profile_picture.jpg';
      const userEmailSafe = user.email.replace(/[@.]/g, (c) => (c === '@' ? '%40' : '%2E'));
      const imageRef = ref(storage, `users/${userEmailSafe}/${filename}`);

      try {
        const startTime = Date.now();
        const uploadTask = uploadBytes(imageRef, blob);

        uploadTask.on(
          'state_changed',
          (snapshot) => {
            const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
            console.log(`Progreso de subida: ${progress}%`);
            const elapsedTime = (Date.now() - startTime) / 1000;
            const totalTime = (snapshot.totalBytes / snapshot.bytesTransferred) * elapsedTime;
            setUploadTime(Math.max(0, totalTime - elapsedTime));
          },
          (error) => {
            console.error('Error al subir la imagen:', error);
            Alert.alert('Error', 'No se pudo subir la imagen. Verifica los permisos y el estado de la conexión.');
          },
          async () => {
            const url = await getDownloadURL(imageRef);
            console.log('URL de la imagen subida:', url);
            setImage(url);
            if (user) {
              const userDocRef = doc(db, 'users', user.email);
              await setDoc(userDocRef, { myuserfoto: url }, { merge: true });
              Alert.alert('Éxito', 'La imagen se subió y guardó correctamente.');
              setUploadTime(0);
            } else {
              Alert.alert('Error', 'Usuario no autenticado.');
            }
          }
        );
      } catch (error) {
        console.error('Error al iniciar la subida:', error);
        Alert.alert('Error', 'No se pudo iniciar la subida de la imagen.');
      }
    } else {
      Alert.alert('Error', 'No se seleccionó ninguna imagen.');
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
        <TouchableOpacity onPress={() => setModalVisible(true)}>
          {isLoading ? ( // Mostrar el indicador de carga si isLoading es verdadero
            <ActivityIndicator size="large" color="#333" />
          ) : image ? (
            <Image source={{ uri: image }} style={styles.profileImage} />
          ) : (
            <Icon name="person-circle-outline" size={100} color="#333" />
          )}
        </TouchableOpacity>
        <Text style={styles.username}>{user ? user.username : 'Invitado'}</Text>
        <Text style={styles.userEmail}>{user ? user.email : 'emma.phillips@gmail.com'}</Text>
        {uploadTime > 0 && (
          <Text style={styles.uploadTime}>Tiempo restante: {Math.ceil(uploadTime)}s</Text>
        )}
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
    marginBottom: 30,
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderColor: '#ccc',
    borderWidth: 1,
  },
  username: {
    fontSize: 24,
    fontWeight: 'bold',
    marginVertical: 10,
  },
  userEmail: {
    fontSize: 16,
    color: '#777',
  },
  uploadTime: {
    fontSize: 14,
    color: '#f00',
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
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 20,
    alignItems: 'center',
  },
  modalImage: {
    width: 300,
    height: 300,
    borderRadius: 15,
    marginBottom: 20,
  },
  editIconContainer: {
    position: 'absolute',
    bottom: 10,
    right: 10,
    backgroundColor: '#fff',
    padding: 5,
    borderRadius: 50,
    elevation: 2,
  },
});

export default UserProfile;
 