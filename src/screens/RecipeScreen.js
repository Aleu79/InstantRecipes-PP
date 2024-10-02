import React, { useState } from 'react';
import { View, Text, StyleSheet, Image, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import Header from '../components/Headers/Header';

const RecipeScreen = ({ route }) => {
  const { recipe } = route.params; // Asegúrate de que estás pasando la receta completa
  const [activeTab, setActiveTab] = useState('ingredients'); // Estado para gestionar la pestaña activa

  const saveRecipe = async () => {
    Alert.alert('Receta guardada', `La receta "${recipe.name}" ha sido guardada con éxito.`);
  };

  if (!recipe) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Cargando receta...</Text>
      </View>
    );
  }

  return (
    <>
      <Header />
      <ScrollView style={styles.container}>
        <Image source={{ uri: recipe.image }} style={styles.recipeImage} />
        <TouchableOpacity style={styles.bookmarkButton} onPress={saveRecipe}>
          <FontAwesome name="bookmark-o" size={24} color="#fff" />
        </TouchableOpacity>
        <View style={styles.detailsContainer}>
          <Text style={styles.recipeName}>{recipe.name}</Text>

          {/* Información adicional de la receta */}
          <View style={styles.infoContainer}>
            <Text style={styles.infoText}>Calorías: {Math.round(recipe.calories)} kcal</Text>
            <Text style={styles.infoText}>Tiempo de Preparación: {recipe.preparationMinutes || 'N/A'} minutos</Text>
            <Text style={styles.infoText}>Porciones: {recipe.servings}</Text>
            <Text style={styles.infoText}>Gluten Free: {recipe.glutenFree ? "Sí" : "No"}</Text>
            <Text style={styles.infoText}>Vegano: {recipe.vegan ? "Sí" : "No"}</Text>
            <Text style={styles.infoText}>Vegetariano: {recipe.vegetarian ? "Sí" : "No"}</Text>
          </View>

          {/* Contenedor de pestañas */}
          <View style={styles.tabsContainer}>
            <TouchableOpacity
              style={[styles.tabButton, activeTab === 'ingredients' ? styles.activeTab : styles.inactiveTab]}
              onPress={() => setActiveTab('ingredients')}
            >
              <Text style={[styles.tabText, activeTab === 'ingredients' && styles.activeTabText]}>Ingredientes</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.tabButton, activeTab === 'preparation' ? styles.activeTab : styles.inactiveTab]}
              onPress={() => setActiveTab('preparation')}
            >
              <Text style={[styles.tabText, activeTab === 'preparation' && styles.activeTabText]}>Preparación</Text>
            </TouchableOpacity>
          </View>

          {/* Mostrar ingredientes o instrucciones según la pestaña activa */}
          {activeTab === 'ingredients' ? (
            <View style={styles.ingredientsContainer}>
              {recipe.ingredients.length > 0 ? (
                recipe.ingredients.map((ingredient, index) => (
                  <Text key={index} style={styles.ingredientItem}>• {ingredient}</Text>
                ))
              ) : (
                <Text>No hay ingredientes disponibles.</Text>
              )}
            </View>
          ) : (
            <View style={styles.preparationContainer}>
              <Text style={styles.preparationText}>{recipe.instructions || 'No hay instrucciones disponibles.'}</Text>
            </View>
          )}
        </View>
      </ScrollView>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  recipeImage: {
    width: '100%',
    height: 300,
    borderRadius: 20,
  },
  bookmarkButton: {
    position: 'absolute',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 5,
    top: 10,
    right: 10,
    padding: 5,
  },
  detailsContainer: {
    marginTop: 20,
  },
  recipeName: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  infoContainer: {
    marginBottom: 20,
  },
  infoText: {
    fontSize: 16,
  },
  tabsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  tabButton: {
    padding: 10,
    flex: 1,
    alignItems: 'center',
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: '#000',
  },
  inactiveTab: {
    borderBottomWidth: 0,
  },
  tabText: {
    fontSize: 18,
  },
  activeTabText: {
    fontWeight: 'bold',
  },
  ingredientsContainer: {
    marginTop: 20,
  },
  ingredientItem: {
    fontSize: 16,
  },
  preparationContainer: {
    marginTop: 20,
  },
  preparationText: {
    fontSize: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default RecipeScreen;
