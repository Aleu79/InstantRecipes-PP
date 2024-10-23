import { Platform, ScrollView, StatusBar, StyleSheet, Text, View, Image, TouchableOpacity } from 'react-native';
import React, { useEffect, useState } from 'react';
import { CachedImage } from '../helpers/image';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import { ChevronLeftIcon } from 'react-native-heroicons/outline';
import axios from 'axios';
import Loading from '../components/Loading';
import Animated, { FadeInDown, FadeIn } from 'react-native-reanimated';
import { FontAwesome } from '@expo/vector-icons';

const RecipeDetailsScreen = (props) => {
    const [isFavourite, setFavourite] = useState(false);
    const [meals, setMeals] = useState(null);
    const [loading, setLoading] = useState(true);
    const item = props.route.params;
    const [activeTab, setActiveTab] = useState('strIngredient');
    
    useEffect(() => {
        getMealData(item.idMeal);
    }, []);

    const getMealData = async (id) => {
        try {
            const response = await axios.get(`https://themealdb.com/api/json/v1/1/lookup.php?i=${id}`);
            if (response && response.data) {
                setMeals(response.data.meals[0]);
                setLoading(false);
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

    
    const preparationSteps = meals?.strInstructions ? meals?.strInstructions.split('. ') : [];

    return (
        <ScrollView
            showsVerticalScrollIndicator={false}
            style={styles.container}
            contentContainerStyle={styles.scrollContainer}
        >
            <StatusBar style='light' />
            
            {/* Recipe Image */}
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
            </View>

            <Animated.View entering={FadeIn.delay(200).duration(1000)} style={styles.headerButtons}>
                <TouchableOpacity style={styles.backButton} onPress={() => props.navigation.goBack()}>
                    <ChevronLeftIcon size={3.5} strokeWidth={4.5} color="#fbbf24" width={hp(3.5)} height={hp(3.5)} />
                </TouchableOpacity>

                <TouchableOpacity style={styles.bookmarkButton} onPress={() => setFavourite(!isFavourite)}>
                    <FontAwesome name="bookmark-o" size={24} strokeWidth={4.5} color="#fff" />
                </TouchableOpacity>
            </Animated.View>

            {loading ? (
                <Loading size="large" style={styles.loading} />
            ) : (
                <View style={styles.detailsContainer}>
                    <Animated.View entering={FadeInDown.duration(700).springify().damping(12)} style={styles.nameAreaContainer}>
                        <Text style={styles.mealName}>{meals?.strMeal}</Text>
                        <Text style={styles.mealArea}>{meals?.strArea}</Text>
                    </Animated.View>

                    {/* Ingredients */}
                    <Animated.View entering={FadeIn.delay(400).duration(700).springify().damping(12)} style={styles.section}>
                        <Text style={styles.sectionTitle}>Ingredients</Text>
                        <View style={styles.ingredientsContainer}>
                            {ingredientsIndexes(meals).map((index) => (
                                <View key={index} style={styles.ingredientWrapper}>
                                    <Text style={styles.ingredientText}>
                                        {meals['strIngredient' + index]} - {meals['strMeasure' + index]}
                                    </Text>
                                </View>
                            ))}
                        </View>
                    </Animated.View>

                    {/* Instructions */}
                    <Animated.View entering={FadeIn.delay(600).duration(700).springify().damping(12)} style={styles.section}>
                        <Text style={styles.sectionTitle}>Instructions</Text>
                        <Text style={styles.instructionsText}>{meals?.strInstructions}</Text>
                    </Animated.View>

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
        backgroundColor: "#FFFFFF",
        flex: 1,
    },
    separator: {
        height: 1,
        backgroundColor: '#eee',
        marginVertical: 10,
    },
    tabsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-evenly', // Cambiado a space-evenly para distribuir las pestañas equitativamente
        marginTop: 20, // Añadido para separar las pestañas del contenido superior
    },
      tabButton: {
        paddingVertical: 10,
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
        fontSize: 16,
        color: '#888',
      },
      activeTabText: {
        color: '#000',
        fontWeight: 'bold', // Resalta la pestaña activa
      },
      ingredientsContainer: {
        marginTop: 10,
        flexDirection: "row",
        flexWrap: "wrap",
      },
      ingredientWrapper: {
        width: "50%", // Mantener los ingredientes al 50% del ancho
        padding: 10, // Añadir padding para separar mejor cada ingrediente
      },
      ingredientText: {
        fontSize: hp(2),
        color: "#808080",
        fontWeight: '500',
      },
      preparationContainer: {
        marginTop: 10,
      },
      preparationStep: {
        fontSize: 16,
        marginBottom: 5,
        textAlign: 'justify',
    },
    scrollContainer: {
        paddingBottom: 30,
    },
    imageContainer: {
        flexDirection: "row",
        justifyContent: "center",
    },
    image: {
        width: wp(98),
        height: hp(50),
        borderRadius: 53,
        borderBottomLeftRadius: 40,
        borderBottomRightRadius: 40,
        marginTop: 4,
    },
    headerButtons: {
        position: 'absolute',
        justifyContent: "space-between",
        alignItems: "center",
        width: "100%",
        padding: 20,
        flexDirection: "row",
        top: 20,
    },
    backButton: {
        padding: 10,
        marginLeft: 5,
        backgroundColor: "#FFF",
        borderRadius: 50,
        alignItems: "center",
        justifyContent: "center",
    },
    bookmarkButton: {
        padding: 10,
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
    nameAreaContainer: {
        marginVertical: 2,
    },
    mealName: {
        fontSize: hp(3),
        fontWeight: 'bold',
        color: "#808080",
    },
    mealArea: {
        fontSize: hp(2),
        fontWeight: '600',
        color: "#a8a8a8",
    },
    section: {
        marginVertical: 2,
    },
    sectionTitle: {
        fontSize: hp(2.5),
        fontWeight: 'bold',
        color: "#808080",
    },
    ingredientsContainer: {
        flexDirection: "row",
        justifyContent: "space-between",
        flexWrap: "wrap",
    },
    ingredientWrapper: {
        width: "50%",
        padding: 5,
    },
    ingredientText: {
        fontSize: hp(2),
        color: "#808080",
        fontWeight: '500',
    },
    instructionsText: {
        fontSize: hp(2),
        color: "#808080",
        fontWeight: '500',
        textAlign: 'left',
    },
});

export default RecipeDetailsScreen;
