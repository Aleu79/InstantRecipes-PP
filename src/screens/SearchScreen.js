import React, { useState, useEffect } from 'react';
import { View, TextInput, TouchableOpacity, StyleSheet, Text, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import BottomNavBar from '../components/BottomNavbar';
import axios from 'axios';
import SearchScreenCateg from './SearchScreenCateg';

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
      const apiKey = '47cb148e73e74414829f9dd8c38a0c7e';
      const url = `https://api.spoonacular.com/recipes/complexSearch?number=100&apiKey=${apiKey}&addRecipeInformation=true&addRecipeInstructions=true&instructionsRequired=true&fillIngredients=true`;
      
      try {
        const response = await attemptRequest(url);
        console.log(response.data.results);
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
      const diets = recipe.diets ? recipe.diets.map((diet) => diet.toLowerCase()) : [];
  
      if (criteria === 'vegano' && diets.includes('vegan')) return true;
      if (criteria === 'vegetariano' && diets.includes('lacto ovo vegetarian')) return true;
      if (criteria === 'sinTACC' && recipe.glutenFree) return true;
      if (criteria === 'sinLacteos' && diets.includes('dairy free')) return true;
      return false;
    });
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
        <TouchableOpacity onPress={() => navigation.navigate('FilterByIngre')} style={styles.filterButton}>
          <Ionicons name="filter" size={24} color="black" />
        </TouchableOpacity>
      </View>

      {loading ? (
        <Text>Cargando...</Text>
      ) : (
        <ScrollView contentContainerStyle={styles.recipeList}>
          <SearchScreenCateg
            categories={['vegano', 'vegetariano', 'sinTACC', 'sinLacteos']}
            filterRecipes={filterRecipes}
            navigation={navigation}
          />
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
    paddingHorizontal: 16,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 10,
    backgroundColor: '#fff',
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
  recipeList: {
    marginTop: 20,
  },
});

export default SearchScreen;
