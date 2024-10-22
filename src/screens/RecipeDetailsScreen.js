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
                </View>
            )}
        </ScrollView>
    );
};

const renderMiscIcon = (IconComponent, value, label) => (
    <View style={styles.miscItem}>
        <View style={styles.miscIcon}>
            <IconComponent size={hp(4)} strokeWidth={hp(2.5)} width={hp(4)} height={hp(4)} />
        </View>
        <View style={styles.miscLabel}>
            <Text style={styles.miscValue}>{value}</Text>
            <Text style={styles.miscText}>{label}</Text>
        </View>
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
    miscContainer: {
        flexDirection: "row",
        justifyContent: 'space-around',
    },
    miscItem: {
        borderRadius: 100,
        backgroundColor: '#fbbf24',
        padding: 5,
    },
    miscIcon: {
        width: hp(6.5),
        height: hp(6.5),
        flex: 1,
        borderRadius: 50,
        justifyContent: "center",
        alignItems: 'center',
        backgroundColor: '#FFF',
    },
    miscLabel: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 5,
    },
    miscValue: {
        fontSize: hp(2),
        fontWeight: "bold",
        color: "#808080",
    },
    miscText: {
        fontSize: hp(1.3),
        fontWeight: "bold",
        color: "#808080",
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
