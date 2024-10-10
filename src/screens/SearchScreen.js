import React, { useState, useEffect } from 'react';
import { View, TextInput, TouchableOpacity, Image, StyleSheet, Text, ScrollView, FlatList } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import BottomNavBar from '../components/BottomNavbar';
import axios from 'axios';

const SearchScreen = ({ navigation }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [categories, setCategories] = useState([]);
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(false);

  const apiKey = '69694db3792e4c4387992d79c64eb073';

  useEffect(() => {
    // Obtener recetas para las categorías predefinidas
    const fetchCategories = async () => {
      const exampleCategories = ['Vegano', 'Vegetariano', 'Panadería', 'Sin Tacc']; // Mismas categorías que en HomeScreen
      const categoriesData = await Promise.all(
        exampleCategories.map(async (category) => {
          const url = `https://api.spoonacular.com/recipes/complexSearch?query=${category}&number=5&apiKey=${apiKey}&addRecipeInformation=true`;
          const response = await axios.get(url);
          return { category, recipes: response.data.results };
        })
      );
      setCategories(categoriesData);
    };
    fetchCategories();
  }, []);

  const handleSearch = async (query) => {
    setSearchQuery(query);
    if (query.length > 2) {
      setLoading(true);
      try {
        const response = await axios.get(`https://api.spoonacular.com/recipes/complexSearch?query=${query}&apiKey=${apiKey}`);
        setRecipes(response.data.results);
      } catch (error) {
        console.error('Error al buscar recetas:', error);
      } finally {
        setLoading(false);
      }
    } else {
      setRecipes([]);
    }
  };

  const renderRecipeItem = ({ item }) => (
    <TouchableOpacity
      onPress={() => navigation.navigate('RecipeScreen', { recipe: item })}
      style={styles.recipeItem}
    >
      <Image source={{ uri: item.image }} style={styles.recipeImage} />
      <Text style={styles.recipeName}>{item.title}</Text>
    </TouchableOpacity>
  );

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
          {loading ? (
            <Text>Cargando...</Text>
          ) : (
            <FlatList
              data={recipes}
              renderItem={renderRecipeItem}
              keyExtractor={(item) => item.id.toString()}
            />
          )}
        </View>
      )}

      {searchQuery.length <= 2 && (
        <ScrollView>
          {categories.map((categoryData) => (
            <View key={categoryData.category}>
              <View style={styles.categoryHeader}>
                <Text style={styles.categoryTitle}>{categoryData.category}</Text>
                <TouchableOpacity onPress={() => navigation.navigate('CategoryRecipesScreen', { category: categoryData.category })}>
                  <Text style={styles.viewMoreText}>Ver más</Text>
                </TouchableOpacity>
              </View>
              <FlatList
                data={categoryData.recipes}
                renderItem={renderRecipeItem}
                horizontal
                keyExtractor={(item) => item.id.toString()}
              />
            </View>
          ))}
        </ScrollView>
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
  categoryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 10,
  },
  categoryTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  viewMoreText: {
    color: '#1E90FF',
  },
});

export default SearchScreen;
