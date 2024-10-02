import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, Image, Alert, TouchableOpacity } from 'react-native';
import axios from 'axios';
import { db } from '../../firebase/firebase-config'; 
import AsyncStorage from '@react-native-async-storage/async-storage';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { FontAwesome } from '@expo/vector-icons';
import Header from '../components/Headers/Header';
import { useNavigation } from '@react-navigation/native';

const CategoryRecipesScreen = ({ route }) => {
  const { category } = route.params;
  const navigation = useNavigation();
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [savedRecipes, setSavedRecipes] = useState({});

  useEffect(() => {
    const fetchRecipes = async () => {
      try {
        const apiKey = '69694db3792e4c4387992d79c64eb073'; // Reemplaza con tu clave de API de Spoonacular
        const url = `https://api.spoonacular.com/recipes/complexSearch?query=${category}&number=10&apiKey=${apiKey}&addRecipeInformation=true`;
        const response = await axios.get(url);
        
        // Asegúrate de que 'results' existe antes de intentar mapearlo
        const recipesData = response.data.results ? response.data.results.map(recipe => ({
          id: recipe.id,
          name: recipe.title,
          image: recipe.image,
          instructions: recipe.instructions, // Asegúrate de que este campo existe en la respuesta
          ingredients: recipe.extendedIngredients ? recipe.extendedIngredients.map(ingredient => ingredient.originalString) : [],
          glutenFree: recipe.glutenFree,
          vegan: recipe.vegan,
          vegetarian: recipe.vegetarian,
          ketogenic: recipe.ketogenic,
          // calories: recipe.nutrition.nutrients.find(nutrient => nutrient.name === 'Calories')?.amount,
          preparationMinutes: recipe.preparationMinutes,
          cookingMinutes: recipe.cookingMinutes,
          servings: recipe.servings,
        })) : [];

        setRecipes(recipesData);
        const initialSavedState = {};
        recipesData.forEach(recipe => {
          initialSavedState[recipe.id] = false;
        });
        setSavedRecipes(initialSavedState);
      } catch (error) {
        handleError(error);
      } finally {
        setLoading(false);
      }
    };
    fetchRecipes();
  }, [category]);

  const handleError = (error) => {
    console.error('Error al obtener recetas:', error.message);
    if (error.response) {
      if (error.response.status === 404) {
        Alert.alert('Error', 'Recurso no encontrado.');
      } else if (error.response.status >= 500) {
        Alert.alert('Error', 'Error en el servidor.');
      }
    } else if (error.request) {
      Alert.alert('Error', 'No se recibió respuesta del servidor.');
    }
  };

  const saveRecipe = async (recipe) => {
    try {
      let userEmail = await AsyncStorage.getItem('userEmail');
      if (!userEmail) {
        Alert.alert('Error', 'No se pudo obtener el correo del usuario.');
        return;
      }

      const recipeData = {
        id: recipe.id,
        name: recipe.name,
        image: recipe.image,
        instructions: recipe.instructions,
        ingredients: recipe.ingredients,
        glutenFree: recipe.glutenFree,
        vegan: recipe.vegan,
        vegetarian: recipe.vegetarian,
        calories: recipe.calories,
        prepTime: recipe.prepTime,
        servings: recipe.servings,
      };

      const userDoc = doc(db, 'users', userEmail);
      const userDocData = await getDoc(userDoc);

      if (!userDocData.exists()) {
        await setDoc(userDoc, { misRecetas: [recipeData] });
      } else {
        const misRecetas = userDocData.data().misRecetas || [];
        misRecetas.push(recipeData);
        await updateDoc(userDoc, { misRecetas });
      }

      Alert.alert('Receta guardada con éxito!');
      setSavedRecipes((prevState) => ({ ...prevState, [recipe.id]: true }));
    } catch (error) {
      Alert.alert('Error', 'No se pudo guardar la receta.');
    }
  };

  const toggleSaveRecipe = (recipe) => {
    if (savedRecipes[recipe.id]) {
      Alert.alert('Error', 'La receta ya está guardada.');
    } else {
      saveRecipe(recipe);
    }
  };

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
      <ScrollView contentContainerStyle={styles.scrollView}>
        {recipes.length > 0 ? (
          recipes.map((recipe) => (
            <TouchableOpacity 
              key={recipe.id} 
              onPress={() => navigation.navigate('RecipeScreen', { recipe })} // Envía la receta completa
              style={styles.recipeContainer}
            >
              <Image source={{ uri: recipe.image }} style={styles.recipeImage} />
              <TouchableOpacity style={styles.bookmarkButton} onPress={() => toggleSaveRecipe(recipe)}>
                <FontAwesome 
                  name={savedRecipes[recipe.id] ? "bookmark" : "bookmark-o"} 
                  size={24} 
                  color="#fff" 
                />
              </TouchableOpacity>
              <Text style={styles.recipeName}>{recipe.name}</Text>
            </TouchableOpacity>
          ))
        ) : (
          <Text>No hay recetas disponibles para esta categoría.</Text>
        )}
      </ScrollView>
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
  },
  recipeName: {
    textAlign: 'left',
    color: '#000',
    fontSize: 14,
  },
  bookmarkButton: {
    position: 'absolute',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 5,
    top: 10,
    right: 10,
    padding: 5,
  },
});

export default CategoryRecipesScreen;
