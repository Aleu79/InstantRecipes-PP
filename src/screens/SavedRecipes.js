import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, Image, TouchableOpacity, Alert } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';
import Header from '../components/Headers/Header';
import AsyncStorage from '@react-native-async-storage/async-storage';  
import BottomNavBar from '../components/BottomNavbar';

const SavedRecipes = () => {
  const navigation = useNavigation();
  const [savedRecipes, setSavedRecipes] = useState([]);
  const [error, setError] = useState(null);
  const [cache, setCache] = useState({}); // Caché para almacenar recetas

  useEffect(() => {
    const fetchRecipes = async () => {
      try {
        const savedRecipesJSON = await AsyncStorage.getItem('savedRecipes');
        if (savedRecipesJSON) {
          const recipeIds = JSON.parse(savedRecipesJSON);
          console.log("IDs de recetas guardadas:", recipeIds); 
          const recipes = await Promise.all(recipeIds.map(fetchRecipeDetails));
          setSavedRecipes(recipes);
        } else {
          setSavedRecipes([]);
        }
      } catch (error) {
        console.error('Error al obtener las recetas guardadas:', error);
        Alert.alert('Error', 'Hubo un problema al cargar las recetas guardadas.');
        setError(error.message);
      }
    };

    fetchRecipes();
  }, []);

  const fetchRecipeDetails = async (id) => {
    if (cache[id]) {
      console.log(`Receta ${id} obtenida del caché.`);
      return cache[id]; // Retornar receta del caché
    }

    try {
      console.log(`Consultando la API para la receta ${id}...`);
      const response = await fetch(`https://api.spoonacular.com/recipes/${id}/information?apiKey=47cb148e73e74414829f9dd8c38a0c7e`);
      if (!response.ok) {
        const errorText = await response.text(); // Obtener el texto de error
        console.error(`Error de la API: ${errorText}`);
        throw new Error('Error al obtener los detalles de la receta');
      }
      const recipe = await response.json();
      const recipeData = {
        id: recipe.id,
        name: recipe.title,
        image: recipe.image,
        servings: recipe.servings,
        ingredients: recipe.extendedIngredients,
      };
      setCache((prevCache) => ({ ...prevCache, [id]: recipeData })); // Almacenar en caché
      return recipeData;
    } catch (error) {
      console.error('Error en fetchRecipeDetails:', error);
      throw error;
    }
  };

  const renderIngredients = (ingredients) => {
    if (!Array.isArray(ingredients)) {
      return <Text style={styles.recipeCategory}>Ingredientes no disponibles</Text>;
    }
    return (
      <FlatList
        data={ingredients}
        keyExtractor={(item, index) => index.toString()}
        renderItem={({ item }) => (
          <Text style={styles.ingredientText}>
            {item.amount} {item.unit} {item.name}
          </Text>
        )}
      />
    );
  };

  const renderRecipe = ({ item }) => (
    <TouchableOpacity 
      style={styles.recipeCard} 
      onPress={() => navigation.navigate('RecipeScreen', { recipeId: item.id })}
    >
      <Image source={{ uri: item.image }} style={styles.recipeImage} />
      <View style={styles.recipeInfo}>
        <Text style={styles.recipeName}>{item.name}</Text>
        <Text style={styles.recipeCategory}>Porciones: {item.servings}</Text>
        <Text style={styles.recipeCategory}>Ingredientes:</Text>
        {renderIngredients(item.ingredients)} 
      </View>
      <TouchableOpacity style={styles.saveIcon} onPress={() => handleRemoveRecipe(item.id)}>
        <Icon name="bookmark-outline" size={24} color="#ff6347" />
      </TouchableOpacity>
    </TouchableOpacity>
  );

  const handleRemoveRecipe = async (id) => {
    try {
      const savedRecipesJSON = await AsyncStorage.getItem('savedRecipes');
      if (savedRecipesJSON) {
        const recipeIds = JSON.parse(savedRecipesJSON);
        const updatedIds = recipeIds.filter(recipeId => recipeId !== id);
        await AsyncStorage.setItem('savedRecipes', JSON.stringify(updatedIds));

        // Obtener recetas actualizadas
        const updatedRecipes = await Promise.all(updatedIds.map(fetchRecipeDetails));
        setSavedRecipes(updatedRecipes); // Actualizar el estado con recetas obtenidas
      }
    } catch (error) {
      console.error('Error al eliminar la receta:', error);
      Alert.alert('Error', 'Hubo un problema al eliminar la receta.');
    }
  };

  return (
    <View style={styles.container}>
      <Header />
      {error && <Text style={styles.errorText}>{error}</Text>} 
      {savedRecipes.length > 0 ? (
        <FlatList
          data={savedRecipes}
          renderItem={renderRecipe}
          keyExtractor={(item) => item.id ? item.id.toString() : Math.random().toString()} 
        />
      ) : (
        <View style={styles.emptyContainer}>
          <Icon name="pizza" size={60} color="#aaa" />
          <Text style={styles.emptyText}>No guardaste ninguna receta todavía</Text>
        </View>
      )}
      <BottomNavBar navigation={navigation} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fafafa',
  },
  recipeCard: {
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
    backgroundColor: '#fff',
    elevation: 3, 
    shadowColor: '#000', 
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  recipeImage: {
    width: '100%', 
    height: 150,
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
  },
  recipeInfo: {
    padding: 10,
  },
  recipeName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  recipeCategory: {
    fontSize: 14,
    color: '#666',
  },
  ingredientText: {
    fontSize: 14,
    color: '#444',
    marginVertical: 2,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    marginTop: 10,
    fontSize: 16,
    color: '#aaa',
  },
  errorText: {
    color: 'red',
    textAlign: 'center',
    marginBottom: 10,
  },
  saveIcon: {
    position: 'absolute',
    top: 10,
    right: 10,
  },
});

export default SavedRecipes;
