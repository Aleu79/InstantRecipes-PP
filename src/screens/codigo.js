import React, { useState } from 'react';
import { View, Text, StyleSheet, Image, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { FontAwesome, MaterialIcons } from '@expo/vector-icons';
import Header from '../components/Headers/Header';

const RecipeScreen = ({ route }) => {
  const { recipe } = route.params;
  const [activeTab, setActiveTab] = useState('ingredients');

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

  const preparationSteps = recipe.instructions ? recipe.instructions.split('. ') : [];

  return (
    <>
      {/* Header sobre la imagen */}
      <View style={styles.imageContainer}>
        <Image source={{ uri: recipe.image }} style={styles.recipeImage} />
        <View style={styles.headerContainer}>
          <Header />
          <TouchableOpacity style={styles.bookmarkButton} onPress={saveRecipe}>
            <FontAwesome name="bookmark-o" size={24} color="#fff" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView style={styles.container}>
        <View style={styles.contentContainer}>
          {/* Nombre de la receta y detalles del autor */}
          <Text style={styles.recipeName}>{recipe.name}</Text>

          {/* Tabs para cambiar entre Ingredientes y Preparación */}
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

          {/* Mostrar ingredientes o pasos de preparación según la tab activa */}
          {activeTab === 'ingredients' ? (
            <View style={styles.ingredientsContainer}>
              {recipe.ingredients.length > 0 ? (
                recipe.ingredients.map((ingredient, index) => (
                  <View key={index} style={styles.ingredientWrapper}>
                    <Image source={{ uri: `https://spoonacular.com/cdn/ingredients_100x100/${ingredient.image}` }} style={styles.ingredientImage} />
                    <Text style={styles.ingredientName}>• {ingredient.originalName} ({ingredient.amount} {ingredient.unit})</Text>
                  </View>
                ))
              ) : (
                <Text>No hay ingredientes disponibles.</Text>
              )}
            </View>
          ) : (
            <View style={styles.preparationContainer}>
              {preparationSteps.length > 0 ? (
                preparationSteps.map((step, index) => (
                  <View key={index} style={styles.stepWrapper}>
                    <Text style={styles.stepNumber}>{index + 1}</Text>
                    <Text style={styles.stepText}>{step}</Text>
                  </View>
                ))
              ) : (
                <Text>No hay instrucciones disponibles.</Text>
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
    backgroundColor: '#fff',
  },
  imageContainer: {
    position: 'relative',
  },
  recipeImage: {
    width: '100%',
    height: 400,
    borderTopLeftRadius: 40,  // Redondear la parte superior izquierda
    borderTopRightRadius: 40, // Redondear la parte superior derecha
    overflow: 'hidden', // Asegúrate de que la imagen no sobresalga del contenedor
  },
  headerContainer: {
    position: 'absolute',
    top: 40,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 10,
  },
  socialButtons: {
    flexDirection: 'row',
  },
  heartButton: {
    marginRight: 10,
  },
  whatsappButton: {
    marginRight: 10,
  },
  saveButton: {},
  likesCount: {
    color: '#fff',
    fontSize: 16,
    marginLeft: 5,
  },
  contentContainer: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 40,
    borderTopRightRadius: 40,
    marginTop: -30,
    padding: 20,
  },
  recipeName: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  authorDetails: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  authorImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 10,
  },
  createdBy: {
    fontSize: 16,
    color: '#888',
  },
  tabsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 20,
    borderRadius: 25,
    backgroundColor: '#f5f5f5',
    padding: 5,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
  },
  activeTab: {
    backgroundColor: '#fff',
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 10,
  },
  inactiveTab: {
    backgroundColor: 'transparent',
  },
  tabText: {
    fontSize: 16,
    color: '#888',
  },
  activeTabText: {
    color: '#000',
    fontWeight: 'bold',
  },
  ingredientsContainer: {
    marginTop: 10,
  },
  ingredientWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  ingredientImage: {
    width: 40,
    height: 40,
    borderRadius: 5,
    marginRight: 10,
  },
  ingredientName: {
    fontSize: 16,
  },
  preparationContainer: {
    marginTop: 10,
  },
  stepWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  stepNumber: {
    fontWeight: 'bold',
    marginRight: 10,
  },
  stepText: {
    fontSize: 16,
  },
});

export default RecipeScreen;
