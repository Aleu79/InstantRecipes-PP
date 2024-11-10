import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Image, ScrollView, TouchableOpacity, Alert, Animated } from 'react-native';
import { FontAwesome, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { db } from '../../firebase/firebase-config'; 
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { capitalizeFirstLetter } from '../helpers/utils';
import { ChevronLeftIcon } from 'react-native-heroicons/outline';

const RecipeScreen = ({ route }) => {
  const { recipe } = route.params;
  const [activeTab, setActiveTab] = useState('ingredients');
  const [scrollY] = useState(new Animated.Value(0));
  const [savedRecipes, setSavedRecipes] = useState(new Set());
  const navigation = useNavigation();

  useEffect(() => {
    const checkSavedStatus = async () => {
      const userEmail = await AsyncStorage.getItem('userEmail');
      if (!userEmail) return;

      const userDoc = doc(db, 'users', userEmail);
      const userDocData = await getDoc(userDoc);

      if (userDocData.exists()) {
        const misRecetas = userDocData.data().misRecetas || [];
        const isSaved = misRecetas.some((rec) => rec.id === recipe.id);
        setSavedRecipes((prev) => new Set(prev).add(isSaved ? recipe.id : null));
      }
    };

    checkSavedStatus();
  }, [recipe]);

  const handleRecipeSaveToggle = async () => {
    try {
      const userEmail = await AsyncStorage.getItem('userEmail');
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
        // Si la receta ya está guardada, eliminarla
        misRecetas.splice(recipeIndex, 1);
        await updateDoc(userDoc, { misRecetas });
        Alert.alert('Receta eliminada con éxito!');
        setSavedRecipes((prev) => {
          const newSet = new Set(prev);
          newSet.delete(recipe.id);
          return newSet;
        });
      } else {
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
        setSavedRecipes((prev) => new Set(prev).add(recipe.id));
      }
    } catch (error) {
      Alert.alert('Error', 'No se pudo guardar o eliminar la receta.');
    }
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
                <TouchableOpacity style={styles.backButton} onPress={() => props.navigation.goBack()}>
                    <ChevronLeftIcon size={28} strokeWidth={2.5} color="#fff" width={30} height={30} />
                </TouchableOpacity>

                <TouchableOpacity style={styles.bookmarkButton} onPress={() => setFavourite(!isFavourite)}>
                    <FontAwesome name="bookmark-o" size={28} strokeWidth={2.5} color="#fff" />
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
          <View style={styles.ondulatedBackground}></View>
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
              <DietDetail iconName="leaf" color="green" text="Vegano" />
            )}
            {recipe.glutenFree && (
              <DietDetail iconName="bread-slice" color="orange" text="Sin Gluten" />
            )}
            {recipe.vegetarian && (
              <DietDetail iconName="food-apple" color="red" text="Vegetariano" />
            )}
            {recipe.dairyFree && (
              <DietDetail iconName="glass-pint-outline" color="grey" text="Sin lácteos" />
            )}
          </View>

          <View style={styles.separator}></View>

          <View style={styles.tabsContainer}>
            <TabButton isActive={activeTab === 'ingredients'} onPress={() => setActiveTab('ingredients')} text="Ingredientes" />
            <TabButton isActive={activeTab === 'preparation'} onPress={() => setActiveTab('preparation')} text="Preparación" />
          </View>

          {activeTab === 'ingredients' ? (
            <IngredientsList ingredients={recipe.ingredients || []} />
          ) : (
            <PreparationList preparationSteps={preparationSteps} />
          )}
        </View>
      </Animated.ScrollView>
    </>
  );
};

const DietDetail = ({ iconName, color, text }) => (
  <View style={styles.dietDetail}>
    <MaterialCommunityIcons name={iconName} size={24} color={color} />
    <Text style={styles.dietText}>{text}</Text>
  </View>
);

const TabButton = ({ isActive, onPress, text }) => (
  <TouchableOpacity
    style={[styles.tabButton, isActive ? styles.activeTab : styles.inactiveTab]}
    onPress={onPress}
  >
    <Text style={[styles.tabText, isActive && styles.activeTabText]}>{text}</Text>
  </TouchableOpacity>
);

const IngredientsList = ({ ingredients }) => (
  <View style={styles.ingredientsContainer}>
    {ingredients.length > 0 ? (
      ingredients.map((ingredient, index) => (
        <IngredientItem key={index} ingredient={ingredient} />
      ))
    ) : (
      <Text>No hay ingredientes disponibles.</Text>
    )}
  </View>
);

const IngredientItem = ({ ingredient }) => (
  <View style={styles.ingredientWrapper}>
    <Image source={{ uri: `https://spoonacular.com/cdn/ingredients_100x100/${ingredient.image}`} } style={styles.ingredientImage} />
    <View>
      <Text style={styles.ingredientName}>{capitalizeFirstLetter(ingredient.originalName)}</Text>
      <Text style={styles.ingredientAmount}>{ingredient.amount} {ingredient.unit}</Text>
    </View>
  </View>
);

const PreparationList = ({ preparationSteps }) => (
  <View style={styles.preparationContainer}>
    {preparationSteps.length > 0 ? (
      preparationSteps.map((step, index) => (
        <Text key={index} style={styles.preparationStep}>{step}</Text>
      ))
    ) : (
      <Text>No hay instrucciones disponibles.</Text>
    )}
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },

  ondulatedBackground: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 30,
    backgroundColor: '#fdfdfd',
    borderTopLeftRadius: 40,
    borderTopRightRadius: 40,
  },

  headerContainer: {
    position: 'absolute',
    alignItems: "flex-start",
    justifyContent: "space-between",
    width: "100%",
    padding: 20,
    flexDirection: "row",
},
  imageContainer: {
    height: 400,
    overflow: 'hidden',
  },
  recipeImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  contentContainer: {
    padding: 20,
  },
  recipeName: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  recipeDetails: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 10,
  },
  infoContainer: {
    flexDirection: 'row',
    alignItems: 'center', 
    marginHorizontal: 20,
    marginTop: 10,
    marginBottom: 10,
  },
  infoText: {
    marginLeft: 5,
    color: '#888',
  },
  dietContainer: {
    flexDirection: 'row',
    marginBottom: 10,
  },
  
  dietDetail: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 10,
  },
  dietText: {
    marginLeft: 5,
    color: '#888',
  },
  separator: {
    height: 1,
    backgroundColor: '#eee',
    marginVertical: 10,
  },
  tabsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#f5f5f5',
    borderRadius: 40,
    width: '95%', 
    alignSelf: 'center',
    marginBottom: 10,
  },
  tabButton: {
      paddingVertical: 10,
      flex: 1,
      alignItems: 'center',
  },
  activeTab: {
      borderBottomWidth: 2,
      borderBottomColor: '#ddd',
      borderBottomStartRadius: 25,
      borderBottomEndRadius: 25,
  },
  inactiveTab: {
      borderBottomWidth: 0,
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
    paddingHorizontal: 25,
  },
  ingredientImage: {
    width: 50,
    height: 50,
    marginRight: 10,
    resizeMode: 'contain',
  },
  ingredientName: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  ingredientAmount: {
    color: '#888',
  },
  preparationContainer: {
    marginTop: 10,
  },
  preparationStep: {
    fontSize: 16,
    marginBottom: 5,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 10,
    backgroundColor: '#333',
  },
  backIcon: {
    padding: 10,
  },
  bookmarkButton: {
    padding: 10,
  },
});

export default RecipeScreen;