import React from 'react';
import { View, TouchableOpacity, Text, FlatList, Image, ScrollView, StyleSheet } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';

const SearchScreenCateg = ({ categories = [], filterRecipes, navigation }) => {
  console.log('Categories:', categories);  

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
  if (!categories || categories.length === 0) {
    return <Text style={styles.noCategoriesText}>No hay categorías disponibles.</Text>;
  }

  return (
    <ScrollView style={styles.recipeList}>
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
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  recipeList: {
    flex: 1,
  },
  categoryContainer: {
    marginBottom: 20,
  },
  categoryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  categoryTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  verMasButton: {
    color: 'blue',
    fontSize: 16,
  },
  recipeContainer: {
    width: 150,
    marginRight: 10,
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  recipeImage: {
    width: '100%',
    height: 100,
    borderRadius: 5,
  },
  bookmarkButton: {
    position: 'absolute',
    top: 5,
    right: 5,
    backgroundColor: '#000',
    borderRadius: 50,
    padding: 5,
  },
  detalles: {
    fontSize: 12,
    color: '#777',
    marginTop: 5,
  },
  recipeName: {
    fontSize: 14,
    fontWeight: 'bold',
    marginTop: 5,
  },
  noCategoriesText: {
    fontSize: 16,
    color: 'gray',
    textAlign: 'center',
    marginTop: 20,
  },
});

export default SearchScreenCateg;
