import React, { useRef, useState, useEffect } from 'react';
import { ScrollView, View, TextInput, TouchableOpacity, Image, StyleSheet, Text } from 'react-native';
import Header from '../components/Headers/Header';
import BottomNavBar from '../components/BottomNavbar';

const SearchScreen = ({ navigation }) => {
  const categoriesScrollRef = useRef();
  const [categoryImages, setCategoryImages] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
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
      <Header />
      <View style={styles.navbar}>
        <Text style={styles.searchPrompt}>Busca tus recetas favoritas!</Text>
      </View>

      {/* Campo de búsqueda */}
      <View>
        <TextInput
          placeholder="Buscar"
          style={styles.searchInput}
          value={searchQuery}
          onChangeText={handleSearch}
        />
      </View>

      {/* Resultados de búsqueda */}
      {searchQuery.length > 2 && recipes.length > 0 && (
        <ScrollView style={styles.resultsContainer}>
          {recipes.map((recipe) => (
            <TouchableOpacity
              key={recipe.id}
              onPress={() => navigation.navigate('RecipeDetail', { recipeId: recipe.id })}
              style={styles.recipeItem}
            >
              <Image 
                source={{ uri: recipe.image }} 
                style={styles.recipeImage} 
              />
              <Text style={styles.recipeName}>{recipe.title}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}

      {/* Categorías */}
      <View style={styles.carouselContainer}>
        <ScrollView
          ref={categoriesScrollRef}
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.categoriesContainer}
        >
          {/* Botones de categorías */}
          {categoryImages.map((item, index) => (
            <View key={index} style={styles.categoryContainer}>
              <TouchableOpacity
                style={styles.btnCategoria}
                onPress={() => navigation.navigate('CategoryRecipes', { category: item.category })}
              >
                <Image source={{ uri: item.url }} style={styles.categoryImage} />
              </TouchableOpacity>
              <Text style={styles.categoryText}>{item.category}</Text>
            </View>
          ))}
        </ScrollView>
      </View>
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
  navbar: {
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  searchPrompt: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FF4500',
  },
  searchInput: {
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
  carouselContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-start',
    marginBottom: 20,
    paddingHorizontal: 16,
    marginTop: 15,
    width: '100%',
  },
  categoryContainer: {
    alignItems: 'center',
    marginRight: 10,
    marginBottom: 10,
  },
  btnCategoria: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFA500',
  },
  categoryImage: {
    width: '100%',
    height: '100%',
    borderRadius: 40,
    resizeMode: 'cover',
  },
  categoryText: {
    marginTop: 5,
    fontSize: 14,
    color: '#333',
    textAlign: 'center',
  },
});

export default SearchScreen;
