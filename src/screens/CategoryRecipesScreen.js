import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, Image, Alert, TouchableOpacity } from 'react-native';
import axios from 'axios';
import { db } from '../../firebase/firebase-config'; 
import AsyncStorage from '@react-native-async-storage/async-storage';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';

const CategoryRecipesScreen = ({ route }) => {
  const { category } = route.params;
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRecipes = async () => {
      try {
        const appId = 'c377928f'; 
        const appKey = '9ee2a044577db05a81342217286872ab'; 
        const url = `https://api.edamam.com/search?q=${category}&app_id=${appId}&app_key=${appKey}`;
        const response = await axios.get(url);
        setRecipes(response.data.hits);
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
        id: recipe.recipe.uri,
        name: recipe.recipe.label,
        image: recipe.recipe.image,
        calories: Math.round(parseInt(recipe.recipe.calories, 10)), // Convierte las calorías a un número entero y redondea al número entero más cercano
        ingredients: recipe.recipe.ingredientLines?.join(', ') || '',
        healthLabels: recipe.recipe.healthLabels?.join(', ') || '',
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
    } catch (error) {
      Alert.alert('Error', 'No se pudo guardar la receta.');
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
      <Text style={styles.title}>{category} Recipes</Text>
      <ScrollView>
        {recipes.map((recipe) => (
          <View key={recipe.recipe.uri} style={styles.recipeContainer}>
            <Image source={{ uri: recipe.recipe.image }} style={styles.recipeImage} />
            <Text style={styles.recipeName}>{recipe.recipe.label}</Text>
            <Text style={styles.recipeDescription}>{recipe.recipe.source}</Text>
            <Text style={styles.recipeCalories}>Calorías: {recipe.recipe.calories}</Text>
            <Text style={styles.recipeIngredients}>Ingredientes: {recipe.recipe.ingredientLines.join(', ')}</Text>
            <Text style={styles.recipeHealthLabels}>Etiquetas de salud: {recipe.recipe.healthLabels.join(', ')}</Text>
            <TouchableOpacity style={styles.saveButton} onPress={() => saveRecipe(recipe)}>
              <Text style={styles.saveButtonText}>Guardar</Text>
            </TouchableOpacity>
          </View>
        ))}
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
  recipeContainer: {
    marginBottom: 15,
    padding: 10,
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
  },
  recipeImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 10,
  },
  recipeName: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  recipeDescription: {
    fontSize: 14,
    color: '#555',
  },
  recipeCalories: {
    fontSize: 14,
    color: '#555',
  },
  recipeIngredients: {
    fontSize: 14,
    color: '#555',
  },
  recipeHealthLabels: {
    fontSize: 14,
    color: '#555',
  },
  saveButton: {
    backgroundColor: '#4CAF50',
    padding: 10,
    borderRadius: 5,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
  },
});

export default CategoryRecipesScreen;
