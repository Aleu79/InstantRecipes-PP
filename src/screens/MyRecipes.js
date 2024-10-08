import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, Image, TouchableOpacity, Alert } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';
import Header from '../components/Headers/Header';
import { collection, getDoc, doc } from 'firebase/firestore'; 
import { auth, db } from '../../firebase/firebase-config';

const MyRecipes = () => {
  const navigation = useNavigation();
  const [myRecipes, setMyRecipes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRecipes = async () => {
      const user = auth.currentUser;

      if (user) {
        try {
          const userDocRef = doc(db, 'users', user.email);
          const userDoc = await getDoc(userDocRef);
          
          if (userDoc.exists()) {
            const userData = userDoc.data();
            if (userData && userData.recipesCreate) {
              setMyRecipes(userData.recipesCreate);
            }
          } else {
            Alert.alert('Error', 'No se encontraron datos para este usuario.');
          }
        } catch (error) {
          console.error('Error al obtener recetas:', error);
          Alert.alert('Error', 'No se pudieron cargar las recetas. Inténtalo de nuevo más tarde.');
        }
      } else {
        Alert.alert('Error', 'Debes estar autenticado para ver tus recetas.');
      }
      setLoading(false);
    };

    fetchRecipes();
  }, []);

  const renderRecipe = ({ item }) => (
    <TouchableOpacity
      style={styles.recipeCard}
      onPress={() => navigation.navigate('RecipeScreen', { recipeId: item.id })}
    >
      <Image source={{ uri: item.recipeImage }} style={styles.recipeImage} />
      <View style={styles.recipeInfo}>
        <Text style={styles.recipeName}>{item.recipeName}</Text>
        <Text style={styles.recipeCategory}>{item.category}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Header />

      {loading ? (
        <Text>Cargando recetas...</Text>
      ) : myRecipes.length > 0 ? (
        <FlatList
          data={myRecipes}
          renderItem={renderRecipe}
          keyExtractor={(item) => item.id} 
        />
      ) : (
        <View style={styles.emptyContainer}>
          <Icon name="cafe-outline" size={60} color="#aaa" />
          <Text style={styles.emptyText}>No tienes recetas creadas</Text>
        </View>
      )}

      <TouchableOpacity 
        style={styles.fab}
        onPress={() => navigation.navigate('CreateRecipeScreen')}
      >
        <Icon name="add" size={30} color="#fff" />
      </TouchableOpacity>
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
  fab: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    backgroundColor: '#f77f00',
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3.84,
  },
});

export default MyRecipes;
