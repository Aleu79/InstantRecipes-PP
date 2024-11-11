import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, Image, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';
import Header from '../components/Headers/Header';
import AsyncStorage from '@react-native-async-storage/async-storage';
import BottomNavBar from '../components/BottomNavbar';

const SavedRecipes = () => {
  const navigation = useNavigation();
  const [savedRecipes, setSavedRecipes] = useState([]);
  const [error, setError] = useState(null);
  const [cache, setCache] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRecipes = async () => {
      try {
        setLoading(true);
        const savedRecipesJSON = await AsyncStorage.getItem('savedRecipes');
        console.log('Recetas guardadas desde AsyncStorage:', savedRecipesJSON);

        if (savedRecipesJSON) {
          const recipeIds = JSON.parse(savedRecipesJSON);
          const cachedRecipes = recipeIds.map(id => cache[id]).filter(Boolean);

          if (cachedRecipes.length === recipeIds.length) {
            setSavedRecipes(cachedRecipes);
          } else {
            const recipes = await Promise.all(recipeIds.map(id => fetchRecipeDetails(id)));
            setSavedRecipes(recipes);
          }
        } else {
          setSavedRecipes([]);
        }
      } catch (error) {
        console.error('Error al obtener las recetas guardadas:', error);
        Alert.alert('Error', 'Hubo un problema al cargar las recetas guardadas.');
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchRecipes();
  }, []); // Eliminar `cache` como dependencia para evitar bucles infinitos

  const fetchRecipeDetails = async (id) => {
    if (cache[id]) {
      return cache[id];
    }
    try {
      const response = await fetch(`https://themealdb.com/api/json/v1/1/lookup.php?i=${id}`);
      if (!response.ok) throw new Error('Error al obtener los detalles de la receta');

      const data = await response.json();
      const recipe = data.meals ? data.meals[0] : null;
      if (recipe) {
        const recipeData = {
          id: recipe.idMeal,
          name: recipe.strMeal,
          image: recipe.strMealThumb,
          servings: recipe.servings || 1,
        };
        setCache((prevCache) => ({ ...prevCache, [id]: recipeData }));
        return recipeData;
      } else {
        throw new Error('Receta no encontrada');
      }
    } catch (error) {
      console.error('Error en fetchRecipeDetails:', error);
      throw error;
    }
  };

  const handleRemoveRecipe = async (id) => {
    try {
      const savedRecipesJSON = await AsyncStorage.getItem('savedRecipes');
      if (savedRecipesJSON) {
        const recipeIds = JSON.parse(savedRecipesJSON);
        const updatedIds = recipeIds.filter(recipeId => recipeId !== id);

        await AsyncStorage.setItem('savedRecipes', JSON.stringify(updatedIds));
        const updatedRecipes = savedRecipes.filter(recipe => recipe.id !== id);
        setSavedRecipes(updatedRecipes);
        setCache((prevCache) => {
          const newCache = { ...prevCache };
          delete newCache[id];
          return newCache;
        });
      }
    } catch (error) {
      console.error('Error al eliminar la receta:', error);
      Alert.alert('Error', 'Hubo un problema al eliminar la receta.');
    }
  };

  const renderRecipe = ({ item }) => (
    <TouchableOpacity
      onPress={() => navigation.navigate('RecipeScreen', { recipeId: item.id })}
      style={styles.recipeContainer}
    >
      <Image source={{ uri: item.image }} style={styles.recipeImage} />
      <TouchableOpacity 
        style={styles.bookmarkButton} 
        onPress={() => handleRemoveRecipe(item.id)}
      >
        <Icon name="bookmark" size={24} color="#fff" />
      </TouchableOpacity>
      <Text style={styles.detalles}>
        {item.servings} porciones
      </Text>
      <Text style={styles.recipeName}>
        {item.name}
      </Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Header />
      {error && <Text style={styles.errorText}>{error}</Text>}
      {loading ? (
        <ActivityIndicator size="large" color="#ff6347" />
      ) : (
        savedRecipes.length > 0 ? (
          <FlatList
            data={savedRecipes}
            renderItem={renderRecipe}
            keyExtractor={(item) => item.id ? item.id.toString() : Math.random().toString()}
          />
        ) : (
          <View style={styles.emptyContainer}>
            <Icon name="star-outline" size={60} color="#aaa" />
            <Text style={styles.emptyText}>No guardaste ninguna receta todavía</Text>
          </View>
        )
      )}
      <BottomNavBar navigation={navigation} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fafafa',
  },
  recipeContainer: {
    width: '45%',
    marginBottom: 15,
    borderRadius: 15,
    overflow: 'hidden',
    position: 'relative',
    paddingBottom: 10,
    marginRight: 10,
  },
  recipeImage: {
    width: '100%',
    height: 250,
    borderRadius: 20,
    resizeMode: 'cover',
  },
  detalles: {
    color: '#adadad',
  },
  recipeName: {
    textAlign: 'left',
    color: '#000',
    fontSize: 16,
  },
  bookmarkButton: {
    position: 'absolute',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 5,
    top: 10,
    right: 10,
    padding: 5,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#aaa',
  },
  errorText: {
    color: 'red',
    textAlign: 'center',
  },
});

export default SavedRecipes;
