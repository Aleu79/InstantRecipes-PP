import React, { useState } from 'react';
import { View, Text, StyleSheet, Image, ScrollView, TouchableOpacity, Alert, Linking } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import Header from '../components/Headers/Header';

const RecipeScreen = ({ route }) => {
  const { recipe } = route.params;
  const [activeTab, setActiveTab] = useState('ingredients'); // Estado para gestionar la pestaña activa

  const saveRecipe = async () => {
    Alert.alert('Receta guardada', `La receta "${recipe.title}" ha sido guardada con éxito.`);
  };

  return (
    <>
      <Header />
      <ScrollView style={styles.container}>
        <Image source={{ uri: recipe.image }} style={styles.recipeImage} />
        <TouchableOpacity style={styles.bookmarkButton} onPress={saveRecipe}>
          <FontAwesome name="bookmark-o" size={24} color="#fff" />
        </TouchableOpacity>
        <View style={styles.detailsContainer}>
          <Text style={styles.recipeName}>{recipe.title}</Text>

          {/* Información adicional de la receta */}
          <View style={styles.infoContainer}>
            {/* <Text style={styles.infoText}>Calorías: {Math.round(recipe.calories)} kcal</Text> */}
            <Text style={styles.infoText}>Tiempo de Preparación: {recipe.readyInMinutes} minutos</Text>
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

          {/* Contenido según la pestaña activa */}
          {activeTab === 'ingredients' ? (
            <View style={styles.ingredientsContainer}>
              {recipe.ingredients && recipe.ingredients.length > 0 ? (
                recipe.ingredients.map((ingredient, index) => (
                  <Text key={index} style={styles.ingredientItem}> • {ingredient.name} ({ingredient.amount} {ingredient.unit})</Text>
                ))
              ) : (
                <Text style={styles.ingredientItem}>No hay ingredientes disponibles.</Text>
              )}
            </View>
          ) : (
            <View style={styles.preparationContainer}>
              {recipe.instructions ? (
                <Text style={styles.preparationText}>{recipe.instructions}</Text>
              ) : (
                <Text style={styles.preparationText}>No se han proporcionado instrucciones de preparación.</Text>
              )}
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
    backgroundColor: '#f2f2f2',
    padding: 20,
  },
  recipeImage: {
    width: '100%',
    height: 250,
    borderRadius: 20,
  },
  detailsContainer: {
    marginTop: 15,
  },
  recipeName: {
    fontSize: 24,
    marginVertical: 10,
    textAlign: 'left',
  },
  infoContainer: {
    marginBottom: 20,
  },
  infoText: {
    fontSize: 16,
    marginBottom: 5,
    color: '#666',
  },
  bookmarkButton: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 15,
    padding: 5,
  },
  tabsContainer: {
    flexDirection: 'row',
    borderRadius: 20,
    backgroundColor: '#E7E7E7',
    overflow: 'hidden', // Asegura que los bordes redondeados se mantengan
    marginVertical: 10,
  },
  tabButton: {
    flex: 1,
    padding: 20,
    alignItems: 'center',
  },
  activeTab: {
    backgroundColor: '#e9e9e9', // Color de fondo para la pestaña activa
    borderBottomWidth: 4,
    borderColor: '#007bff', // Color del borde inferior de la pestaña activa
  },
  inactiveTab: {
    backgroundColor: '#fff', // Color de fondo para las pestañas inactivas
  },
  activeTabText: {
    color: '#007bff', // Color del texto en la pestaña activa
    fontWeight: 'bold',
  },
  tabText: {
    fontSize: 16,
    color: '#666', // Color del texto en las pestañas inactivas
  },
  ingredientsContainer: {
    paddingLeft: 10,
  },
  ingredientItem: {
    fontSize: 16,
    marginBottom: 5,
  },
  preparationContainer: {
    paddingLeft: 10,
  },
  preparationText: {
    fontSize: 16,
    marginBottom: 20,
    color: '#007bff',
  },
});

export default RecipeScreen;
