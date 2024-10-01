import React from 'react';
import { View, Text, FlatList, Image, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';
import Header from '../components/Headers/Header';
import 'nativewind'; // Importar nativewind para el uso de clases

const SavedRecipes = () => {
  const navigation = useNavigation();

  const savedRecipes = [
    {
      id: '1',
      name: 'Galletas de sésamo',
      category: 'Panadería',
      image: 'https://example.com/galletas.jpg',
    },
    {
      id: '2',
      name: 'Snacks de sésamo',
      category: 'Panadería',
      image: 'https://example.com/snacks.jpg',
    },
  ];

  const renderRecipe = ({ item }) => (
    <TouchableOpacity className="flex-row items-center mb-5 border border-[#ddd] rounded-lg p-3 bg-white" onPress={() => navigation.navigate('RecipeDetail', { recipeId: item.id })}>
      <Image source={{ uri: item.image }} className="w-18 h-18 rounded-lg mr-4" />
      <View className="flex-1">
        <Text className="text-lg font-bold text-[#333]">{item.name}</Text>
        <Text className="text-sm text-[#666]">{item.category}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View className="flex-1 p-5 bg-[#fafafa]">
      <Header />

      {savedRecipes.length > 0 ? (
        <FlatList
          data={savedRecipes}
          renderItem={renderRecipe}
          keyExtractor={(item) => item.id}
        />
      ) : (
        <View className="flex-1 justify-center items-center">
          <Icon name="bookmark-outline" size={60} color="#aaa" />
          <Text className="mt-3 text-base text-[#666]">No guardaste ninguna receta todavía</Text>
        </View>
      )}
    </View>
  );
};

export default SavedRecipes;
