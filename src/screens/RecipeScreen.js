import React, { useState } from 'react';
import { View, Text, StyleSheet, Image, ScrollView, TouchableOpacity, Alert, Animated } from 'react-native';
import { FontAwesome, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

const RecipeScreen = ({ route }) => {
  const { recipe } = route.params;
  const [activeTab, setActiveTab] = useState('ingredients');
  const [scrollY] = useState(new Animated.Value(0));
  const navigation = useNavigation();

  const capitalizeFirstLetter = (string) => {
    return string.charAt(0).toUpperCase() + string.slice(1);
  };

  const saveRecipe = async () => {
    Alert.alert('Receta Guardada', `La receta "${recipe.name}" ha sido guardada con éxito.`);
  };

  if (!recipe) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Cargando receta...</Text>
      </View>
    );
  }

  const preparationSteps = recipe.instructions ? recipe.instructions.split('. ') : [];

  const imageOpacity = scrollY.interpolate({
    inputRange: [0, 300],
    outputRange: [1, 0],
    extrapolate: 'clamp',
  });

  const imageTranslateY = scrollY.interpolate({
    inputRange: [0, 300],
    outputRange: [0, -150],
    extrapolate: 'clamp',
  });

  return (
    <>
      {/* Header fijo */}
      <View style={styles.headerContainer}>
        <TouchableOpacity style={styles.backIcon} onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={30} color="#fff" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.bookmarkButton} onPress={saveRecipe}>
          <FontAwesome name="bookmark-o" size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      <Animated.ScrollView
        style={styles.container}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: true }
        )}
        scrollEventThrottle={16}
      >
        <Animated.View style={[styles.imageContainer, { opacity: imageOpacity, transform: [{ translateY: imageTranslateY }] }]}>
          <Image source={{ uri: recipe.image }} style={styles.recipeImage} />
        </Animated.View>

        <View style={styles.contentContainer}>
          <Text style={styles.recipeName}>{recipe.name}</Text>

          <View style={styles.recipeDetails}>
            <View style={styles.infoContainer}>
              <Ionicons name="time-outline" size={24} color="#888" />
              <Text style={styles.infoText}>{recipe.preparationMinutes} min</Text>
            </View>
            <View style={styles.infoContainer}>
              <Ionicons name="people-outline" size={24} color="#888" />
              <Text style={styles.infoText}>{recipe.servings} porciones</Text>
            </View>
          </View>

          <View style={styles.dietContainer}>
            {recipe.vegan && (
              <View style={styles.dietDetail}>
                <MaterialCommunityIcons name="leaf" size={24} color="green" />
                <Text style={styles.dietText}>Vegano</Text>
              </View>
            )}
            {recipe.glutenFree && (
              <View style={styles.dietDetail}>
                <MaterialCommunityIcons name="bread-slice" size={24} color="orange" />
                <Text style={styles.dietText}>Sin Gluten</Text>
              </View>
            )}
            {recipe.vegetarian && (
              <View style={styles.dietDetail}>
                <MaterialCommunityIcons name="food-apple" size={24} color="red" />
                <Text style={styles.dietText}>Vegetariano</Text>
              </View>
            )}
          </View>

          <View style={styles.separator}></View>

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

          {activeTab === 'ingredients' ? (
            <View style={styles.ingredientsContainer}>
              {recipe.ingredients.lenght > 0 ? (
                recipe.ingredients.map((ingredient, index) => (
                  <View key={index} style={styles.ingredientWrapper}>
                    <Image source={{ uri: `https://spoonacular.com/cdn/ingredients_100x100/${ingredient.image}` }} style={styles.ingredientImage} />
                    <View>
                      <Text style={styles.ingredientName}>{capitalizeFirstLetter(ingredient.originalName)}</Text>
                      <Text style={styles.ingredientAmount}>{ingredient.amount} {ingredient.unit}</Text>
                    </View>
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
      </Animated.ScrollView>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  imageContainer: {
    height: 400,
    overflow: 'hidden',
  },
  recipeImage: {
    width: '100%',
    height: '100%',
    borderTopLeftRadius: 40,
    borderTopRightRadius: 40,
  },
  headerContainer: {
    position: 'absolute',
    top: 40,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 10,
    zIndex: 10,
    borderRadius: 25,
    padding: 10,
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
    marginBottom: 15,
    marginTop: 25,
    textAlign: 'left',
  },
  recipeDetails: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    marginBottom: 20,
    marginTop: 20,
  },
  infoContainer: {
    alignItems: 'center',
  },
  infoText: {
    fontSize: 14,
    color: '#888',
    marginTop: 5,
  },
  dietContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 20,
    marginTop: 10,
  },
  dietDetail: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 10,
    borderRadius: 20,
    padding: 10,
    backgroundColor: '#f2f2f2',
  },
  dietText: {
    fontSize: 14,
    color: '#888',
    marginLeft: 5,
  },
  separator: {
    height: 2,
    backgroundColor: '#f5f5f5',
    width: '90%',
    alignSelf: 'center',
    marginVertical: 20,
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
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 25,
  },
  activeTab: {
    backgroundColor: '#e0e0e0',
  },
  inactiveTab: {
    backgroundColor: 'transparent',
  },
  tabText: {
    fontSize: 16,
    fontWeight: '500',
  },
  activeTabText: {
    fontWeight: 'bold',
    color: '#000',
  },
  ingredientsContainer: {
    marginTop: 10,
  },
  ingredientWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  ingredientImage: {
    width: 50,
    height: 50,
    marginRight: 10,
  },
  ingredientName: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  ingredientAmount: {
    fontSize: 14,
    color: '#888',
  },
  preparationContainer: {
    marginTop: 10,
  },
  stepWrapper: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 15,
  },
  stepNumber: {
    fontSize: 18,
    fontWeight: 'bold',
    marginRight: 10,
    color: '#333',
  },
  stepText: {
    fontSize: 16,
    color: '#333',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backIcon: {
    padding: 10,
  },
  bookmarkButton: {
    padding: 10,
  },
});

export default RecipeScreen;

