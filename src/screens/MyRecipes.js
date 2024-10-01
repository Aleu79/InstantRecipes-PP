import React from 'react';
import { View, Text, FlatList, Image, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';
import Header from '../components/Headers/Header';

const MyRecipes = () => {
  const navigation = useNavigation();

  const myRecipes = [
    {
      id: '1',
      name: 'Ensalada César',
      category: 'Ensaladas',
      image: 'https://example.com/ensalada.jpg',
    },
    {
      id: '2',
      name: 'Sopa de tomate',
      category: 'Sopas',
      image: 'https://example.com/sopa.jpg',
    },
  ];

  const renderRecipe = ({ item }) => (
    <TouchableOpacity 
      className="flex-row items-center mb-5 border border-gray-300 rounded-lg p-2 bg-white" 
      onPress={() => navigation.navigate('RecipeDetail', { recipeId: item.id })}
    >
      <Image source={{ uri: item.image }} className="w-16 h-16 rounded-lg mr-3" />
      <View className="flex-1">
        <Text className="text-lg font-bold text-gray-800">{item.name}</Text>
        <Text className="text-sm text-gray-600">{item.category}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View className="flex-1 p-5 bg-gray-50">
      <Header />

      {myRecipes.length > 0 ? (
        <FlatList
          data={myRecipes}
          renderItem={renderRecipe}
          keyExtractor={(item) => item.id}
        />
      ) : (
        <View className="flex-1 justify-center items-center">
          <Icon name="cafe-outline" size={60} color="#aaa" />
          <Text className="mt-2 text-lg text-gray-600">No tienes recetas creadas</Text>
        </View>
      )}

      {/* Botón flotante */}
      <TouchableOpacity 
        className="absolute bottom-5 right-5 bg-orange-600 w-[70px] h-[70px] rounded-full justify-center items-center shadow-md"
        onPress={() => navigation.navigate('CreateRecipe')}
      >
        <Icon name="add" size={30} color="#fff" />
      </TouchableOpacity>
    </View>
  );
};

export default MyRecipes;
