import React, { useRef } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons'; 
import HeaderHome from '../components/Headers/HeaderHome';

const HomeScreen = ({ navigation }) => {
  const categoriesScrollRef = useRef(); 
 
  return (
    <View className="flex-1 bg-gray-100 pt-12">
      <HeaderHome />
      <ScrollView>
        {/* Título de Ingredientes */}
        <Text className="text-2xl font-bold mt-2 mx-4">Ingredientes</Text>
        <View className="flex-row flex-wrap p-2 pt-4 bg-gray-200 mx-4 mb-5 rounded-2xl">
          {/* Chips de Ingredientes con Iconos de Cerrar */}
          {['Harina', 'Papas', 'Manteca', 'Salmón'].map((ingredient, index) => (
            <View key={index} className="flex-row items-center bg-gray-100 rounded-xl py-2 px-3 mr-2 mb-2">
              <Text className="text-gray-900 mr-1">{ingredient}</Text>
              <TouchableOpacity className="justify-center items-center ml-1">
                <Icon name="close" size={14} color="#333" />
              </TouchableOpacity>
            </View>
          ))}
          <View className="bg-white rounded-xl py-2 px-3 mb-2">
            <Text className="text-gray-900">+</Text>
          </View>
        </View>

        {/* Carrusel de Categorías con Flechas */}
        <View className="flex-row items-center mb-5 mx-4 mt-4">
          <ScrollView
            ref={categoriesScrollRef}
            horizontal
            showsHorizontalScrollIndicator={false}
          >
            {/* Botones de categorías */}
            {['Veggie', 'Carnes', 'Bebidas', 'Panadería', 'Postres', 'Sin TACC'].map((category, index) => (
              <TouchableOpacity
                key={index}
                className={`rounded-2xl py-4 px-6 mr-2 justify-center items-center w-36 h-24 ${
                  ['bg-red-600', 'bg-orange-400', 'bg-red-500', 'bg-orange-700', 'bg-orange-600', 'bg-orange-400'][index]
                }`}
                onPress={() => navigation.navigate(category)}
              >
                <Text className="text-white font-bold text-lg">{category}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Sección de Recomendados */}
        <Text className="text-2xl font-bold mt-2 mx-4">Recomendados</Text>
        <View className="flex-col items-center mb-5 mx-4">
          <TouchableOpacity className="w-full mb-2" onPress={() => navigation.navigate('RecipeView')}>
            <Image className="w-full h-40 rounded-2xl" source={{ uri: 'https://via.placeholder.com/150' }} />
            <Text className="absolute top-2 left-2 text-white font-bold text-xl px-1 py-0.5">Nombre</Text>
          </TouchableOpacity>
        </View>

        {/* Botón "Ver más" */}
        <TouchableOpacity className="bg-white py-3 rounded-2xl items-center my-2 mx-4">
          <Text className="text-black text-lg">Ver más</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Botón Flotante */}
      <TouchableOpacity className="absolute bottom-5 right-5 bg-orange-400 rounded-full w-14 h-14 justify-center items-center shadow-md">
        <Text className="text-white text-3xl">+</Text>
      </TouchableOpacity>
    </View>
  );
};

export default HomeScreen;
