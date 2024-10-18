import React, { useContext, useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ScrollView, Image, Modal } from 'react-native';
import { auth } from '../../../firebase/firebase-config';
import { useNavigation } from '@react-navigation/native';
import { updatePassword, updateProfile } from 'firebase/auth';
import { UserContext } from '../../context/UserContext';
import Icon from 'react-native-vector-icons/Ionicons';
import Header from '../Headers/Header';
import { getFirestore, doc, updateDoc, getDoc, deleteDoc } from 'firebase/firestore';
import BottomNavBar from '../BottomNavbar';

const UserEdit = () => {
  const { user, setUser } = useContext(UserContext);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [profileImage, setProfileImage] = useState(null);
  const [initialLoad, setInitialLoad] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const navigation = useNavigation();
  const db = getFirestore();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState('');

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

  const handleSaveChanges = async () => {
    // Mostrar modal para confirmar los cambios
    setModalVisible(true);
  };

  const confirmSaveChanges = async () => {
    const currentUser = auth.currentUser;

    if (password && password !== confirmPassword) {
      Alert.alert('Error', 'Las contraseñas no coinciden');
      return;
    }

    Alert.alert(
      'Confirmación',
      '¿Estás seguro de continuar?',
      [
        {
          text: 'Cancelar',
          onPress: () => setModalVisible(false),
          style: 'cancel',
        },
        {
          text: 'Continuar',
          onPress: async () => {
            try {
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
                // Actualiza la contraseña
                await updatePassword(currentUser, password);
                Alert.alert('Éxito', 'Contraseña actualizada');
              }

              // Restablecer los campos
              setUsername('');
              setPassword('');
              setConfirmPassword('');
              setModalVisible(false);

              // Navegar a la pantalla de perfil
              navigation.navigate('UserProfile');
            } catch (error) {
              console.error('Error al actualizar perfil:', error);
              let errorMessage;

              // Manejo de errores más específico
              switch (error.code) {
                case 'auth/weak-password':
                  errorMessage = 'La contraseña debe tener al menos 6 caracteres.';
                  break;
                case 'auth/user-not-found':
                  errorMessage = 'No se encontró ningún usuario con esta información.';
                  break;
                default:
                  errorMessage = 'Ha ocurrido un error inesperado. Inténtalo de nuevo más tarde.';
              }

              Alert.alert('Error', errorMessage);
            }
          },
        },
      ],
      { cancelable: false }
    );
  };

  const calculatePasswordStrength = (password) => {
    let strength = 0;
  
    if (password.length >= 8) strength++; // Longitud
    if (/[A-Z]/.test(password)) strength++; // Mayúsculas
    if (/[a-z]/.test(password)) strength++; // Minúsculas
    if (/[0-9]/.test(password)) strength++; // Números
    if (/[^A-Za-z0-9]/.test(password)) strength++; // Caracteres especiales
  
    // Definir la fortaleza de la contraseña
    if (strength === 5) {
      return 'Muy fuerte';
    } else if (strength >= 3) {
      return 'Fuerte';
    } else if (strength === 2) {
      return 'Moderada';
    } else {
      return 'Débil';
    }
  };
  
  // Efecto para actualizar la fortaleza de la contraseña
  useEffect(() => {
    setPasswordStrength(calculatePasswordStrength(password));
  }, [password]);

  const handleDeleteProfile = async () => {
    const user = auth.currentUser;
  
    if (user) {
      try {
        // Eliminar el documento del usuario en Firestore
        const userRef = doc(db, 'users', user.uid); // Cambiado a usar el UID como referencia
        await deleteDoc(userRef);
  
        // Eliminar el usuario de Firebase Authentication
        await user.delete();
  
        Alert.alert('Perfil eliminado con éxito');
        navigation.navigate('Login');
      } catch (error) {
        console.error('Error al eliminar perfil:', error);
        Alert.alert('Error', 'No se pudo eliminar el perfil. Inténtalo más tarde.');
      }
    } else {
      Alert.alert('Error', 'No hay usuario autenticado');
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Header />
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
          <View style={styles.passwordStrengthContainer}>
            {password ? (
              <Text style={styles.passwordStrengthText}>Fortaleza: {passwordStrength}</Text>
            ) : null}
          </View>
        </View>

        <TouchableOpacity style={styles.saveButton} onPress={handleSaveChanges}>
          <Text style={styles.saveButtonText}>Guardar cambios</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={styles.deleteButton} onPress={handleDeleteProfile}>
        <Text style={styles.deleteButtonText}>Eliminar perfil</Text>
      </TouchableOpacity>
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalView}>
            <Text style={styles.modalTitle}>Confirma tu contraseña</Text>
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

            <TouchableOpacity style={styles.confirmButton} onPress={confirmSaveChanges}>
              <Text style={styles.confirmButtonText}>Confirmar</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.cancelButton} onPress={() => setModalVisible(false)}>
              <Text style={styles.cancelButtonText}>Cancelar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
      <BottomNavBar />
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
    width: '90%',
    height: 55,
    borderColor: '#e6e6e6',
    borderWidth: 1,
    borderRadius: 40,
    paddingHorizontal: 16,
    fontSize: 17,
    marginBottom: 16,
    backgroundColor: '#fff',
    backgroundColor: '#f1f1f1',
  },
  passwordContainer: {
    width: '90%',
    height: 55,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderColor: '#e6e6e6',
    borderWidth: 1,
    borderRadius: 40,
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 10,
    marginBottom: 16,
  },
  passwordStrengthContainer: {
    flexDirection: 'column',
  },
  eyeIcon: {
    margin: 8,
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
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.6)', 
  },
  modalView: {
    width: '80%',
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 30,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5, 
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333', 
    marginBottom: 15,
  },
  input: {
    backgroundColor: '#f2f2f2', 
    borderRadius: 30,
    padding: 12,
    paddingRight: 45,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    width: '100%',
  },
  passwordContainer: {
    flexDirection: 'column',
    alignItems: 'center',
    position: 'relative',
    width: '100%',
  },
  eyeIcon: {
    position: 'absolute',
    right: 15,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginTop: 20,
  },
  confirmButton: {
    backgroundColor: '#388E3C',
    borderRadius: 30,
    paddingVertical: 12,
    alignItems: 'center',
    flex: 1,
    marginHorizontal: 5,
  },
  confirmButton: {
    backgroundColor: '#388E3C',
    borderRadius: 30, 
    paddingVertical: 12,
    alignItems: 'center',
    flex: 1,
    marginHorizontal: 5,
  },
  cancelButton: {
    backgroundColor: '#FF6F61', 
    borderRadius: 30,
    paddingVertical: 12,
    alignItems: 'center',
    flex: 1,
    marginHorizontal: 5,
  },

  cancelButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  passwordStrengthText: {
    marginTop: 10,
    fontSize: 14,
    color: '#666',
  },
});

export default UserEdit;
