import { Platform, ScrollView, StatusBar, StyleSheet, Text, View, Image, TouchableOpacity } from 'react-native';
import React, { useEffect, useState } from 'react';
import { CachedImage } from '../helpers /image';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import { ChevronLeftIcon } from 'react-native-heroicons/outline';
import { ClockIcon, FireIcon, HeartIcon, Square3Stack3DIcon, UsersIcon } from 'react-native-heroicons/solid';
import axios from 'axios';
import Loading from '../components/ Loading';
import Animated, { FadeInDown, FadeIn } from 'react-native-reanimated';

const RecipeDetailsScreen = (props) => {
    console.log("RecipeScreen Props", props);

    const [isFavourite, setFavourite] = useState(false);
    const [meals, setMeals] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        getMealData(item.idMeal);
    }, []);

    const getMealData = async (id) => {
        try {
            const response = await axios.get(`https://themealdb.com/api/json/v1/1/lookup.php?i=${id}`);
            console.log("Meals data====", response.data);
            if (response && response.data) {
                setMeals(response.data.meals[0]);
                setLoading(false);
            }
        } catch (error) {
            console.log("error", error.message);
        }
    };

    const ingredientsIndexes = (meals) => {
        if (!meals) return [];
        let indexes = [];
        for (let i = 1; i <= 20; i++) {
            if (meals['strIngredient' + i]) {
                indexes.push(i);
            }
        }
        return indexes;
    };

    let item = props.route.params;

    return (
        <ScrollView
            showsVerticalScrollIndicator={false}
            style={{
                backgroundColor: "#FFFFFF",
                flex: 1
            }}
            contentContainerStyle={{ paddingBottom: 30 }}
        >
            <StatusBar style={'light'} />
            
            {/* Recipe Image */}
            <View style={{
                flexDirection: "row",
                justifyContent: "center"
            }}>
                {Platform.OS === 'ios' ? (
                    <CachedImage
                        uri={item.strMealThumb}
                        style={{
                            width: wp(98), height: hp(50), borderRadius: 53,
                            borderBottomLeftRadius: 40,
                            borderBottomRightRadius: 40,
                            marginTop: 4
                        }}
                        sharedTransitionTag={item.strMeal}
                    />
                ) : (
                    <Image source={{ uri: item.strMealThumb }}
                        style={{
                            width: wp(98), height: hp(50), borderRadius: 53,
                            borderBottomLeftRadius: 40,
                            borderBottomRightRadius: 40,
                            marginTop: 4
                        }}
                        sharedTransitionTag={item.strMeal}
                    />
                )}
            </View>

            {/* Back Button */}
            <Animated.View entering={FadeIn.delay(200).duration(1000)}
                style={{
                    position: 'absolute',
                    justifyContent: "space-between",
                    alignItems: "center",
                    width: "100%",
                    padding: 20,
                    flexDirection: "row",
                    top: 20
                }}
            >
                <TouchableOpacity
                    style={{
                        padding: 10,
                        marginLeft: 5,
                        backgroundColor: "#FFF",
                        borderRadius: 50,
                        alignItems: "center",
                        justifyContent: "center"
                    }}
                    onPress={() => { props.navigation.goBack() }}
                >
                    <ChevronLeftIcon size={3.5} strokeWidth={4.5} color="#fbbf24"
                        width={hp(3.5)} height={hp(3.5)}
                    />
                </TouchableOpacity>

                <TouchableOpacity
                    style={{
                        padding: 10,
                        marginRight: 5,
                        backgroundColor: "#FFF",
                        borderRadius: 50,
                        alignItems: "center",
                        justifyContent: "center"
                    }}
                    onPress={() => setFavourite(!isFavourite)}
                >
                    <HeartIcon size={3.5} strokeWidth={4.5} color={isFavourite ? "red" : "#808080"}
                        width={hp(3.5)} height={hp(3.5)}
                    />
                </TouchableOpacity>
            </Animated.View>

            {/* Meals description */}
            {loading ? (
                <Loading size="large" style={{ marginTop: 20 }} />
            ) : (
                <View style={{
                    paddingHorizontal: 4,
                    flex: 1,
                    justifyContent: "space-between",
                    paddingVertical: 4,
                    paddingTop: 8
                }}>
                    {/* Name and Area */}
                    <Animated.View
                        entering={FadeInDown.duration(700).springify().damping(12)}
                        style={{ marginVertical: 2 }}
                    >
                        <Text style={{
                            fontSize: hp(3),
                            fontWeight: 'bold',
                            color: "#808080"
                        }}>
                            {meals?.strMeal}
                        </Text>

                        <Text style={{
                            fontSize: hp(2),
                            fontWeight: '600',
                            color: "#a8a8a8"
                        }}>
                            {meals?.strArea}
                        </Text>
                    </Animated.View>

                    {/* Misc */}
                    <Animated.View
                        entering={FadeInDown.delay(100).duration(700).springify().damping(12)}
                        style={{
                            flexDirection: "row",
                            justifyContent: 'space-around',
                        }}
                    >
                        {/* Time */}
                        <View style={{ borderRadius: 100, backgroundColor: '#fbbf24', padding: 5 }}>
                            <View style={{
                                width: hp(6.5), height: hp(6.5),
                                flex: 1,
                                borderRadius: 50,
                                justifyContent: "center",
                                alignItems: 'center',
                                backgroundColor: '#FFF'
                            }}>
                                <ClockIcon size={hp(4)} strokeWidth={hp(2.5)}
                                    width={hp(4)} height={hp(4)} color={"#808080"} />
                            </View>
                            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', marginTop: 5 }}>
                                <Text style={{ fontSize: hp(2), fontWeight: "bold", color: "#808080" }}>
                                    35
                                </Text>
                                <Text style={{ fontSize: hp(1.3), fontWeight: "bold", color: "#808080" }}>
                                    Mins
                                </Text>
                            </View>
                        </View>

                        {/* Servings */}
                        <View style={{ borderRadius: 100, backgroundColor: '#fbbf24', padding: 5 }}>
                            <View style={{
                                width: hp(6.5), height: hp(6.5),
                                flex: 1,
                                borderRadius: 50,
                                justifyContent: "center",
                                alignItems: 'center',
                                backgroundColor: '#FFF'
                            }}>
                                <UsersIcon size={hp(4)} strokeWidth={hp(2.5)}
                                    width={hp(4)} height={hp(4)} color={"#808080"} />
                            </View>
                            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', marginTop: 5 }}>
                                <Text style={{ fontSize: hp(2), fontWeight: "bold", color: "#808080" }}>
                                    3
                                </Text>
                                <Text style={{ fontSize: hp(1), fontWeight: "bold", color: "#808080" }}>
                                    Servings
                                </Text>
                            </View>
                        </View>

                        {/* Difficulty */}
                        <View style={{ borderRadius: 100, backgroundColor: '#fbbf24', padding: 5 }}>
                            <View style={{
                                width: hp(6.5), height: hp(6.5),
                                flex: 1,
                                borderRadius: 50,
                                justifyContent: "center",
                                alignItems: 'center',
                                backgroundColor: '#FFF'
                            }}>
                                <Square3Stack3DIcon size={hp(4)} strokeWidth={hp(2.5)}
                                    width={hp(4)} height={hp(4)} color={"#808080"} />
                            </View>
                            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', marginTop: 5 }}>
                                <Text style={{ fontSize: hp(2), fontWeight: "bold", color: "#808080" }}>
                                    Easy
                                </Text>
                            </View>
                        </View>

                        {/* Calories */}
                        <View style={{ borderRadius: 100, backgroundColor: '#fbbf24', padding: 5 }}>
                            <View style={{
                                width: hp(6.5), height: hp(6.5),
                                flex: 1,
                                borderRadius: 50,
                                justifyContent: "center",
                                alignItems: 'center',
                                backgroundColor: '#FFF'
                            }}>
                                <FireIcon size={hp(4)} strokeWidth={hp(2.5)}
                                    width={hp(4)} height={hp(4)} color={"#808080"} />
                            </View>
                            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', marginTop: 5 }}>
                                <Text style={{ fontSize: hp(2), fontWeight: "bold", color: "#808080" }}>
                                    300
                                </Text>
                                <Text style={{ fontSize: hp(1), fontWeight: "bold", color: "#808080" }}>
                                    Kcal
                                </Text>
                            </View>
                        </View>
                    </Animated.View>

                    {/* Ingredients */}
                    <Animated.View entering={FadeIn.delay(400).duration(700).springify().damping(12)}
                        style={{ marginVertical: 2 }}
                    >
                        <Text style={{
                            fontSize: hp(2.5),
                            fontWeight: 'bold',
                            color: "#808080"
                        }}>
                            Ingredients
                        </Text>
                        <View style={{
                            flexDirection: "row",
                            justifyContent: "space-between",
                            flexWrap: "wrap",
                        }}>
                            {ingredientsIndexes(meals).map((index) => {
                                return (
                                    <View key={index} style={{ width: "50%", padding: 5 }}>
                                        <Text style={{
                                            fontSize: hp(2),
                                            color: "#808080",
                                            fontWeight: '500'
                                        }}>
                                            {meals['strIngredient' + index]} - {meals['strMeasure' + index]}
                                        </Text>
                                    </View>
                                )
                            })}
                        </View>
                    </Animated.View>

                    {/* Instructions */}
                    <Animated.View entering={FadeIn.delay(600).duration(700).springify().damping(12)}
                        style={{ marginVertical: 2 }}
                    >
                        <Text style={{
                            fontSize: hp(2.5),
                            fontWeight: 'bold',
                            color: "#808080"
                        }}>
                            Instructions
                        </Text>
                        <Text style={{
                            fontSize: hp(2),
                            color: "#808080",
                            fontWeight: '500',
                            textAlign: 'left'
                        }}>
                            {meals?.strInstructions}
                        </Text>
                    </Animated.View>
                </View>
            )}
        </ScrollView>
    );
};

export default RecipeDetailsScreen;