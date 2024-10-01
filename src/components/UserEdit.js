import React, { useContext, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ScrollView, Image } from 'react-native';
import { auth } from '../../firebase/firebase-config';
import { useNavigation } from '@react-navigation/native';
import { updatePassword, updateProfile } from 'firebase/auth';
import { UserContext } from '../context/UserContext';
import Icon from 'react-native-vector-icons/Ionicons';
import Header from './Headers/Header';

const UserEdit = () => {
  const { user } = useContext(UserContext);  
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const navigation = useNavigation();

  const handleSaveChanges = async () => {
    const user = auth.currentUser;

    if (password !== confirmPassword) {
      Alert.alert('Error', 'Las contraseñas no coinciden');
      return;
    }

    try {
      if (username) {
        await updateProfile(user, { displayName: username });
        Alert.alert('Éxito', 'Nombre de usuario actualizado');
      }

      if (password) {
        await updatePassword(user, password);
        Alert.alert('Éxito', 'Contraseña actualizada');
      }

      navigation.navigate('UserProfile');
    } catch (error) {
      console.error('Error al actualizar perfil:', error);
      Alert.alert('Error', error.message);
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
      <Header></Header>

      <View style={styles.titulocontainer}>
        <View style={styles.textContainer}>
          <Text style={styles.title}>
            Hola, <Text style={styles.username}>{user ? user.username || 'Usuario' : 'Invitado'}!</Text>
          </Text>
        </View>
        <View style={styles.imgprofile}>
          {user?.photoURL ? (
            <Image source={{ uri: user.photoURL }} style={styles.profileImage} />
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
    alignItems: 'center', // Para centrar verticalmente la imagen y el texto
    justifyContent: 'space-between', // Para separar el texto y la imagen
    marginBottom: 20,
  },
  textContainer: {
    flex: 1, // El texto ocupa el espacio restante
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
    marginLeft: 20, // Espacio entre el texto y la imagen
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
