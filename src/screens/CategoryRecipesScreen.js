import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import axios from 'axios';

const CategoryRecipesScreen = ({ route }) => {
  const { category } = route.params; // Obtiene la categoría del parámetro
  const [recipes, setRecipes] = useState([]); // Estado para almacenar recetas
  const [loading, setLoading] = useState(true); // Estado de carga
  const [error, setError] = useState(null); // Estado para manejar errores

  useEffect(() => {
    const fetchRecipes = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`https://api.darmon.com/recetas?categoria=${category}`, {
          headers: {
            'API-ID': 'c377928f', 
            'API-Key': '9ee2a044577db05a81342217286872ab', 
          },
        });
        setRecipes(response.data); 
      } catch (err) {
        setError(err.message); 
      } finally {
        setLoading(false);
      }
    };

    fetchRecipes();
  }, [category]); 

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#0000ff" /> 
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.container}>
        <Text>Error: {error}</Text> 
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{category} Recipes</Text>
      <ScrollView>
        {recipes.map((recipe) => (
          <View key={recipe.id} style={styles.recipeContainer}>
            <Text style={styles.recipeName}>{recipe.name}</Text>
            <Text style={styles.recipeDescription}>{recipe.description}</Text>
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
  recipeName: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  recipeDescription: {
    fontSize: 14,
    color: '#555',
  },
});

export default CategoryRecipesScreen;
