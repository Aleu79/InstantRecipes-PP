import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, Image, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';
import Header from '../components/Headers/Header';
import { doc, getDoc, setDoc } from 'firebase/firestore'; 
import { auth, db } from '../../firebase/firebase-config';
import { capitalizeFirstLetter } from '../helpers/utils';

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
            if (userData && userData.misRecetas) {
              setMyRecipes(userData.misRecetas); 
            } else {
              Alert.alert('Error', 'No tienes recetas creadas.');
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

  const handleDeleteRecipe = async (recipeId) => {
    const user = auth.currentUser;
    if (user) {
      try {
        const userDocRef = doc(db, 'users', user.email);
        const userDoc = await getDoc(userDocRef);
  
        if (userDoc.exists()) {
          const userData = userDoc.data();
          const updatedRecipes = userData.misRecetas.map((recipe) =>
            recipe.id === recipeId
              ? {
                  ...recipe,
                  category: "", 
                  dietType: "", 
                  glutenFree: "", 
                  prepTime: "", 
                  servings: "", 
                  vegetarian: "", 
                  recipeName: "",
                  ingredients: [],
                  preparation: [],
                }
              : recipe
          );
  
          await setDoc(userDocRef, { misRecetas: updatedRecipes });
  
          setMyRecipes(updatedRecipes);
          Alert.alert('Éxito', 'Los campos específicos se han eliminado correctamente.');
        } else {
          Alert.alert('Error', 'No se encontraron datos para este usuario.');
        }
      } catch (error) {
        console.error('Error al eliminar campos:', error);
        Alert.alert('Error', 'No se pudieron eliminar los campos. Inténtalo de nuevo más tarde.');
      }
    } else {
      Alert.alert('Error', 'Debes estar autenticado para realizar esta acción.');
    }
  };
  
  const confirmDelete = (recipeId) => {
    Alert.alert(
      'Confirmar eliminación',
      '¿Estás seguro de que deseas eliminar esta receta?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Eliminar', onPress: () => handleDeleteRecipe(recipeId) },
      ],
      { cancelable: false }
    );
  };

  const renderRecipe = ({ item }) => (
    <TouchableOpacity style={styles.recipeContainer}>
      {item.recipeImage ? (
        <Image source={{ uri: item.recipeImage }} style={styles.recipeImage} />
      ) : (
        <View style={styles.placeholderImage}>
          <Text style={styles.placeholderText}>Sin Imágen</Text>
        </View>
      )}
      <TouchableOpacity onPress={() => navigation.navigate('MyRecipeScreen', { recipe: item })}>
        <Text style={styles.detalles}>
          {item.prepTime} min • {item.servings} porciones
        </Text>
        <Text style={styles.recipeName}>
          {capitalizeFirstLetter(item.recipeName)}
        </Text>
      </TouchableOpacity>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Header />
      <Text style={styles.title}>Mis recetas</Text>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#f77f00" />
          <Text style={styles.loadingText}>Cargando recetas...</Text>
        </View>
      ) : myRecipes.length > 0 ? (
        <FlatList
          data={myRecipes}
          renderItem={renderRecipe}
          keyExtractor={(item) => item.id ? item.id.toString() : Math.random().toString()}
          contentContainerStyle={styles.flatListContainer}
          numColumns={2} 
          columnWrapperStyle={styles.columnWrapper}
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
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginVertical: 20,
    color: '#000',
  },
  flatListContainer: {
    justifyContent: 'center',
  },
  columnWrapper: {
    justifyContent: 'space-between',
    marginBottom: 10,
    marginHorizontal: 10,
  },  
  recipeContainer: {
    width: '48%', 
    marginBottom: 10,
    borderRadius: 20,
    overflow: 'hidden',
    backgroundColor: '#fff',
    padding: 15,
  },
  recipeImage: {
    width: '100%',
    height: 250,
    borderRadius: 20,
    resizeMode: 'contain',
  },
  detalles: {
    color: '#adadad',
  },
  recipeName: {
    textAlign: 'left',
    color: '#000',
    marginVertical: 5,
    fontSize: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    color: '#f77f00',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    marginTop: 10,
    color: '#aaa',
    fontSize: 16,
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
  },
});

export default MyRecipes;
