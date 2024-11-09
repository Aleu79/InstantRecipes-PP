import { Pressable, StyleSheet, Text, View, Image, Platform } from 'react-native';
import React from 'react';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import MasonryList from '@react-native-seoul/masonry-list';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { CachedImage } from '../helpers/image'; 
import Loading from './Loading';
import { useNavigation } from '@react-navigation/native';

const RecipeCard = ({ item, index, navigation }) => {
    let isEven = index % 2 === 0;

    return (
        <Animated.View
            entering={FadeInDown.delay(index * 100).duration(600).springify().damping(12)}
        >
            <Pressable
                style={[
                    styles.pressableContainer,
                    isEven ? styles.evenPadding : styles.oddPadding,
                ]}
                onPress={() => { navigation.navigate("RecipeDetailsScreen", { ...item }) }}
            >
                {Platform.OS === 'ios' ? (
                    <CachedImage
                        uri={item.strMealThumb}
                        style={[
                            styles.recipeImage,
                            index % 3 === 0 ? styles.smallImage : styles.largeImage,
                        ]}
                        sharedTransitionTag={item.strMeal}
                    />
                ) : (
                    <Image
                        source={{ uri: item.strMealThumb }}
                        style={[
                            styles.image,
                            index % 3 === 0 ? styles.smallImage : styles.largeImage,
                        ]}
                        sharedTransitionTag={item.strMeal}
                    />
                )}
                <Text style={styles.recipeName}>
                    {item.strMeal.length > 20 ? item.strMeal.slice(0, 20) + '...' : item.strMeal}
                </Text>
            </Pressable>
        </Animated.View>
    );
};

// Recipes Component
const Recipes = ({ meals, categories }) => {
    const navigation = useNavigation();

    return (
            <View style={styles.container}>
                <Text style={styles.title}>Recetas</Text>
                <View>
                    {categories.length === 0 || meals.length === 0 ? (
                        <Loading size="large" style={styles.loading} />
                    ) : (
                        <MasonryList
                            data={meals}
                            keyExtractor={(item) => item.idMeal}
                            numColumns={2}
                            showsVerticalScrollIndicator={false}
                            renderItem={({ item, index }) => (
                                <RecipeCard item={item} index={index} navigation={navigation} />
                            )}
                            onEndReachedThreshold={0.1}
                        />
                    )}
                </View>
            </View>
    );
};

export default Recipes;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        marginHorizontal: 10,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        textAlign: 'left',
        marginVertical: 10,
        marginBottom: 10,
        color: '#000',
    },
    loading: {
        marginVertical: 20,
    },
    pressableContainer: {
        backgroundColor: '#fff',
        borderRadius: 10,
        marginVertical: 10,
        padding: 15,
        justifyContent: 'space-around',
    },
    evenPadding: {
        paddingLeft: 0,
        paddingRight: 8,
    },
    oddPadding: {
        paddingLeft: 8,
        paddingRight: 0,
    },
    recipeImage: {
        width: '100%',
        height: 200,
        borderRadius: 20,
    },
    smallImage: {
        height: hp(25),
    },
    largeImage: {
        height: hp(35),
    },
    mealText: {
        fontSize: hp(2),
        color: '#808080',
    },
    recipeName: {
      fontSize: 18,
      fontWeight: 'bold',
      marginTop: 5,
      color: '#000',
    },
});