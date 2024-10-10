import React, { useContext, useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ScrollView, Image } from 'react-native';
import { auth } from '../../../firebase/firebase-config';
import { useNavigation } from '@react-navigation/native';
import { updatePassword, updateProfile } from 'firebase/auth';
import { UserContext } from '../../context/UserContext';
import Icon from 'react-native-vector-icons/Ionicons';
import Header from '../Headers/Header';
import { getFirestore, doc, updateDoc, getDoc } from 'firebase/firestore';
import BottomNavBar from '../BottomNavbar';

const UserEdit = () => {
  const { user, setUser } = useContext(UserContext);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [profileImage, setProfileImage] = useState(null); 
  const navigation = useNavigation();
  const db = getFirestore();

  useEffect(() => {
    const handleUpdateProfile = async () => {
      const currentUser = auth.currentUser;

      if (currentUser) {
        setUsername(currentUser.displayName || ''); 
        const userRef = doc(db, 'users', currentUser.email);
        const userDoc = await getDoc(userRef);

        if (userDoc.exists()) {
          const userData = userDoc.data();
          setProfileImage(userData.myuserfoto || null); 
        }
      }
    };

    handleUpdateProfile();
  }, []);

  const handleSaveChanges = async () => {
    const currentUser = auth.currentUser;
  
    if (password && password !== confirmPassword) {
      Alert.alert('Error', 'Las contraseñas no coinciden');
      return;
    }
  
    try {
      if (username) {
        const userRef = doc(db, 'users', currentUser.email);
        await updateDoc(userRef, { username });
        await updateProfile(currentUser, { displayName: username });
  
        // Actualiza el estado global del usuario en el contexto
        setUser((prevUser) => ({
          ...prevUser,
          username,  // Actualiza el nombre de usuario en el contexto
        }));
  
        Alert.alert('Éxito', 'Nombre de usuario actualizado');
      }
  
      if (password) {
        await updatePassword(currentUser, password);
        Alert.alert('Éxito', 'Contraseña actualizada');
      }
  
      navigation.navigate('UserProfile');
    } catch (error) {
      console.error('Error al actualizar perfil:', error);
      let errorMessage;
  
      switch (error.code) {
        case 'auth/weak-password':
          errorMessage = 'La contraseña debe tener al menos 6 caracteres.';
          break;
        case 'auth/requires-recent-login':
          errorMessage = 'Debes iniciar sesión nuevamente para realizar este cambio.';
          break;
        default:
          errorMessage = error.message;
      }
  
      Alert.alert('Error', errorMessage);
    }
  };
  

  const handleDeleteProfile = async () => {
    const user = auth.currentUser;

    if (user) {
      try {
        await user.delete();
        Alert.alert('Perfil eliminado con éxito');
        navigation.navigate('Login');
      } catch (error) {
        console.error('Error al eliminar perfil:', error);
        Alert.alert('Error', error.message);
      }
    } else {
      Alert.alert('Error', 'No hay usuario autenticado');
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Header/>

      <View style={styles.titulocontainer}>
        <View style={styles.textContainer}>
          <Text style={styles.title}>
            Hola, <Text style={styles.username}>{user ? user.username || 'Usuario' : 'Invitado'}!</Text>
          </Text>
        </View>
        <View style={styles.imgprofile}>
          {profileImage ? (
            <Image source={{ uri: profileImage }} style={styles.profileImage} />
          ) : (
            <Icon name="person-circle-outline" size={80} color="#333" />
          )}
        </View>
      </View>

      <View style={styles.camposcontainer}>
        <Text style={styles.sectionTitle}>Nuevo nombre de usuario</Text>
        <TextInput
          placeholder="Nuevo nombre de usuario"
          style={styles.input}
          value={username}
          onChangeText={setUsername}
        />

        <Text style={styles.sectionTitle}>Nueva contraseña</Text>
        <TextInput
          placeholder="Nueva contraseña"
          style={styles.input}
          secureTextEntry
          value={password}
          onChangeText={setPassword}
        />

        <TextInput
          placeholder="Repetir nueva contraseña"
          style={styles.input}
          secureTextEntry
          value={confirmPassword}
          onChangeText={setConfirmPassword}
        />

        <TouchableOpacity style={styles.saveButton} onPress={handleSaveChanges}>
          <Text style={styles.saveButtonText}>Guardar cambios</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={styles.deleteButton} onPress={handleDeleteProfile}>
        <Text style={styles.deleteButtonText}>Eliminar perfil</Text>
      </TouchableOpacity>
      
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
  titulocontainer: {
    flexDirection: 'row',
    alignItems: 'center', 
    justifyContent: 'space-between', 
    marginBottom: 20,
  },
  textContainer: {
    flex: 1, 
  },
  title: {
    fontSize: 30,
    fontWeight: '500',
    color: '#333',
  },
  username: {
    fontWeight: 'bold',
  },
  imgprofile: {
    marginLeft: 20, 
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  camposcontainer: {
    width: '90%',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
    marginHorizontal: 'auto',
    marginTop: 20,
  },
  sectionTitle: {
    fontSize: 18,
    marginBottom: 10,
    color: '#333',
    alignSelf: 'flex-start',
  },
  input: {
    backgroundColor: '#FFF',
    borderRadius: 40,
    padding: 12,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#e9e9e9',
    width: '100%',
  },
  saveButton: {
    backgroundColor: '#388E3C',
    borderRadius: 40,
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 20,
    width: '100%',
  },
  saveButtonText: {
    color: '#FFF',
    fontSize: 16,
  },
  deleteButton: {
    borderRadius: 40,
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 10,
    width: '100%',
  },
  deleteButtonText: {
    color: '#8B0000',
    fontSize: 16,
  },
});

export default UserEdit;
