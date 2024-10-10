import React, { useContext, useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ScrollView, Image } from 'react-native';
import { auth } from '../../../firebase/firebase-config';
import { useNavigation } from '@react-navigation/native';
import { updatePassword, updateProfile, EmailAuthProvider, reauthenticateWithCredential } from 'firebase/auth';
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
  const [currentPassword, setCurrentPassword] = useState(''); 
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [profileImage, setProfileImage] = useState(null);
  const [initialLoad, setInitialLoad] = useState(true);
  const navigation = useNavigation();
  const db = getFirestore();

  useEffect(() => {
    const handleUpdateProfile = async () => {
      const currentUser = auth.currentUser;

      if (currentUser) {
        if (initialLoad) {
          setUsername(currentUser.displayName || ''); 
          setInitialLoad(false); 
        }
        const userRef = doc(db, 'users', currentUser.email);
        const userDoc = await getDoc(userRef);

        if (userDoc.exists()) {
          const userData = userDoc.data();
          setProfileImage(userData.myuserfoto || null); 
        }
      }
    };

    handleUpdateProfile();
  }, [initialLoad, db]);

  const reauthenticateUser = async (currentPassword) => {
    const currentUser = auth.currentUser;
    const credential = EmailAuthProvider.credential(currentUser.email, currentPassword);

    try {
      await reauthenticateWithCredential(currentUser, credential);
      console.log('Reautenticación exitosa');
    } catch (error) {
      console.error('Error en la reautenticación:', error);
      throw error;
    }
  };

  const handleSaveChanges = async () => {
    const currentUser = auth.currentUser;
  
    if (password && password !== confirmPassword) {
      Alert.alert('Error', 'Las contraseñas no coinciden');
      return;
    }
  
    try {
      if (password) {
        await reauthenticateUser(currentPassword);
      }
  
      // Solo actualizar el username si hay cambios
      if (username && username !== currentUser.displayName) {
        const userRef = doc(db, 'users', currentUser.email);
        
        // Actualiza el nombre en Firestore
        await updateDoc(userRef, { username });
  
        // Actualiza el displayName en Firebase Authentication
        await updateProfile(currentUser, { displayName: username });
        
        // Actualiza el contexto del usuario
        setUser((prevUser) => ({
          ...prevUser,
          username,  
        }));
  
        Alert.alert('Éxito', 'Nombre de usuario actualizado');
      }
  
      if (password) {
        await updatePassword(currentUser, password);
        Alert.alert('Éxito', 'Contraseña actualizada');
      }
  
      // Restablecer los campos
      setUsername('');
      setPassword('');
      setConfirmPassword('');
      setCurrentPassword('');
  
      // Navegar a la pantalla de perfil
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

        <Text style={styles.sectionTitle}>Contraseña actual</Text>
        <View style={styles.passwordContainer}>
          <TextInput
            placeholder="Contraseña actual"
            style={styles.input}
            secureTextEntry={!showCurrentPassword}
            value={currentPassword}
            onChangeText={setCurrentPassword}
          />
          <TouchableOpacity style={styles.eyeIcon} onPress={() => setShowCurrentPassword(!showCurrentPassword)}>
            <Icon name={showCurrentPassword ? 'eye-off' : 'eye'} size={24} />
          </TouchableOpacity>
        </View>

        <Text style={styles.sectionTitle}>Nueva contraseña</Text>
        <View style={styles.passwordContainer}>
          <TextInput
            placeholder="Nueva contraseña"
            style={styles.input}
            secureTextEntry={!showPassword}
            value={password}
            onChangeText={setPassword}
          />
          <TouchableOpacity style={styles.eyeIcon} onPress={() => setShowPassword(!showPassword)}>
            <Icon name={showPassword ? 'eye-off' : 'eye'} size={24} />
          </TouchableOpacity>
        </View>

        <Text style={styles.sectionTitle}>Repetir nueva contraseña</Text>
        <View style={styles.passwordContainer}>
          <TextInput
            placeholder="Repetir nueva contraseña"
            style={styles.input}
            secureTextEntry={!showConfirmPassword}
            value={confirmPassword}
            onChangeText={setConfirmPassword}
          />
          <TouchableOpacity style={styles.eyeIcon} onPress={() => setShowConfirmPassword(!showConfirmPassword)}>
            <Icon name={showConfirmPassword ? 'eye-off' : 'eye'} size={24} />
          </TouchableOpacity>
        </View>

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
    paddingRight: 45,  
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#e9e9e9',
    width: '100%',
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    position: 'relative', 
  },
  eyeIcon: {
    position: 'absolute',
    right: 15,
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
