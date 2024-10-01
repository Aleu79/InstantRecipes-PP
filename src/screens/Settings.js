import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { auth } from '../../firebase/firebase-config';
import Header from '../components/Headers/Header';

const Settings = () => {
  const navigation = useNavigation();

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
    <ScrollView contentContainerStyle="flex-grow bg-gray-50 p-5">
        <Header></Header>
      <View className="w-full">
        <Text className="text-[22px] font-semibold text-gray-800 mb-5 ml-5 mt-2">Configuración</Text>
        <TouchableOpacity className="rounded-full py-3 items-center w-[90%] m-auto bg-white mt-5 shadow-sm" onPress={handleDeleteProfile}>
          <Text className="text-red-700 text-lg">Eliminar perfil</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

export default Settings;
