import React, { useState, useEffect } from 'react';
import { View, TextInput, TouchableOpacity, Image, StyleSheet, Text, FlatList } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import BottomNavBar from '../components/BottomNavbar';
import axios from 'axios';

const SearchScreen = ({ navigation }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(false);
  const apiKeys = [
    'bf56d31f34f7dc25e10b85c38ebeb50f7feda90f',
    '69694db3792e4c4387992d79c64eb073',
    '0eb0cec32c98d0df795f8c12a544f510f42f24e1',
    'b9103835aeb7ae98a97a6e29351c294a7f0ded16',
    '52afdb46498d5e9f8a8ed0639de3492cceeb271f',
    '0345a5adffdd0c47575a635a5d50b4aa76a64c0e',
    'b8abaf0eebd246cba6e1bfb6d2987257',
  ];

  const attemptRequest = async (url) => {
    let validKeys = [...apiKeys];
    for (let i = 0; i < validKeys.length; i++) {
      const key = validKeys[i];
      try {
        const apiUrl = url.replace('{apiKey}', key);
        const response = await axios.get(apiUrl);
        return response;
      } catch (error) {
        if (error.response) {
          const status = error.response.status;
          if (status === 402 || status === 401) {
            console.warn(`API Key ${key} no válida, probando con otra.`);
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
    const fetchRecipes = async () => {
      const url = `https://api.spoonacular.com/recipes/complexSearch?number=20&apiKey={apiKey}&addRecipeInformation=true`;
      try {
        const response = await attemptRequest(url);
        setRecipes(response.data.results);
      } catch (error) {
        console.error('Error al obtener recetas:', error);
      }
    };
    fetchRecipes();
  }, []);

  const handleSearch = async (query) => {
    setSearchQuery(query);
    if (query.length > 2) {
      setLoading(true);
      try {
        const url = `https://api.spoonacular.com/recipes/complexSearch?query=${query}&apiKey={apiKey}`;
        const response = await attemptRequest(url);
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

  const filterRecipes = (criteria) => {
    return recipes.filter((recipe) => {
      if (criteria === 'vegano' && recipe.dietLabels?.includes('Vegan')) return true;
      if (criteria === 'vegetariano' && recipe.dietLabels?.includes('Vegetarian')) return true;
      if (criteria === 'sinTACC' && recipe.glutenFree) return true;
      if (criteria === 'sinLacteos' && recipe.dietLabels?.includes('Dairy-Free')) return true;
      return false;
    });
  };

  const renderRecipeItem = ({ item }) => (
    <TouchableOpacity
      onPress={() => {
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

      {loading ? (
        <Text>Cargando...</Text>
      ) : (
        <View style={styles.recipeList}>
          {['vegano', 'vegetariano', 'sinTACC', 'sinLacteos'].map((category) => (
            <View key={category} style={styles.categoryContainer}>
              <Text style={styles.categoryTitle}>{category.charAt(0).toUpperCase() + category.slice(1)}</Text>
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
      )}

      <BottomNavBar navigation={navigation} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fafafa',
    paddingHorizontal: 16,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    paddingTop: 5,
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
  recipeList: {
    marginTop: 20,
  },
  categoryContainer: {
    marginBottom: 30,
  },
  categoryTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
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
});

export default SearchScreen;
