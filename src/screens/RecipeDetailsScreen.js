import { Platform, ScrollView, StatusBar, StyleSheet, Text, Alert, View, Image, TouchableOpacity } from 'react-native';
import React, { useEffect, useState, useContext } from 'react';
import { CachedImage } from '../helpers/image';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import { ChevronLeftIcon } from 'react-native-heroicons/outline';
import axios from 'axios';
import Loading from '../components/Loading';
import Animated, { FadeIn } from 'react-native-reanimated';
import { FontAwesome } from '@expo/vector-icons';
import { capitalizeFirstLetter } from '../helpers/utils';
import { db } from '../../firebase/firebase-config';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../../firebase/firebase-config';
import { UserContext } from '../context/UserContext';
import { doc, getDoc, updateDoc, arrayUnion, arrayRemove } from 'firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage'; 

const RecipeDetailsScreen = (props) => {
    const { addNotification } = useContext(UserContext); 
    const [isFavourite, setFavourite] = useState(false);
    const [meals, setMeals] = useState(null);
    const [loading, setLoading] = useState(true);
    const item = props.route.params;
    const [activeTab, setActiveTab] = useState('ingredients');

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
        if (!validarReceta(recipe)) {
            return;
        }
    
        onAuthStateChanged(auth, async (user) => {
            if (!user) {
                console.error("Usuario no autenticado");
                return;
            }
    
            const userEmail = user.email;
    
            const isSaved = await checkIfRecipeIsSaved(recipe.idMeal, userEmail);
            const userDocRef = doc(db, 'users', userEmail);
    
            if (isSaved) {
                try {
                    await updateDoc(userDocRef, {
                        savedRecipes: arrayRemove({
                            id: recipe.idMeal,
                            name: recipe.strMeal,
                            image: recipe.strMealThumb
                        })
                    });
                    setFavourite(false);
                    Alert.alert('Receta eliminada con éxito!');
                    addNotification('Receta Eliminada', 'Has eliminado receta.');
                    console.log("Receta eliminada de favoritos."); 
                } catch (error) {
                    Alert.alert('Error', 'No se pudo eliminar la receta.');
                    addNotification('Error', 'No se pudo eliminar la receta.');
                    console.error("Error al eliminar la receta de los favoritos:", error);
                }
            } else {
                try {
                    await updateDoc(userDocRef, {
                        savedRecipes: arrayUnion({
                            id: recipe.idMeal,
                            name: recipe.strMeal,
                            image: recipe.strMealThumb
                        })
                    });
                    setFavourite(true);
                    Alert.alert('Receta guardada con éxito!');
                    addNotification('Receta Guardada', 'Has guardado una receta.');
                    console.log("Receta guardada correctamente.");
                } catch (error) {
                    Alert.alert('Error', 'No se pudo guardar la receta.');
                    addNotification('Error', 'No se pudo guardar la receta.');
                    console.error("Error al guardar la receta en los favoritos:", error);
                }
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
            <StatusBar style='light' />

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

            <Animated.View entering={FadeIn.delay(200).duration(1000)} style={styles.headerContainer}>
                <TouchableOpacity style={styles.backButton} onPress={() => props.navigation.goBack()}>
                    <ChevronLeftIcon size={28} strokeWidth={2.5} color="#fff" width={30} height={30} />
                </TouchableOpacity>

                <TouchableOpacity style={styles.bookmarkButton} onPress={() => handleRecipeSaveToggle(meals)}>
                    <FontAwesome 
                        name={isFavourite ? "bookmark" : "bookmark-o"} 
                        size={28} 
                        color={isFavourite ? "#FFD700" : "#fff"} 
                    />
                </TouchableOpacity>
            </Animated.View>

            {loading ? (
                <Loading size="large" style={styles.loading} />
            ) : (
                <ScrollView style={styles.container}>
                    <View style={styles.detailsContainer}>
                        <View style={styles.contentContainer}>
                            <Text style={styles.recipeName}>{meals?.strMeal}</Text>
                        </View>

                        <View style={styles.separator}></View>

                        <View style={styles.tabsContainer}>
                            <TabButton isActive={activeTab === 'ingredients'} onPress={() => setActiveTab('ingredients')} text="Ingredientes" />
                            <TabButton isActive={activeTab === 'preparation'} onPress={() => setActiveTab('preparation')} text="Preparación" />
                        </View>

                        {activeTab === 'ingredients' ? (
                            <IngredientsList ingredients={ingredientsIndexes(meals).map(i => ({
                                name: meals['strIngredient' + i],
                                measure: meals['strMeasure' + i]
                            }))} />
                        ) : (
                            <PreparationList preparationSteps={preparationSteps} />
                        )}
                    </View>
                </ScrollView>
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
                <Text style={styles.ingredientName}>{capitalizeFirstLetter(ingredient.name)}</Text>
                <Text style={styles.ingredientAmount}>{ingredient.measure}</Text>
            </View>
        </View>
    );
};

const PreparationList = ({ preparationSteps }) => (
    <View style={styles.preparationContainer}>
        {preparationSteps.map((step, index) => (
            <Text key={index} style={styles.preparationStep}>
                {capitalizeFirstLetter(step)}
            </Text>
        ))}
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