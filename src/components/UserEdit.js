import React, { useContext, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, Image, Alert } from 'react-native';
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
    const currentUser = auth.currentUser;

    if (password !== confirmPassword) {
      Alert.alert('Error', 'Las contraseñas no coinciden');
      return;
    }

    try {
      if (username) {
        await updateProfile(currentUser, { displayName: username });
        Alert.alert('Éxito', 'Nombre de usuario actualizado');
      }

      if (password) {
        await updatePassword(currentUser, password);
        Alert.alert('Éxito', 'Contraseña actualizada');
      }

      navigation.navigate('UserProfile');
    } catch (error) {
      console.error('Error al actualizar perfil:', error);
      Alert.alert('Error', error.message);
    }
  };

  const handleDeleteProfile = async () => {
    const currentUser = auth.currentUser;

    if (currentUser) {
      try {
        await currentUser.delete();
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
    <ScrollView contentContainerStyle="flex-grow bg-[#fafafa] p-5">
      <Header />

      <View className="flex-row items-center justify-between mb-5">
        <View className="flex-1 px-5">
          <Text className="text-3xl font-medium text-gray-800">
            Hola, <Text className="font-bold">{user ? user.username || 'Usuario' : 'Invitado'}!</Text>
          </Text>
        </View>
        <View className="ml-5 px-5">
          {user?.photoURL ? (
            <Image source={{ uri: user.photoURL }} className="w-24 h-24 rounded-full" />
          ) : (
            <Icon name="person-circle-outline" size={80} color="#333" />
          )}
        </View>
      </View>

      <View className="w-[90%] items-center justify-center px-5 mx-auto mt-5">
        <Text className="text-[18px] mb-2 text-[#333] self-start">Nuevo nombre de usuario</Text>
        <TextInput
          placeholder="Nuevo nombre de usuario"
          className="bg-white rounded-full py-3 px-5 mb-4 border border-gray-200 w-full"
          value={username}
          onChangeText={setUsername}
        />

        <Text className="text-[18px] mb-2 text-[#333] self-start">Nueva contraseña</Text>
        <TextInput
          placeholder="Nueva contraseña"
          className="bg-white rounded-full py-3 px-5 mb-4 border border-gray-200 w-full"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
        />

        <TextInput
          placeholder="Repetir nueva contraseña"
          className="bg-white rounded-full py-3 px-5 mb-4 border border-gray-200 w-full"
          secureTextEntry
          value={confirmPassword}
          onChangeText={setConfirmPassword}
        />

        <TouchableOpacity className="bg-green-700 rounded-full py-3 items-center mt-5 w-full" onPress={handleSaveChanges}>
          <Text className="text-white text-lg">Guardar cambios</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity className="rounded-full py-3 items-center w-full" onPress={handleDeleteProfile}>
        <Text className="text-red-700 text-lg">Eliminar perfil</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

export default UserEdit;
