import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, Image, Alert, TouchableOpacity } from 'react-native';
import axios from 'axios';
import { db } from '../../firebase/firebase-config'; 
import AsyncStorage from '@react-native-async-storage/async-storage';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { FontAwesome } from '@expo/vector-icons';
import Header from '../components/Headers/Header';
import { useNavigation } from '@react-navigation/native';

const CategoryRecipesScreen = ({ route }) => {
  const { category } = route.params;
  const navigation = useNavigation();
  const [allRecipes, setAllRecipes] = useState([]); 
  const [loading, setLoading] = useState(true);
  const [filteredRecipes, setFilteredRecipes] = useState([]); 
  const [savedRecipes, setSavedRecipes] = useState(new Set());
  const [error, setError] = useState('');

  // Función para obtener recetas de la API de Spoonacular
  const fetchRecipes = async () => {
    try {
      const apiKey = '69694db3792e4c4387992d79c64eb073'; 
      const url = `https://api.spoonacular.com/recipes/complexSearch?number=100&apiKey=${apiKey}&addRecipeInformation=true&addRecipeInstructions=true&instructionsRequired=true&fillIngredients=true`;

      console.log("URL de la API:", url); 

      const response = await axios.get(url);
      console.log("Respuesta completa de la API:", response.data); 

      // Mapeo de las recetas
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
        bakery: recipe.dishTypes?.includes("bakery") || false
      })) || [];
  
      console.log("Recetas obtenidas de la API:", allRecipesData); 

      // Guardar las recetas en AsyncStorage
      await AsyncStorage.setItem('allRecipes', JSON.stringify(allRecipesData));

      setAllRecipes(allRecipesData);
      setFilteredRecipes(allRecipesData); 
      setError('');

    } catch (error) {
      handleError(error);
    } finally {
      setLoading(false);
    }
  };

  // Función para cargar recetas desde AsyncStorage
  const loadRecipesFromCache = async () => {
    try {
      const cachedRecipesString = await AsyncStorage.getItem('allRecipes');
      if (cachedRecipesString) {
        const cachedRecipes = JSON.parse(cachedRecipesString);
        setAllRecipes(cachedRecipes);
        setFilteredRecipes(cachedRecipes);
        setError('');
      } else {
        // Si no hay recetas en caché, buscar en la API
        await fetchRecipes();
      }
    } catch (error) {
      handleError(error);
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
        case "Carnes":
          return recipe.meat; 
        case "Panadería":
          return recipe.bakery; 
        default:
          return false; 
      }
    });

    console.log("Recetas filtradas para la categoría:", category, filtered);

    if (filtered.length === 0) {
      setError('No se encontraron recetas en esta categoría.');
      console.log("No hay recetas categorizadas, mostrando error.");
    } else {
      setFilteredRecipes(filtered);
      setError('');
      console.log("Recetas filtradas establecidas:", filtered);
    }
  }, [allRecipes, category]);

  useEffect(() => {
    loadRecipesFromCache(); 
    loadSavedRecipes(); 
  }, []);

  useEffect(() => {
    if (allRecipes.length > 0) {
      filterRecipesByCategory(); 
    }
  }, [allRecipes, category, filterRecipesByCategory]);

  const loadSavedRecipes = async () => {
    try {
      const savedRecipesString = await AsyncStorage.getItem('savedRecipes');
      if (savedRecipesString) {
        const savedRecipeIds = JSON.parse(savedRecipesString);
        setSavedRecipes(new Set(savedRecipeIds));
        console.log("que soy: ",setSavedRecipes)
      }
    } catch (error) {
      console.error('Error al cargar recetas guardadas:', error);
    }
  };

  const handleError = (error) => {
    console.error('Error al obtener recetas:', error.message);
    setError('Error al obtener recetas. Por favor intenta de nuevo.');
  };

  const handleRecipeSaveToggle = useCallback(async (recipe) => {
    try {
      let userEmail = await AsyncStorage.getItem('userEmail');
      if (!userEmail) {
        Alert.alert('Error', 'No se pudo obtener el correo del usuario.');
        return;
      }

      const userDoc = doc(db, 'users', userEmail);
      const userDocData = await getDoc(userDoc);

      if (!userDocData.exists()) {
        Alert.alert('Error', 'No hay recetas guardadas para este usuario.');
        return;
      }

      const misRecetas = userDocData.data().misRecetas || [];
      const recipeIndex = misRecetas.findIndex((rec) => rec.id === recipe.id);

      if (recipeIndex !== -1) {
        // Eliminar receta
        misRecetas.splice(recipeIndex, 1);
        await updateDoc(userDoc, { misRecetas });
        Alert.alert('Receta eliminada con éxito!');
        setSavedRecipes((prev) => {
          const newSet = new Set(prev);
          newSet.delete(recipe.id);
          AsyncStorage.setItem('savedRecipes', JSON.stringify([...newSet]));
          return newSet;
        });
      } else {
        // Guardar receta
        const recipeData = {
          id: recipe.id,
          name: recipe.name,
          image: recipe.image,
          instructions: recipe.instructions,
          ingredients: recipe.ingredients,
          glutenFree: recipe.glutenFree,
          vegan: recipe.vegan,
          vegetarian: recipe.vegetarian,
          prepTime: recipe.preparationMinutes, 
          servings: recipe.servings,
          dairyFree: recipe.dairyFree,
        };

        misRecetas.push(recipeData);
        await updateDoc(userDoc, { misRecetas });
        Alert.alert('Receta guardada con éxito!');
        setSavedRecipes((prev) => {
          const newSet = new Set(prev).add(recipe.id);
          AsyncStorage.setItem('savedRecipes', JSON.stringify([...newSet]));
          return newSet;
        });
      }
    } catch (error) {
      Alert.alert('Error', 'No se pudo guardar o eliminar la receta.');
    }
  }, []);

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Header />
      <Text style={styles.title}>Recetas {category}</Text>
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
                <Text style={styles.detalles}>{recipe.preparationMinutes} min • {recipe.servings} porciones</Text>
                <Text style={styles.recipeName}>{recipe.name}</Text>
              </TouchableOpacity>
            ))
          ) : (
            <Text>No hay recetas disponibles para esta categoría.</Text>
          )}
        </ScrollView>
      )}
    </View> 
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  scrollView: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  recipeContainer: {
    width: '48%',
    marginBottom: 15,
    borderRadius: 15,
    overflow: 'hidden',
    position: 'relative',
    paddingBottom: 10,
  },
  recipeImage: {
    width: '100%',
    height: 250,
    borderRadius: 20,
    resizeMode: 'cover',
  },
  detalles: {
    color: '#adadad',
    fontSize: 12,
    marginTop: 5,
  },
  recipeName: {
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 5,
  },
  bookmarkButton: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: 'transparent',
  },
  errorText: {
    color: 'red',
    textAlign: 'center',
  },
});

export default CategoryRecipesScreen;
