import React, { useContext, useState } from 'react';
import { View, Text, TouchableOpacity, Image, ScrollView, Alert } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { UserContext } from '../context/UserContext';
import { useNavigation } from '@react-navigation/native';
import * as ImagePicker from 'expo-image-picker'; // Importar ImagePicker
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage'; // Importar métodos de Firebase Storage
import { storage } from '../../firebase/firebase-config'; // Asegúrate de que el path sea correcto
import HeaderUserP from '../components/Headers/HeaderUserP';
import 'nativewind'; // Importar nativewind para el uso de clases

const UserProfile = () => {
  const { user } = useContext(UserContext);
  const navigation = useNavigation();
  const [image, setImage] = useState(null);

  const pickImage = async () => {
    // Solicitar permisos para la galería
    const { status: mediaLibraryStatus } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (mediaLibraryStatus !== 'granted') {
      console.log('Permiso de galería no concedido:', mediaLibraryStatus);
      alert('Lo sentimos, necesitamos permisos para acceder a la galería.');
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

      // Subir la imagen a Firebase Storage
      const response = await fetch(selectedImage.uri);
      const blob = await response.blob();

      const filename = selectedImage.uri.substring(selectedImage.uri.lastIndexOf('/') + 1);
      const imageRef = ref(storage, `profileImages/${filename}`); // Asegúrate de que la carpeta sea correcta

      try {
        await uploadBytes(imageRef, blob);
        const url = await getDownloadURL(imageRef);
        console.log('URL de la imagen subida:', url);
        setImage(url); // Actualiza el estado con la URL de la imagen subida
      } catch (error) {
        console.error('Error al subir la imagen:', error);
        Alert.alert('Error', 'No se pudo subir la imagen.'); // Mostrar un mensaje de error
      }
    }
  };

  return (
    <ScrollView contentContainerStyle="flex-grow bg-[#fafafa] p-5">
      <HeaderUserP />

      <View className="items-center mb-8">
        <TouchableOpacity onPress={pickImage}>
          {image ? (
            <Image source={{ uri: image }} className="w-24 h-24 rounded-full mb-4" />
          ) : (
            <Icon name="person-circle-outline" size={100} color="#333" />
          )}
        </TouchableOpacity>
        <Text className="text-2xl font-bold text-[#333] mb-2">
          {user ? user.username : 'Invitado'}
        </Text>
        <Text className="text-sm text-[#666]">
          {user ? user.email : 'emma.phillips@gmail.com'}
        </Text>
      </View>

      <View className="border-t border-[#eaeaea] pt-5">
        <TouchableOpacity className="flex-row items-center py-4 px-5 border-b border-[#eaeaea]" onPress={() => navigation.navigate('SavedRecipes')}>
          <Icon name="bookmark-outline" size={24} color="#333" />
          <Text className="text-[18px] ml-4 text-[#333]">Guardados</Text>
        </TouchableOpacity>
        <TouchableOpacity className="flex-row items-center py-4 px-5 border-b border-[#eaeaea]" onPress={() => navigation.navigate('MyRecipes')}>
          <Icon name="cafe-outline" size={24} color="#333" />
          <Text className="text-[18px] ml-4 text-[#333]">Tus recetas</Text>
        </TouchableOpacity>
        <TouchableOpacity className="flex-row items-center py-4 px-5 border-b border-[#eaeaea]" onPress={() => navigation.navigate('Settings')}>
          <Icon name="settings-outline" size={24} color="#333" />
          <Text className="text-[18px] ml-4 text-[#333]">Ajustes</Text>
        </TouchableOpacity>
        <TouchableOpacity className="flex-row items-center py-4 px-5">
          <Icon name="log-out-outline" size={24} color="#333" />
          <Text className="text-[18px] ml-4 text-[#333]">Cerrar sesión</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

export default UserProfile;
