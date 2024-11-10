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
  const [selectedCategoryRecipes, setSelectedCategoryRecipes] = useState([]); // Nuevo estado para recetas de la categoría seleccionada
  const apiKeys = [
    '69694db3792e4c4387992d79c64eb073',
    '0eb0cec32c98d0df795f8c12a544f510f42f24e1',
    'b9103835aeb7ae98a97a6e29351c294a7f0ded16',
    '52afdb46498d5e9f8a8ed0639de3492cceeb271f',
    '0345a5adffdd0c47575a635a5d50b4aa76a64c0e'
  ];

  const attemptRequest = async (url) => {
    let validKeys = [...apiKeys]; 
    for (let i = 0; i < validKeys.length; i++) {
      const key = validKeys[i];
      try {
        const response = await axios.get(url.replace('{apiKey}', key));
        return response; 
      } catch (error) {
        if (error.response) {
          const status = error.response.status;
          if (status === 402) {
            validKeys.splice(i, 1); 
            i--; 
          } else if (status === 401) {
            validKeys.splice(i, 1);
            i--; 
          } else {
            console.error('Error en la solicitud:', error);
            throw error;
          }
        } else {
          console.error('Error en la solicitud:', error);
          throw error; 
        }
      }
    }
    throw new Error('No hay API keys disponibles o todas alcanzaron el límite');
  };

  useEffect(() => {
    const fetchCategories = async () => {
      const exampleCategories = ['Vegano', 'Vegetariano', 'Panadería', 'Sin Tacc'];
      const categoriesData = await Promise.all(
        exampleCategories.map(async (category) => {
          const url = `https://api.spoonacular.com/recipes/complexSearch?query=${category}&number=5&apiKey={apiKey}&addRecipeInformation=true`;
          try {
            const response = await attemptRequest(url);
            console.log(`Categorías recibidas para ${category}:`, response.data.results); 
            console.log('URL de la API:', url);

            return { category, recipes: response.data.results };
          } catch (error) {
            console.error(`Error al obtener recetas para ${category}:`, error);
          }
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
        const url = `https://api.spoonacular.com/recipes/complexSearch?query=${query}&apiKey={apiKey}`;
        const response = await attemptRequest(url);
        console.log('Recetas encontradas para la búsqueda:', response.data.results); 
        setRecipes(response.data.results);
        console.log('Recetas establecidas:', response.data.results);
      } catch (error) {
        console.error('Error al buscar recetas:', error);
      } finally {
        setLoading(false);
      }
    } else {
      setRecipes([]);
    }
  };

  const handleCategoryPress = async (category) => {
    const url = `https://api.spoonacular.com/recipes/complexSearch?query=${category}&number=5&apiKey={apiKey}&addRecipeInformation=true`;
    try {
      const response = await attemptRequest(url);
      setSelectedCategoryRecipes(response.data.results); // Guardar recetas de la categoría seleccionada
      navigation.navigate('CategoryRecipesScreen', { category }); // Navegar a la pantalla de recetas de la categoría
    } catch (error) {
      console.error(`Error al obtener recetas para ${category}:`, error);
    }
  };

  const renderRecipeItem = ({ item }) => (
    <TouchableOpacity
      onPress={() => {
        console.log('Receta seleccionada:', item); 
        navigation.navigate('RecipeScreen', { recipe: item });
      }}
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
        <TouchableOpacity onPress={() => navigation.navigate('FilterByIngre')} style={styles.filterButton}>
          <Ionicons name="filter" size={24} color="black" />
        </TouchableOpacity>
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
        <TouchableOpacity onPress={() => handleCategoryPress(categoryData.category)}>
          <Text style={styles.viewMoreText}>Ver más</Text>
        </TouchableOpacity>
      </View>

      {/* Aquí muevo el FlatList de las recetas de la categoría debajo del botón "Ver más" */}
      <FlatList
        data={categoryData.recipes}
        renderItem={renderRecipeItem}
        horizontal={false} // Cambié esto para que las recetas se muestren verticalmente
        keyExtractor={(item) => item.id.toString()}
        showsHorizontalScrollIndicator={false}
      />
    </View>
  ))}
  
  {/* Mostrar recetas de la categoría seleccionada */}
  {selectedCategoryRecipes.length > 0 && (
    <View>
      <Text style={styles.categoryTitle}>Recetas de la categoría seleccionada:</Text>
      <FlatList
        data={selectedCategoryRecipes}
        renderItem={renderRecipeItem}
        keyExtractor={(item) => item.id.toString()}
      />
    </View>
  )}
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
  filterButton: {
    marginLeft: 10,
  },
  resultsContainer: {
    marginVertical: 10,
  },
  recipeItem: {
    padding: 10,
    backgroundColor: '#FFF',
    borderRadius: 10,
    marginRight: 10,
    width: 150,
    alignItems: 'center',
  },
  recipeImage: {
    width: 100,
    height: 100,
    borderRadius: 10,
    marginBottom: 5,
  },
  recipeName: {
    fontSize: 16,
    color: '#333',
    textAlign: 'center',
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
  recipeList: {
    paddingLeft: 16,
  },
});

export default SearchScreen;