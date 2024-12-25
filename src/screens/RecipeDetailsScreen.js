import { Platform, ScrollView, StatusBar, StyleSheet, Text, Alert, View, Image, TouchableOpacity } from 'react-native';
import React, { useEffect, useState, useContext } from 'react';
import { CachedImage } from '../helpers/image';
import { ChevronLeftIcon } from 'react-native-heroicons/outline';
import axios from 'axios';
import Loading from '../components/Loading';
import { FontAwesome, Ionicons } from '@expo/vector-icons';
import { db } from '../../firebase/firebase-config';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../../firebase/firebase-config';
import { UserContext } from '../context/UserContext';
import { doc, getDoc, updateDoc, arrayUnion, arrayRemove } from 'firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';
import ToastWrapper from '../components/ToastWrapper';
import { Share } from 'react-native';



const RecipeDetailsScreen = (props) => {
    const { addNotification } = useContext(UserContext); 
    const [isFavourite, setFavourite] = useState(false);
    const [meals, setMeals] = useState(null);
    const [loading, setLoading] = useState(true);
    const item = props.route.params;
    const [activeTab, setActiveTab] = useState('ingredients');
    const [isLoading, setIsLoading] = useState(false);


    useEffect(() => {
        getMealData(item.idMeal);
        onAuthStateChanged(auth, (user) => {
            if (user) {
                checkIfRecipeIsSaved(item.idMeal, user.email).then(setFavourite);
            }
        });
    }, []);

    const validarReceta = (receta) => {
        if (!receta || !receta.strMeal || !receta.strMealThumb) {
            console.error('Receta inválida');
            return false;
        }
        return true;
    };

    // Compartir receta
    const handleShareRecipe = async (recipe) => {
        if (!validarReceta(recipe)) {
            Alert.alert('Error', 'No hay información suficiente para compartir esta receta.');
            return;
        }
        try {
            if (!recipe || !recipe.strMeal || !recipe.idMeal || !recipe.strMealThumb) {
                throw new Error('La receta o el item no están definidos.');
            }
    
            const urlexpo = 'https://expo.dev/accounts/aleu79/projects/InstantRecipes/builds/09550098-5109-4086-819c-ddd8acf414ac';
    
            const shareOptions = {
                title: recipe.strMeal,
                message: `¡Mira esta receta: ${recipe.strMeal}!\nPuedes verla aquí: ${recipe.strSource}\nSi quieres ver más recetas, instala nuestra app en Expo: ${urlexpo}`,
                url: recipe.strMealThumb,
            };
    
            // Compartir la receta
            await Share.share(shareOptions);
    
            addNotification('Receta Compartida', `Has compartido la receta: ${recipe.strMeal}`);
            } catch (error) {
            console.error('Error al compartir la receta:', error);
            Alert.alert('Error', 'No se pudo compartir la receta.');
        }
    };
    // Verificar si la receta está guardada
    const checkIfRecipeIsSaved = async (recipeId, userEmail) => {
        try {
            const userDoc = await getDoc(doc(db, 'users', userEmail));
            const savedRecipes = userDoc.data().savedRecipes || [];
            return savedRecipes.some(recipe => recipe.id === recipeId);
        } catch (error) {
            console.error("Error al verificar si la receta está guardada:", error);
            return false;
        }
    };

    // Guardar o eliminar receta en el array de recetas guardadas
    const handleRecipeSaveToggle = async (recipe) => {
        setIsLoading(true); 
    
        if (!validarReceta(recipe)) {
            setIsLoading(false);
            return;
        }
    
        onAuthStateChanged(auth, async (user) => {
            if (!user) {
                console.error("Usuario no autenticado");
                setIsLoading(false); 
                return;
            }
    
            const userEmail = user.email;
            const isSaved = await checkIfRecipeIsSaved(recipe.idMeal, userEmail);
            const userDocRef = doc(db, 'users', userEmail);
    
            try {
                if (isSaved) {
                    await updateDoc(userDocRef, {
                        savedRecipes: arrayRemove({
                            id: recipe.idMeal,
                            name: recipe.strMeal,
                            image: recipe.strMealThumb,
                        }),
                    });
                    setFavourite(false);
    
                   
                    ToastWrapper({ text1: 'Receta eliminada con éxito!' });
    
                    addNotification('Receta Eliminada', 'Has eliminado una receta.');
    
                   
                    const savedRecipesJSON = await AsyncStorage.getItem('savedRecipes');
                    const savedRecipes = savedRecipesJSON ? JSON.parse(savedRecipesJSON) : [];
                    const updatedRecipes = savedRecipes.filter((id) => id !== recipe.idMeal);
                    await AsyncStorage.setItem('savedRecipes', JSON.stringify(updatedRecipes));
                } else {
                    await updateDoc(userDocRef, {
                        savedRecipes: arrayUnion({
                            id: recipe.idMeal,
                            name: recipe.strMeal,
                            image: recipe.strMealThumb,
                        }),
                    });
                    setFavourite(true);
    
                    ToastWrapper({
                        text1: 'Receta guardada con éxito!',
                        textColor: 'green',
                        borderColor: 'green',
                      });
                          
                    addNotification('Receta Guardada', 'Has guardado una receta.');
    
                    // Guardamos en AsyncStorage
                    const savedRecipesJSON = await AsyncStorage.getItem('savedRecipes');
                    const savedRecipes = savedRecipesJSON ? JSON.parse(savedRecipesJSON) : [];
                    savedRecipes.push(recipe.idMeal);
                    await AsyncStorage.setItem('savedRecipes', JSON.stringify(savedRecipes));
                }
            } catch (error) {
                console.error("Error en la actualización de favoritos:", error);
    
               
                ToastWrapper({ text1: 'Hubo un problema al actualizar tus recetas guardadas.' });
            } finally {
                setIsLoading(false); 
            }
        });
    };
    
    
    
    const getMealData = async (id) => {
        try {
            const cachedRecipe = await AsyncStorage.getItem(id);
            if (cachedRecipe) {
                console.log("Receta cargada desde cache:", cachedRecipe);  
                setMeals(JSON.parse(cachedRecipe)); 
                setLoading(false);
            } else {
                // Si no está en cache, obtenemos los datos de la API
                const response = await axios.get(`https://themealdb.com/api/json/v1/1/lookup.php?i=${id}`);
                if (response && response.data) {
                    setMeals(response.data.meals[0]);
                    await AsyncStorage.setItem(id, JSON.stringify(response.data.meals[0])); 
                    console.log("Receta guardada en cache:", response.data.meals[0]);
                    setLoading(false);
                }
            }
        } catch (error) {
            console.log("Error fetching meal data:", error.message);
        }
    };
    

    const ingredientsIndexes = (meals) => {
        let indexes = [];
        for (let i = 1; i <= 20; i++) {
            if (meals && meals['strIngredient' + i]) {
                indexes.push(i);
            }
        }
        return indexes;
    };

    const preparationSteps = meals?.strInstructions ? meals.strInstructions.split('. ') : [];

    return (
        <ScrollView
            showsVerticalScrollIndicator={false}
            style={styles.container}
            contentContainerStyle={styles.scrollContainer}
        >
            <StatusBar style="light" />
    
            {/* Imagen de la receta */}
            <View style={styles.imageContainer}>
                {Platform.OS === 'ios' ? (
                    <CachedImage
                        uri={item.strMealThumb}
                        style={styles.image}
                        sharedTransitionTag={item.strMeal}
                    />
                ) : (
                    <Image
                        source={{ uri: item.strMealThumb }}
                        style={styles.image}
                        sharedTransitionTag={item.strMeal}
                    />
                )}
                <View style={styles.ondulatedBackground} />
            </View>
    
            {/* Header con botón de retroceso y acciones */}
            <View style={styles.headerContainer}>
                <TouchableOpacity
                    style={styles.backButton}
                    onPress={() => props.navigation.goBack()}
                >
                    <ChevronLeftIcon
                        size={28}
                        strokeWidth={2.5}
                        color="#000"
                        width={30}
                        height={30}
                    />
                </TouchableOpacity>
    
                <View style={styles.actionButtons}>
                    <TouchableOpacity
                        style={styles.bookmarkButton}
                        onPress={() => handleRecipeSaveToggle(meals)}
                        disabled={isLoading}
                    >
                        {isLoading ? (
                            <Loading />
                        ) : (
                            <FontAwesome
                                name={isFavourite ? "bookmark" : "bookmark-o"}
                                size={28}
                                color={isFavourite ? "#FFD700" : "#000"}
                            />
                        )}
                    </TouchableOpacity>
    
                    <TouchableOpacity
    style={styles.shareButton}
    onPress={() => handleShareRecipe(meals)} 
>
    <Ionicons name="share-social-outline" size={28} color="#000" />
</TouchableOpacity>
                </View>
            </View>
    
            {/* Contenido principal */}
            {loading ? (
                <Loading size="large" style={styles.loading} />
            ) : (
                <View style={styles.detailsContainer}>
                    {/* Nombre de la receta */}
                    <View style={styles.contentContainer}>
                        <Text style={styles.recipeName}>{meals?.strMeal}</Text>
                    </View>
    
                    <View style={styles.separator} />
    
                    {/* Tabs para ingredientes y preparación */}
                    <View style={styles.tabsContainer}>
                        <TabButton
                            isActive={activeTab === 'ingredients'}
                            onPress={() => setActiveTab('ingredients')}
                            text="Ingredientes"
                        />
                        <TabButton
                            isActive={activeTab === 'preparation'}
                            onPress={() => setActiveTab('preparation')}
                            text="Preparación"
                        />
                    </View>
    
                    {/* Contenido de cada tab */}
                    {activeTab === 'ingredients' ? (
                        <IngredientsList
                            ingredients={ingredientsIndexes(meals).map((i) => ({
                                name: meals['strIngredient' + i],
                                measure: meals['strMeasure' + i],
                            }))}
                        />
                    ) : (
                        <PreparationList preparationSteps={preparationSteps} />
                    )}
                </View>
            )}
        </ScrollView>
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

const IngredientItem = ({ ingredient }) => {
    const ingredientImageUrl = `https://www.themealdb.com/images/ingredients/${ingredient.name}.png`;

    return (
        <View style={styles.ingredientWrapper}>
            <Image
                source={{ uri: ingredientImageUrl }}
                style={styles.ingredientImage}
            />
            <View>
                <Text style={styles.ingredientName}>{ingredient.name}</Text>
                <Text style={styles.ingredientAmount}>{ingredient.measure}</Text>
            </View>
        </View>
    );
};

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
        backgroundColor: "#FFFFFF",
        flex: 1,
    },
    scrollContainer: {
        paddingBottom: 30,
    },
    bookmarkButton: {
        paddingHorizontal: 10,
    },
    imageContainer: {
        flexDirection: "row",
        justifyContent: "center",
    },
    image: {
        width: '100%',
        height: 400,
        overflow: 'hidden',
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
    actionButtons: {
        flexDirection: 'row',
    },
    shareButton: {
        paddingHorizontal: 10,
    },
    headerContainer: {
        position: 'absolute',
        alignItems: "flex-start",
        justifyContent: "space-between",
        width: "100%",
        padding: 20,
        flexDirection: "row",
    },
    backButton: {
        paddingHorizontal: 10,
    },
    bookmarkButton: {
        paddingHorizontal: 10,
    },
    contentContainer: {
      padding: 20,
    },
    loading: {
        marginTop: 20,
    },
    detailsContainer: {
        paddingHorizontal: 4,
        flex: 1,
        justifyContent: "space-between",
        paddingVertical: 4,
        paddingTop: 8,
    },
    recipeName: {
      fontSize: 24,
      fontWeight: 'bold',
      marginBottom: 10,
    },
    loading: {
        marginTop: 50,
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
      borderRadius: 25,
      marginRight: 10,
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

export default RecipeDetailsScreen;    