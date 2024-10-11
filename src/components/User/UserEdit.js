import React, { useContext, useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ScrollView, Image, Modal } from 'react-native';
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
  const [modalVisible, setModalVisible] = useState(false);
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
    // Mostrar modal para ingresar la contraseña actual
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
              if (password || username) {
                // Verifica si la contraseña actual es correcta
                try {
                  await reauthenticateUser(currentPassword);
                } catch (error) {
                  Alert.alert('Error', 'La contraseña actual es incorrecta.');
                  return;
                }
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
                // Actualiza la contraseña
                await updatePassword(currentUser, password);
                Alert.alert('Éxito', 'Contraseña actualizada');
              }

              // Restablecer los campos
              setUsername('');
              setPassword('');
              setConfirmPassword('');
              setCurrentPassword('');
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
                case 'auth/requires-recent-login':
                  errorMessage = 'Debes iniciar sesión nuevamente para realizar este cambio.';
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

  const handleDeleteProfile = async () => {
    const user = auth.currentUser;
    if (user) {
      try {
        await user.delete();
        Alert.alert('Perfil eliminado con éxito');
        navigation.navigate('Login');
      } catch (error) {
        console.error('Error al eliminar perfil:', error);
        let errorMessage;

        // Manejo de errores al eliminar perfil
        switch (error.code) {
          case 'auth/requires-recent-login':
            errorMessage = 'Debes iniciar sesión nuevamente para eliminar tu cuenta.';
            break;
          default:
            errorMessage = 'Error al eliminar el perfil. Inténtalo de nuevo más tarde.';
        }

        Alert.alert('Error', errorMessage);
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
            <View style={styles.modalButtons}>
              <TouchableOpacity style={styles.confirmButton} onPress={confirmSaveChanges}>
                <Text style={styles.confirmButtonText}>Confirmar</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.cancelButton} onPress={() => setModalVisible(false)}>
                <Text style={styles.cancelButtonText}>Cancelar</Text>
              </TouchableOpacity>
            </View>
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
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.6)', // Fondo más oscuro para mayor contraste
  },
  modalView: {
    width: '80%',
    backgroundColor: '#ffffff', // Blanco para el fondo del modal
    borderRadius: 20, // Bordes más redondeados
    padding: 30,
    alignItems: 'center',
    shadowColor: '#000', // Sombra para dar profundidad
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5, // Para Android
  },
  modalTitle: {
    fontSize: 24, // Tamaño de fuente más grande
    fontWeight: 'bold',
    color: '#333', // Color de texto más oscuro
    marginBottom: 15,
  },
  input: {
    backgroundColor: '#f2f2f2', // Color de fondo más suave para el input
    borderRadius: 30, // Bordes redondeados
    padding: 12,
    paddingRight: 45,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    width: '100%',
  },
  passwordContainer: {
    flexDirection: 'row',
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
    borderRadius: 30, // Bordes redondeados
    paddingVertical: 12,
    alignItems: 'center',
    flex: 1,
    marginHorizontal: 5,
  },
  confirmButton: {
    backgroundColor: '#388E3C',
    borderRadius: 30, // Bordes redondeados
    paddingVertical: 12,
    alignItems: 'center',
    flex: 1,
    marginHorizontal: 5,
  },
  cancelButton: {
    backgroundColor: '#FF6F61', // Color más cálido para el botón cancelar
    borderRadius: 30, // Cambiado a 30 para bordes más redondeados
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
});

export default UserEdit;
