import React from 'react';
import { View, Text, TouchableOpacity, FlatList, StyleSheet, Image } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';

const SearchScreenCateg = ({ categories, filterRecipes, navigation }) => {
  const renderRecipeItem = ({ item }) => (
    <TouchableOpacity
      onPress={() => navigation.navigate('RecipeScreen', { recipe: item })}
      style={styles.recipeContainer}
    >
      <Image source={{ uri: item.image }} style={styles.recipeImage} />
      <TouchableOpacity style={styles.bookmarkButton}>
        <FontAwesome name="bookmark-o" size={24} color="#fff" />
      </TouchableOpacity>
      <Text style={styles.detalles}>
        {item.prepTime} min • {item.servings} porciones
      </Text>
      <Text style={styles.recipeName}>{item.title}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.recipeList}>
      {categories.map((category) => (
        <View key={category} style={styles.categoryContainer}>
          <View style={styles.categoryHeader}>
            <Text style={styles.categoryTitle}>
              {category.charAt(0).toUpperCase() + category.slice(1)}
            </Text>
            <TouchableOpacity onPress={() => navigation.navigate('CategoryRecipesScreen', { category })}>
              <Text style={styles.verMasButton}>Ver más</Text>
            </TouchableOpacity>
          </View>
          <FlatList
            data={filterRecipes(category)}
            renderItem={renderRecipeItem}
            keyExtractor={(item) => item.id.toString()}
            horizontal
            showsHorizontalScrollIndicator={false}
          />
        </View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  recipeList: {
    marginTop: 20,
  },
  categoryContainer: {
    marginBottom: 30,
  },
  categoryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  categoryTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  verMasButton: {
    fontSize: 16,
    color: '#007AFF',
    fontWeight: '500',
  },
  recipeContainer: {
    width: 200,
    marginBottom: 15,
    marginRight: 5,
    borderRadius: 15,
    overflow: 'hidden',
    paddingBottom: 10,
  },
  recipeImage: {
    width: '90%',
    height: 250,
    borderRadius: 15,
    resizeMode: 'cover',
  },
  detalles: {
    color: '#adadad',
    fontSize: 14,
    marginTop: 5,
  },
  recipeName: {
    textAlign: 'left',
    color: '#000',
    fontSize: 16,
    fontWeight: 'bold',
  },
  bookmarkButton: {
    position: 'absolute',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 5,
    top: 10,
    right: 10,
    padding: 5,
  },
});

export default SearchScreenCateg;
