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
  const [uploadTime, setUploadTime] = useState(0); // Tiempo restante para subir
  const [uploadLimitReached, setUploadLimitReached] = useState(false);

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

  const checkUploadLimit = async () => {
    const userEmailSafe = user.email.replace(/[@.]/g, (c) => (c === '@' ? '%40' : '%2E'));
    const uploadsRef = doc(db, 'uploads', userEmailSafe);
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth(); // 0 = Enero, 1 = Febrero, etc.

    const docSnap = await getDoc(uploadsRef);

    if (docSnap.exists()) {
      const data = docSnap.data();

      // Si el mes actual es diferente al mes de la última subida, reinicia el contador
      if (data.lastUploadMonth !== currentMonth) {
        await setDoc(uploadsRef, {
          uploadCount: 1,
          lastUploadMonth: currentMonth,
        });
        return true; // Permitir subida
      }

      // Comprobar el límite de subidas
      if (data.uploadCount < 3) {
        await setDoc(uploadsRef, {
          uploadCount: data.uploadCount + 1,
          lastUploadMonth: currentMonth,
        });
        return true; // Permitir subida
      } else {
        Alert.alert('Límite alcanzado', 'Solo puedes subir hasta 3 archivos por mes.');
        setUploadLimitReached(true);
        return false; // No permitir subida
      }
    } else {
      // Si no hay documento, permite la subida y crea uno
      await setDoc(uploadsRef, {
        uploadCount: 1,
        lastUploadMonth: currentMonth,
      });
      return true; // Permitir subida
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

      // Verificar el límite de subidas
      const allowed = await checkUploadLimit();
      if (!allowed) return; // Si no se permite, salir de la función

      const response = await fetch(selectedImage.uri);
      const blob = await response.blob();

      const filename = 'profile_picture.jpg'; // Sobrescribir siempre con el mismo nombre
      const userEmailSafe = user.email.replace(/[@.]/g, (c) => (c === '@' ? '%40' : '%2E'));
      const imageRef = ref(storage, `users/${userEmailSafe}/${filename}`);

      try {
        const startTime = Date.now();
        const uploadTask = uploadBytes(imageRef, blob);
        
        // Manejo del progreso de subida
        uploadTask.on(
          'state_changed',
          (snapshot) => {
            const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
            console.log(`Progreso de subida: ${progress}%`);
            // Calcular el tiempo restante
            const elapsedTime = (Date.now() - startTime) / 1000; // En segundos
            const totalTime = (snapshot.totalBytes / snapshot.bytesTransferred) * elapsedTime;
            setUploadTime(Math.max(0, totalTime - elapsedTime)); // Tiempo restante
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
              setUploadTime(0); // Reiniciar el tiempo
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
        <TouchableOpacity onPress={pickImage}> 
          {image ? (
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
  uploadTime: {
    fontSize: 16,
    color: '#f00',
    marginTop: 10,
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
    fontSize: 18,
    marginLeft: 10,
    color: '#333',
  },
});

export default UserProfile;
