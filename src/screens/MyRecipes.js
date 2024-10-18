import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, Image, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';
import Header from '../components/Headers/Header';
import { doc, getDoc, setDoc } from 'firebase/firestore'; 
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
          // Filtramos las recetas para eliminar la receta con el id correspondiente
          const updatedRecipes = userData.misRecetas.filter(recipe => recipe.id !== recipeId);
  
          // Actualizamos el documento del usuario con las recetas filtradas
          await setDoc(userDocRef, { misRecetas: updatedRecipes });
  
          // Actualizamos el estado local para reflejar el cambio
          setMyRecipes(updatedRecipes);
          Alert.alert('Éxito', 'Receta eliminada correctamente.');
        } else {
          Alert.alert('Error', 'No se encontraron datos para este usuario.');
        }
      } catch (error) {
        console.error('Error al eliminar receta:', error);
        Alert.alert('Error', 'No se pudo eliminar la receta. Inténtalo de nuevo más tarde.');
      }
    } else {
      Alert.alert('Error', 'Debes estar autenticado para eliminar recetas.');
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
    <View style={styles.recipeCard}>
      {item.recipeImage ? (
        <Image source={{ uri: item.recipeImage }} style={styles.recipeImage} />
      ) : (
        <View style={styles.placeholderImage}>
          <Text style={styles.placeholderText}>Sin Imagen</Text>
        </View>
      )}
      <View style={styles.recipeInfo}>
        <Text style={styles.recipeName}>{item.recipeName || 'Receta sin nombre'}</Text>
        <Text style={styles.recipeCategory}>{item.category || 'Sin categoría'}</Text>
        <Text style={styles.recipeDetail}>Tipo de dieta: {item.dietType || 'No especificado'}</Text>
        <Text style={styles.recipeDetail}>Sin gluten: {item.glutenFree || 'No especificado'}</Text>
        <Text style={styles.recipeDetail}>Porciones: {item.servings || 'No especificado'}</Text>
        <Text style={styles.recipeDetail}>Tiempo de preparación: {item.prepTime || 'No especificado'} minutos</Text>
        <TouchableOpacity 
          style={styles.deleteButton}
          onPress={() => confirmDelete(item.id)}
        >
          <Text style={styles.deleteButtonText}>Eliminar</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
  

  return (
    <View style={styles.container}>
      <Header />

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
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
    padding: 10,
    backgroundColor: '#fff',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3.84,
  },
  recipeImage: {
    width: '100%',
    height: 150,
    borderRadius: 10,
    marginBottom: 10,
  },
  placeholderImage: {
    width: '100%',
    height: 150,
    borderRadius: 10,
    marginBottom: 10,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#eee',
  },
  placeholderText: {
    color: '#aaa',
    fontSize: 12,
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
  deleteButton: {
    marginTop: 10,
    backgroundColor: '#f77f00',
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
  },
  deleteButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
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
  flatListContainer: {
    paddingBottom: 80,
  },
});

export default MyRecipes;
