import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, Alert, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import ChevronLeftIcon from 'react-native-vector-icons/Feather';
import { capitalizeFirstLetter } from '../helpers/utils';
import DietDetails from '../helpers/DietDetails';
import { useNavigation } from '@react-navigation/native';

const MyRecipeScreen = ({ route }) => {
  const { recipe } = route.params;
  const navigation = useNavigation();
  const [recipeName, setRecipeName] = useState(recipe.recipeName);
  const [recipeImage, setrecipeImage] = useState(recipe.recipeImage);
  const [ingredients, setIngredients] = useState(recipe.ingredients);
  const [preparation, setPreparation] = useState(recipe.preparation);
  const [dietType, setDietType] = useState(recipe.dietType);
  const [glutenFree, setGlutenFree] = useState(recipe.glutenFree);
  const [vegetarian, setVegetarian] = useState(recipe.vegetarian);
  const [dairyFree, setdairyFree] = useState(recipe.dairyfree);
  const [vegan, setVegan] = useState(recipe.vegan);
  const [prepTime, setPrepTime] = useState(recipe.prepTime);
  const [servings, setServings] = useState(recipe.servings);
  const [category, setCategory] = useState(recipe.category);
  const [activeTab, setActiveTab] = useState('ingredients');
  

  useEffect(() => {
    if (!recipe) {
      Alert.alert('Error', 'No se encontraron datos de receta.');
      return;
    }
    console.log(recipe);
  }, [recipe]);

  const [scrollY] = useState(new Animated.Value(0));
  const imageOpacity = scrollY.interpolate({
    inputRange: [0, 200],
    outputRange: [1, 0],
    extrapolate: 'clamp',
  });
  const imageTranslateY = scrollY.interpolate({
    inputRange: [0, 200],
    outputRange: [0, -50],
    extrapolate: 'clamp',
  });

  return (
    <>
      {/* Header fijo */}
      <View style={styles.headerContainer}>
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
              <ChevronLeftIcon size={28} strokeWidth={2.5} color="#fff" width={30} height={30} />
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
          <Image source={{ uri: recipe.recipeImage }} style={styles.recipeImage} />
          <View style={styles.ondulatedBackground}></View>
        </Animated.View>

        <View style={styles.contentContainer}>
          <Text style={styles.recipeName}>{capitalizeFirstLetter(recipe.recipeName)}</Text>

          <View style={styles.recipeDetails}>
            <View style={styles.infoContainer}>
              <Ionicons name="time-outline" size={24} color="#888" />
              <Text style={styles.infoText}>{recipe.prepTime} min</Text>
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
            <IngredientsList ingredients={ingredients} />
          ) : (
            <PreparationList preparationSteps={preparation} />
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
        <Text key={index} style={styles.ingredientText}>{capitalizeFirstLetter(ingredient)}</Text>
      ))
    ) : (
      <Text>No hay ingredientes disponibles.</Text>
    )}
  </View>
);

const PreparationList = ({ preparationSteps }) => (
  <View style={styles.preparationContainer}>
    {Array.isArray(preparationSteps) && preparationSteps.length > 0 ? (
      preparationSteps.map((step, index) => (
        <View key={index} style={styles.preparationItem}>
          <Text style={styles.stepNumber}>{index + 1}</Text>
          <Text style={styles.preparationStep}>{capitalizeFirstLetter(step)}</Text>
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
  headerContainer: {
    position: 'absolute',
    alignItems: "flex-start",
    justifyContent: "space-between",
    width: "100%",
    padding: 20,
    flexDirection: "row",
  },
  backIcon: {
    padding: 10,
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    padding: 20,
    zIndex: 1,
  },
  backButton: {
    padding: 10,
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
    marginTop: 20,
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
  },
  infoText: {
    marginLeft: 5,
    color: '#888',
  },
  dietContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 10,
  },
  dietText: {
    fontSize: 14,
    color: '#888',
    marginHorizontal: 10,
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
  ingredientText: {
    fontSize: 16,
    color: '#333',
    marginBottom: 10,
  },
  preparationContainer: {
    marginTop: 10,
  },
  preparationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
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
export default MyRecipeScreen;
