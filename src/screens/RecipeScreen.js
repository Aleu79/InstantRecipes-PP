import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Image, ScrollView, TouchableOpacity, Alert, Animated, ActivityIndicator } from 'react-native';
import { FontAwesome, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { db } from '../../firebase/firebase-config'; 
import { doc, getDoc, updateDoc, setDoc } from 'firebase/firestore';
import { capitalizeFirstLetter } from '../helpers/utils';
import { ChevronLeftIcon } from 'react-native-heroicons/outline';
import DietDetails from '../helpers/DietDetails';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';

const RecipeScreen = ({ route, navigation }) => {
  const { recipe } = route.params;
  const [fullRecipeDetails, setFullRecipeDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('ingredients');
  const [scrollY] = useState(new Animated.Value(0));
  const [isSaved, setIsSaved] = useState(false); 

  useEffect(() => {
    const loadRecipeDetails = async () => {
      try {
        const details = await getRecipeDetails(recipe.id);
        setFullRecipeDetails({
          ...recipe,
          ...details
        });
      } catch (error) {
        console.error('Error loading recipe details:', error);
        Alert.alert('Error', 'No se pudieron cargar los detalles de la receta');
      } finally {
        setLoading(false);
      }
    };

    loadRecipeDetails();
  }, [recipe.id]);

  const handleRecipeSaveToggle = async () => {
    try {
      const userEmail = await AsyncStorage.getItem('userEmail');
      if (!userEmail) {
        Alert.alert('Error', 'Debes iniciar sesión para guardar recetas');
        return;
      }

      const userDoc = doc(db, 'users', userEmail);
      const userDocData = await getDoc(userDoc);

      if (!userDocData.exists()) {
        await setDoc(userDoc, { misRecetas: [] });
      }

      const currentRecipes = userDocData.exists() ? userDocData.data().misRecetas || [] : [];
      const recipeIndex = currentRecipes.findIndex(r => r.id === recipe.id);

      if (recipeIndex !== -1) {
        currentRecipes.splice(recipeIndex, 1);
        await updateDoc(userDoc, { misRecetas: currentRecipes });
        
        const cachedRecipes = JSON.parse(await AsyncStorage.getItem('savedRecipes') || '[]');
        const updatedCache = cachedRecipes.filter(r => r.id !== recipe.id);
        await AsyncStorage.setItem('savedRecipes', JSON.stringify(updatedCache));
        
        setIsSaved(false);
        addNotification('Receta Eliminada', 'La receta se ha eliminado de tus favoritos');
      } else {
        const recipeToSave = {
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
          savedAt: new Date().toISOString()
        };

        currentRecipes.push(recipeToSave);
        await updateDoc(userDoc, { misRecetas: currentRecipes });
        
        const cachedRecipes = JSON.parse(await AsyncStorage.getItem('savedRecipes') || '[]');
        cachedRecipes.push(recipeToSave);
        await AsyncStorage.setItem('savedRecipes', JSON.stringify(cachedRecipes));
        
        setIsSaved(true);
        addNotification('Receta Guardada', 'La receta se ha guardado en tus favoritos');
      }
    } catch (error) {
      console.error('Error toggling recipe:', error);
      Alert.alert('Error', 'No se pudo procesar la operación');
    }
  };

  
  const handleShareRecipe = async () => {
    try {
      const isAvailable = await Sharing.isAvailableAsync();
      if (!isAvailable) {
        Alert.alert('Error', 'El compartir no está disponible en tu dispositivo');
        return;
      }
  
      const urlexpo = 'https://expo.dev/accounts/aleu79/projects/InstantRecipes/builds/09550098-5109-4086-819c-ddd8acf414ac';
  
      const shareMessage = 
        `¡Mira esta receta de ${recipe.name}!\n\n` +
        `Tiempo de preparación: ${recipe.preparationMinutes} minutos\n` +
        `Porciones: ${recipe.servings}\n\n` +
        `Ingredientes:\n${recipe.ingredients.map(ing => `- ${ing.amount} ${ing.unit} ${ing.name}`).join('\n')}\n\n` +
        `Descarga la app para ver más recetas como esta: ${urlexpo}`;
  
      const localUri = `${FileSystem.cacheDirectory}recipe-${recipe.id}.jpg`;
  
      try {
        await FileSystem.downloadAsync(recipe.image, localUri);
        
        await Sharing.shareAsync(localUri, {
          mimeType: 'image/jpeg',
          dialogTitle: `Compartir receta: ${recipe.name}`,
          UTI: 'public.jpeg',
        });
  
        await Sharing.shareAsync(shareMessage);
      } catch (downloadError) {
        console.error('Error al descargar la imagen:', downloadError);
        await Sharing.shareAsync(shareMessage);
      }
    } catch (error) {
      console.error('Error al compartir la receta:', error);
      Alert.alert('Error', 'No se pudo compartir la receta');
    }
  };
  
  
  
    
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

  useEffect(() => {
    const checkSavedStatus = async () => {
      try {
        const userEmail = await AsyncStorage.getItem('userEmail');
        if (!userEmail) return;

        const cachedRecipes = JSON.parse(await AsyncStorage.getItem('savedRecipes') || '[]');
        const isCached = cachedRecipes.some(r => r.id === recipe.id);
        
        if (isCached) {
          setIsSaved(true);
          return;
        }

        const userDoc = doc(db, 'users', userEmail);
        const userDocData = await getDoc(userDoc);
        
        if (userDocData.exists()) {
          const misRecetas = userDocData.data().misRecetas || [];
          const isInFirestore = misRecetas.some(r => r.id === recipe.id);
          setIsSaved(isInFirestore);
          
          if (isInFirestore && !isCached) {
            cachedRecipes.push(misRecetas.find(r => r.id === recipe.id));
            await AsyncStorage.setItem('savedRecipes', JSON.stringify(cachedRecipes));
          }
        }
      } catch (error) {
        console.error('Error checking saved status:', error);
      }
    };

    checkSavedStatus();
  }, [recipe.id]);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#f57c00" />
      </View>
    );
  }
  return (
    <>
      {/* Header fijo */}
      <View style={styles.headerContainer}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <ChevronLeftIcon size={28} strokeWidth={2.5} color="#000" width={30} height={30} />
        </TouchableOpacity>

        <View style={styles.buttonsContainer}>
          <TouchableOpacity style={styles.bookmarkButton} onPress={handleRecipeSaveToggle}>
            <FontAwesome name={isSaved ? "bookmark" : "bookmark-o"} size={28} strokeWidth={2.5} color="#000" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.shareButton} onPress={handleShareRecipe}>
            <Ionicons name="share-social-outline" size={28} color="#000" />
          </TouchableOpacity>
        </View>
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
              <DietDetails iconName="leaf" color="green" text="Vegano"/>
            )}
            {recipe.glutenFree && (
              <DietDetails iconName="bread-slice" color="orange" text="Libre de Gluten" />
            )}
            {recipe.vegetarian && (
              <DietDetails iconName="food-apple" color="red" text="Vegetariano" />
            )}
            {recipe.dairyFree && (
              <DietDetails iconName="glass-pint-outline" color="grey" text="Sin lácteos" />
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
        <View key={index} style={styles.preparationItem}>
          <Text style={styles.stepNumber}>{index + 1}</Text>
          <Text style={styles.preparationStep}>{step}</Text>
        </View>
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
    flexDirection: 'row',
    justifyContent: 'space-between',  
    padding: 10,
    alignItems: 'center',
    position: 'absolute',
    top: 20,
    left: 0,
    right: 0,
    zIndex: 1,
  },
  backButton: {
    paddingLeft: 10,
  },
  buttonsContainer: {
    flexDirection: 'row',  
    justifyContent: 'flex-end',  
    alignItems: 'center',  
  },
  bookmarkButton: {
    paddingHorizontal: 10,
  },
  shareButton: {
    paddingHorizontal: 10,
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
    alignContent: 'center',
    justifyContent: 'center',
  },
  separator: {
    height: 1,
    backgroundColor: '#eee',
    marginVertical: 10,
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
  preparationContainer: {
    marginTop: 10,
    padding: 15,
    width: '90%',
},
preparationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'left',
    marginBottom: 10,
    paddingHorizontal: 20,
},
stepNumber: {
    backgroundColor: '#fbbf24', 
    color: 'white',
    width: 30,
    height: 30,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    textAlign: 'center',
    fontWeight: 'bold',
    marginRight: 15,
},
preparationStep: {
    fontSize: 16,
},
});

export default RecipeScreen;