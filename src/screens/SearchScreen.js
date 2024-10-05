import React, { useState } from 'react';
import { View, TextInput, TouchableOpacity, Image, StyleSheet, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import BottomNavBar from '../components/BottomNavbar';

const SearchScreen = ({ navigation }) => {
  const [searchQuery, setSearchQuery] = useState([]);
  const [recipes, setRecipes] = useState([]);

  const handleSearch = async (query) => {
    setSearchQuery(query);
    if (query.length > 2) { 
      try {
        const apiKey = '69694db3792e4c4387992d79c64eb073'; 
        const response = await fetch(`https://api.spoonacular.com/recipes/complexSearch?query=${query}&apiKey=${apiKey}`);
        const data = await response.json();
        setRecipes(data.results); 
      } catch (error) {
        console.error('Error fetching recipes:', error);
      }
    } else {
      setRecipes([]);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.searchBar}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="chevron-back" size={24} color="black" />
        </TouchableOpacity>
        <TextInput
          placeholder="Buscar"
          style={styles.searchInput}
          value={searchQuery}
          onChangeText={handleSearch}
        />
      </View>

      {searchQuery.length > 2 && recipes.length > 0 && (
        <View style={styles.resultsContainer}>
          {recipes.map((recipe) => (
            <TouchableOpacity
              key={recipe.id}
              onPress={() => navigation.navigate('RecipeScreen', { recipe })}
              style={styles.recipeItem}
            >
              <Image 
                source={{ uri: recipe.image }} 
                style={styles.recipeImage} 
              />
              <Text style={styles.recipeName}>{recipe.title}</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      <BottomNavBar navigation={navigation} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fafafa',
    paddingTop: 50,
    paddingHorizontal: 16,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  backButton: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    backgroundColor: '#f1f1f1',
    borderRadius: 30,
    fontSize: 16,
    padding: 15,
    height: 50,
    paddingLeft: 30,
  },
  resultsContainer: {
    marginVertical: 10,
    maxHeight: 150,
  },
  recipeItem: {
    padding: 10,
    backgroundColor: '#FFF',
    borderBottomColor: '#EEE',
    borderBottomWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  recipeImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 10,
  },
  recipeName: {
    fontSize: 18,
    color: '#333',
  },
});

export default SearchScreen;
