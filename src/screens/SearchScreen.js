import React, { useState, useEffect } from 'react';
import { 
  View, 
  TextInput, 
  TouchableOpacity, 
  StyleSheet, 
  Text, 
  FlatList, 
  Image, 
  ActivityIndicator,
  ScrollView
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import BottomNavBar from '../components/BottomNavbar';
import axios from 'axios';
import SearchScreenCateg from './SearchScreenCateg';

const SearchScreen = ({ navigation, route }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [activeFilters, setActiveFilters] = useState([]);
  
  const { includedList = [] } = route.params || {};

  const apiKeys = ['7049b3cba3134fb090258c4f100093ff'];

  useEffect(() => {
    if (includedList && includedList.length > 0) {
      setActiveFilters(includedList);
      fetchRecipesByIngredients(includedList);
    }
  }, [includedList]);

  const attemptRequest = async (url) => {
    let validKeys = [...apiKeys];
    for (let i = 0; i < validKeys.length; i++) {
      const key = validKeys[i];
      try {
        const apiUrl = url.replace('{apiKey}', key);
        const response = await axios.get(apiUrl);
        return response;
      } catch (error) {
        if (error.response && (error.response.status === 402 || error.response.status === 401)) {
          console.warn(`API Key ${key} no válida, probando con otra.`);
          continue;
        }
        throw error;
      }
    }
    throw new Error('No hay claves de API disponibles o todas alcanzaron el límite');
  };

  const fetchRecipesByIngredients = async (ingredients) => {
    setLoading(true);
    try {
      const ingredientsString = ingredients.map(ing => ing.name).join(',');
      const url = `https://api.spoonacular.com/recipes/findByIngredients?ingredients=${ingredientsString}&apiKey={apiKey}&number=10`;
      const response = await attemptRequest(url);
      
      if (response.data && response.data.length > 0) {
        setRecipes(response.data);
        setError(null);
      } else {
        setRecipes([]);
        setError("No se encontraron recetas con esos ingredientes.");
      }
    } catch (err) {
      setError("Hubo un error al obtener las recetas.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (query) => {
    setSearchQuery(query);
    if (query.length > 2) {
      setLoading(true);
      try {
        const url = `https://api.spoonacular.com/recipes/complexSearch?query=${query}&apiKey={apiKey}`;
        const response = await attemptRequest(url);
        setRecipes(response.data.results);
        setError(null);
      } catch (error) {
        setError('Error al realizar la búsqueda');
      } finally {
        setLoading(false);
      }
    } else if (activeFilters.length > 0) {
      fetchRecipesByIngredients(activeFilters);
    } else {
      setRecipes([]);
    }
  };

  const renderRecipeItem = ({ item }) => {
    // Preparar los datos de la receta en el formato correcto
    const formattedRecipe = {
      id: item.id,
      name: item.title,
      image: item.image,
      instructions: item.instructions || '',
      ingredients: item.usedIngredients || [],
      glutenFree: item.glutenFree || false,
      vegan: item.vegan || false,
      vegetarian: item.vegetarian || false,
      preparationMinutes: item.readyInMinutes || 0,
      servings: item.servings || 2,
      dairyFree: item.dairyFree || false
    };
  
    return (
      <TouchableOpacity 
        style={styles.recipeCard}
        onPress={() => navigation.navigate('RecipeScreen', { recipe: formattedRecipe })}
      >
        <Image 
          source={{ uri: item.image }} 
          style={styles.recipeImage} 
          resizeMode="cover"
        />
        <View style={styles.recipeInfo}>
          <Text style={styles.recipeName}>{item.title}</Text>
          {item.usedIngredients && (
            <View style={styles.ingredientTags}>
              {item.usedIngredients.map((ing, index) => (
                <View key={index} style={styles.ingredientTag}>
                  <Text style={styles.ingredientTagText}>{ing.name}</Text>
                </View>
              ))}
            </View>
          )}
        </View>
      </TouchableOpacity>
    );
  };
  

  const renderActiveFilters = () => {
    if (activeFilters.length === 0) return null;

    return (
      <ScrollView 
        horizontal 
        style={styles.filtersContainer} 
        showsHorizontalScrollIndicator={false}
      >
        {activeFilters.map((filter, index) => (
          <View key={index} style={styles.filterTag}>
            <Text style={styles.filterTagText}>{filter.name}</Text>
          </View>
        ))}
      </ScrollView>
    );
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
        <TouchableOpacity 
          onPress={() => navigation.navigate('FilterByIngre')} 
          style={styles.filterButton}
        >
          <Ionicons name="filter-outline" size={24} color="black" />
        </TouchableOpacity>
      </View>
      <SearchScreenCateg />  
      {renderActiveFilters()}

      {loading ? (
        <ActivityIndicator size="large" color="#f57c00" style={styles.loader} />
      ) : error ? (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      ) : (
        <FlatList
          data={recipes}
          renderItem={renderRecipeItem}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.recipeList}
          ListEmptyComponent={
            <Text style={styles.noResultsText}>
              {searchQuery.length > 2 ? "No se encontraron recetas." : ""}
            </Text>
          }
        />
      )}

      <BottomNavBar navigation={navigation} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingHorizontal: 16,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 10,
    backgroundColor: '#fafafa',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  backButton: {
    padding: 5,
  },
  searchInput: {
    flex: 1,
    marginLeft: 10,
    fontSize: 16,
  },
  filterButton: {
    padding: 5,
  },
  filtersContainer: {
    flexDirection: 'row',
    marginVertical: 10,
  },
  filterTag: {
    backgroundColor: '#f57c00',
    borderRadius: 12, 
    paddingHorizontal: 8, 
    paddingVertical: 6,   
    marginRight: 6,       
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  filterTagText: {
    color: '#fff',
    fontSize: 20, 
    fontWeight: '500', 
    textAlign: 'center',
  },
  recipeCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  recipeImage: {
    width: '100%',
    height: 200,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },
  recipeInfo: {
    padding: 16,
  },
  recipeName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  ingredientTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  ingredientTag: {
    backgroundColor: '#f0f0f0',
    borderRadius: 16,
    paddingHorizontal: 10,
    paddingVertical: 4,
    marginRight: 8,
    marginBottom: 8,
  },
  ingredientTagText: {
    fontSize: 12,
    color: '#666',
  },
  loader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    color: 'red',
    fontSize: 16,
    textAlign: 'center',
  },
  noResultsText: {
    textAlign: 'center',
    color: '#666',
    marginTop: 20,
  },
  recipeList: {
    paddingTop: 16,
  },
});

export default SearchScreen;