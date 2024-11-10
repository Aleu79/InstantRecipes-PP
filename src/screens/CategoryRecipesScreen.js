import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, Image, Alert, TouchableOpacity } from 'react-native';
import axios from 'axios';
import { useNavigation } from '@react-navigation/native';
import { FontAwesome } from '@expo/vector-icons';
import Header from '../components/Headers/Header';
import AsyncStorage from '@react-native-async-storage/async-storage';

const CategoryRecipesScreen = ({ route }) => {
  const { category } = route.params;
  const navigation = useNavigation();
  const [allRecipes, setAllRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filteredRecipes, setFilteredRecipes] = useState([]);
  const [savedRecipes, setSavedRecipes] = useState(new Set());
  const [error, setError] = useState('');

  // Función para obtener recetas de la API
  const fetchRecipes = async () => {
    try {
      const apiKey = '47cb148e73e74414829f9dd8c38a0c7e';
      const url = `https://api.spoonacular.com/recipes/complexSearch?number=100&apiKey=${apiKey}&addRecipeInformation=true&addRecipeInstructions=true&instructionsRequired=true&fillIngredients=true`;

      const response = await axios.get(url);
      const allRecipesData = response.data.results?.map(recipe => ({
        id: recipe.id,
        name: recipe.title,
        image: recipe.image,
        instructions: recipe.analyzedInstructions.length > 0
          ? recipe.analyzedInstructions[0].steps.map(step => step.step).join(' ')
          : 'No hay instrucciones disponibles',
        ingredients: recipe.extendedIngredients?.map(ingredient => ({
          originalName: ingredient.originalName,
          name: ingredient.name,
          amount: ingredient.amount,
          unit: ingredient.unit,
          image: ingredient.image,
        })) || [],
        glutenFree: recipe.glutenFree,
        vegan: recipe.vegan,
        vegetarian: recipe.vegetarian,
        dairyFree: recipe.dairyFree,
        preparationMinutes: recipe.readyInMinutes,
        servings: recipe.servings,
        meat: recipe.dishTypes?.includes("meat") || false,
        bakery: recipe.dishTypes?.includes("bakery") || false,
      })) || [];

      setAllRecipes(allRecipesData);
      setFilteredRecipes(allRecipesData);
      setError('');

    } catch (error) {
      handleError(error);
    } finally {
      setLoading(false);
    }
  };

  // Función para filtrar recetas según la categoría seleccionada
  const filterRecipesByCategory = useCallback(() => {
    const filtered = allRecipes.filter(recipe => {
      switch (category) {
        case "Vegano":
          return recipe.vegan;
        case "Vegetariano":
          return recipe.vegetarian && !recipe.meat;
        case "Sin gluten":
          return recipe.glutenFree;
        case "Sin Lacteos":
          return recipe.dairyFree;
        default:
          return true;
      }
    });

    setFilteredRecipes(filtered.length ? filtered : []);
    if (filtered.length === 0) setError('No se encontraron recetas en esta categoría.');
  }, [allRecipes, category]);

  // Función para cargar recetas guardadas desde AsyncStorage
  const loadSavedRecipes = async () => {
    try {
      const savedRecipesString = await AsyncStorage.getItem('savedRecipes');
      if (savedRecipesString) {
        setSavedRecipes(new Set(JSON.parse(savedRecipesString)));
      }
    } catch (error) {
      console.error('Error loading saved recipes:', error);
    }
  };

  // Cargar recetas al iniciar el componente
  useEffect(() => {
    fetchRecipes();
    loadSavedRecipes();
  }, []);

  // Filtrar recetas cada vez que se cargan nuevas recetas o cambia la categoría
  useEffect(() => {
    if (allRecipes.length > 0) {
      filterRecipesByCategory();
    }
  }, [allRecipes, category, filterRecipesByCategory]);

  // Manejar la acción de guardar o desguardar una receta
  const handleRecipeSaveToggle = async (recipe) => {
    setSavedRecipes(prevSavedRecipes => {
      const newSavedRecipes = new Set(prevSavedRecipes);
      if (newSavedRecipes.has(recipe.id)) {
        newSavedRecipes.delete(recipe.id);
      } else {
        newSavedRecipes.add(recipe.id);
      }
      AsyncStorage.setItem('savedRecipes', JSON.stringify(Array.from(newSavedRecipes)))
        .catch(error => console.error('Error al guardar recetas en AsyncStorage:', error));
      return newSavedRecipes;
    });
  };

  // Manejo de errores
  const handleError = (error) => {
    console.error(error);
    Alert.alert('Error', 'Ocurrió un error al cargar las recetas. Por favor, inténtalo de nuevo más tarde.');
  };

  // Mostrar indicador de carga mientras se obtienen las recetas
  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#fff" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Header />
      <Text style={styles.title}>{category}</Text>
      {error ? (
        <Text style={styles.errorText}>{error}</Text>
      ) : (
        <ScrollView contentContainerStyle={styles.scrollView}>
          {filteredRecipes.length > 0 ? (
            filteredRecipes.map((recipe) => (
              <TouchableOpacity
                key={recipe.id}
                onPress={() => navigation.navigate('RecipeScreen', { recipe })}
                style={styles.recipeContainer}
              >
                <Image source={{ uri: recipe.image }} style={styles.recipeImage} />
                <TouchableOpacity style={styles.bookmarkButton} onPress={() => handleRecipeSaveToggle(recipe)}>
                  <FontAwesome
                    name={savedRecipes.has(recipe.id) ? "bookmark" : "bookmark-o"}
                    size={24}
                    color="#fff"
                  />
                </TouchableOpacity>
                <Text style={styles.detalles}>
                  {recipe.preparationMinutes} min • {recipe.servings} porciones
                </Text>
                <Text style={styles.recipeName}>
                  {recipe.name}
                </Text>
              </TouchableOpacity>
            ))
          ) : (
            <Text style={styles.lightText}>No hay recetas disponibles para esta categoría.</Text>
          )}
        </ScrollView>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginVertical: 20,
    color: '#000',
  },
  scrollView: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
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
  errorText: {
    color: 'red',
    textAlign: 'center',
    marginVertical: 20,
  },
  lightText: {
    color: '#555',
    fontSize: 16,
    textAlign: 'center',
  },
});

export default CategoryRecipesScreen;
