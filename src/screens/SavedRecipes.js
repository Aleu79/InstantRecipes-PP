import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, Image, TouchableOpacity, Alert } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';
import Header from '../components/Headers/Header';
import { doc, getDoc } from 'firebase/firestore'; 
import AsyncStorage from '@react-native-async-storage/async-storage';
import { db } from '../../firebase/firebase-config';  
import BottomNavBar from '../components/BottomNavbar';

const SavedRecipes = () => {
  const navigation = useNavigation();
  const [savedRecipes, setSavedRecipes] = useState([]);

  useEffect(() => {
    const fetchRecipes = async () => {
      try {
        // Obtiene el correo electrónico del usuario actual
        const userEmail = await AsyncStorage.getItem('userEmail');

        if (!userEmail) {
          throw new Error("No se encontró el correo electrónico del usuario");
        }

        // Obtiene la referencia al documento del usuario
        const userRef = doc(db, 'users', userEmail);
        const userDoc = await getDoc(userRef);

        // Establece las recetas en el estado
        if (userDoc.exists()) {
          const misRecetas = userDoc.data().misRecetas || [];
          setSavedRecipes(misRecetas);
        } else {
          setSavedRecipes([]);
        }
      } catch (error) {
        console.error('Error al obtener las recetas guardadas:', error);
        Alert.alert('Error', 'Hubo un problema al cargar las recetas guardadas.');
      }
    };

    fetchRecipes();
  }, []);

  const renderIngredients = (ingredients) => {
    return ingredients.map((ingredient, index) => (
      <Text key={index} style={styles.recipeCategory}>
        {ingredient.amount} {ingredient.unit} {ingredient.name}
      </Text>
    ));
  };

  const renderRecipe = ({ item }) => (
    <TouchableOpacity style={styles.recipeCard} onPress={() => navigation.navigate('RecipeDetail', { recipeId: item.id })}>
      <Image source={{ uri: item.image }} style={styles.recipeImage} />
      <View style={styles.recipeInfo}>
        <Text style={styles.recipeName}>{item.name}</Text>
        <Text style={styles.recipeCategory}>Porciones: {item.servings}</Text>
        <Text style={styles.recipeCategory}>Ingredientes:</Text>
        {renderIngredients(item.ingredients)} 
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Header />
      
      {savedRecipes.length > 0 ? (
        <FlatList
          data={savedRecipes}
          renderItem={renderRecipe}
          keyExtractor={(item) => item.id}
        />
      ) : (
        <View style={styles.emptyContainer}>
          <Icon name="bookmark-outline" size={60} color="#aaa" />
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
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
    padding: 10,
    backgroundColor: '#fff',
  },
  recipeImage: {
    width: 70,
    height: 70,
    borderRadius: 10,
    marginRight: 15,
  },
  recipeInfo: {
    flex: 1,
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
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
});

export default SavedRecipes;
