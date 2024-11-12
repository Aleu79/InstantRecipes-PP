import React, { useState, useEffect } from 'react';
import { View, TextInput, TouchableOpacity, StyleSheet, Text, FlatList, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import BottomNavBar from '../components/BottomNavbar';
import axios from 'axios';
import SearchScreenCateg from './SearchScreenCateg';

const SearchScreen = ({ navigation }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(false);
  
  const apiKeys = [
    '7049b3cba3134fb090258c4f100093ff',
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
            console.error('Error in request:', error);
            throw error;
          }
        } else {
          console.error('Error in request:', error);
          throw error;
        }
      }
    }
    throw new Error('No API keys available or all reached the limit');
  };

  useEffect(() => {
    const fetchRecipes = async () => {
      const url = `https://api.spoonacular.com/recipes/complexSearch?number=100&apiKey={apiKey}&addRecipeInformation=true&addRecipeInstructions=true&instructionsRequired=true&fillIngredients=true`;
      try {
        const response = await attemptRequest(url);
        setRecipes(response.data.results);
      } catch (error) {
        console.error('Error fetching recipes:', error);
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
        console.error('Error searching recipes:', error);
      } finally {
        setLoading(false);
      }
    } else {
      setRecipes([]);
    }
  };

  const renderRecipeItem = ({ item }) => (
    <View style={styles.recipeItem}>
      <Image source={{ uri: item.image }} style={styles.recipeImage} />
      <Text style={styles.recipeName}>{item.title}</Text>
    </View>
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
        <>
          {searchQuery.length > 2 ? (
            <FlatList
              data={recipes}
              renderItem={renderRecipeItem}
              keyExtractor={(item) => item.id.toString()}
              contentContainerStyle={styles.recipeList}
            />
          ) : (
            <SearchScreenCateg />
         )}
        </>
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
  recipeItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  recipeImage: {
    width: 50,
    height: 50,
    borderRadius: 5,
  },
  recipeName: {
    marginLeft: 12,
    fontSize: 16,
    flex: 1,
    textAlign: 'center',
  },
});

export default SearchScreen;
