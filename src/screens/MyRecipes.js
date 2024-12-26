import React, { useState, useEffect, useContext } from 'react';
import { View, Text, StyleSheet, FlatList, Image, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';
import { doc, getDoc, setDoc } from 'firebase/firestore'; 
import { auth, db } from '../../firebase/firebase-config';
import { capitalizeFirstLetter } from '../helpers/utils';
import { UserContext } from '../context/UserContext';

const MyRecipes = () => {
  const { addNotification } = useContext(UserContext);
  const navigation = useNavigation();
  const [myRecipes, setMyRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingAction, setLoadingAction] = useState(false); 
  const [selectedRecipes, setSelectedRecipes] = useState(new Set());
  const [isSelectionMode, setIsSelectionMode] = useState(false);

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

const handlePinUnpinRecipes = async () => {
  setLoadingAction(true);

  const user = auth.currentUser;
  if (user) {
    try {
      const userDocRef = doc(db, 'users', user.email);
      const userDoc = await getDoc(userDocRef);

      if (userDoc.exists()) {
        const userData = userDoc.data();
        const updatedRecipes = userData.misRecetas.map(recipe => {
          if (selectedRecipes.has(recipe.id)) {
            return { ...recipe, isPinned: !recipe.isPinned };
          }
          return recipe;
        });

        const sortedRecipes = updatedRecipes.sort((a, b) => {
          if (a.isPinned === b.isPinned) return 0;
          return a.isPinned ? -1 : 1;
        });

        await setDoc(userDocRef, { ...userData, misRecetas: updatedRecipes });
        setMyRecipes(sortedRecipes);
        setSelectedRecipes(new Set());
        setIsSelectionMode(false);

        addNotification('Éxito', 'Las recetas han sido actualizadas correctamente.');
      }
    } catch (error) {
      console.error('Error al fijar/desfijar recetas:', error);
      Alert.alert('Error', 'No se pudieron actualizar las recetas. Inténtalo de nuevo más tarde.');
    }
  }

  setLoadingAction(false);
};


  const handleDeleteSelectedRecipes = async () => {
    setLoadingAction(true); 

    const user = auth.currentUser;
    if (user) {
      try {
        const userDocRef = doc(db, 'users', user.email);
        const userDoc = await getDoc(userDocRef);

        if (userDoc.exists()) {
          const userData = userDoc.data();
          const updatedRecipes = userData.misRecetas.filter(
            (recipe) => !selectedRecipes.has(recipe.id)
          );

          await setDoc(userDocRef, { misRecetas: updatedRecipes });

          setMyRecipes(updatedRecipes);
          setSelectedRecipes(new Set());
          setIsSelectionMode(false);
          addNotification('Éxito', 'Las recetas han sido eliminadas correctamente.');
        }
      } catch (error) {
        console.error('Error al eliminar recetas:', error);
        Alert.alert('Error', 'No se pudieron eliminar las recetas. Inténtalo de nuevo más tarde.');
      }
    }

    setLoadingAction(false);
  };

  const confirmDeleteSelected = () => {
    Alert.alert(
      'Confirmar eliminación',
      `¿Estás seguro de que deseas eliminar ${selectedRecipes.size} receta(s)?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Eliminar', onPress: handleDeleteSelectedRecipes },
      ],
      { cancelable: false }
    );
  };

  const toggleRecipeSelection = (recipeId) => {
    setSelectedRecipes((prevSelected) => {
      const newSelected = new Set(prevSelected);
      if (newSelected.has(recipeId)) {
        newSelected.delete(recipeId);
      } else {
        newSelected.add(recipeId);
      }

      if (newSelected.size === 0) {
        setIsSelectionMode(false);
      }

      return newSelected;
    });
  };

  const handleLongPress = (recipeId) => {
    setIsSelectionMode(true);
    toggleRecipeSelection(recipeId);
  };

  const handlePress = (recipe) => {
    if (isSelectionMode) {
      toggleRecipeSelection(recipe.id);
    } else {
      navigation.navigate('MyRecipeScreen', { recipe });
    }
  };

  const renderHeader = () => (
    <View style={styles.headerContainer}>
      {isSelectionMode ? (
        <>
          <View style={styles.headerLeft}>
            <TouchableOpacity
              onPress={() => {
                setSelectedRecipes(new Set());
                setIsSelectionMode(false);
              }}
              style={styles.headerButton}
            >
              <Icon name="close" size={24} color="#000" />
            </TouchableOpacity>
            <Text style={styles.title}>
              {selectedRecipes.size} seleccionados
            </Text>
          </View>
          <TouchableOpacity onPress={handlePinUnpinRecipes} style={styles.headerButton}>
            <Icon name="pin" size={24} color="#f77f00" />
          </TouchableOpacity>
          <TouchableOpacity onPress={confirmDeleteSelected} style={styles.headerButton}>
            <Icon name="trash-outline" size={24} color="#f77f00" />
          </TouchableOpacity>
        </>
      ) : (
        <>
          <Text style={styles.title}>Mis Recetas</Text>
          <TouchableOpacity
            style={styles.fab}
            onPress={() => navigation.navigate('CreateRecipeScreen')}
          >
            <Icon name="add" size={30} color="#fff" />
          </TouchableOpacity>
        </>
      )}
    </View>
  );

  const renderRecipe = ({ item }) => (
    <TouchableOpacity 
      style={[
        styles.recipeContainer,
        selectedRecipes.has(item.id) && styles.selectedRecipe
      ]}
      onLongPress={() => handleLongPress(item.id)}
      onPress={() => handlePress(item)}
    >
      <View style={styles.recipeImageWrapper}>
        {item.recipeImage ? (
          <Image source={{ uri: item.recipeImage }} style={styles.recipeImage} />
        ) : (
          <Image source={require('../../assets/placeholder.png')} style={styles.recipeImage} />
        )}
        
        {item.isPinned && (
          <View style={styles.pinIndicator}>
          <Image source={require('../../assets/pin.png')} style={styles.pinImage} />
          </View>
        )}
  
        {selectedRecipes.has(item.id) && (
          <View style={styles.checkmarkOverlay}>
            <Icon name="checkmark-circle" size={24} color="#fff" />
          </View>
        )}
      </View>
      <Text style={styles.recipeName}>
        {capitalizeFirstLetter(item.recipeName)}
      </Text>
      <Text style={styles.detalles}>
        {item.prepTime} min • {item.servings} porciones
      </Text>
    </TouchableOpacity>
  );
  

  return (
    <View style={styles.container}>
      {renderHeader()}
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

      {loadingAction && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#f77f00" />
          <Text style={styles.loadingText}>Procesando...</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 15,
  },
  headerButton: {
    padding: 8,
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
    width: '45%',
    marginBottom: 15,
    borderRadius: 15,
    overflow: 'hidden',
    position: 'relative',
    paddingBottom: 10,
    marginRight: 10,
  },
  detalles: {
    color: '#adadad',
  },
  recipeName: {
    textAlign: 'left',
    color: '#000',
    fontSize: 16,
  },
  recipeImageWrapper: {
    position: 'relative',
    width: '100%',
    height: 120,
    borderRadius: 8,
    overflow: 'hidden',
  },
  recipeImage: {
    width: '100%',
    height: 250,
    borderRadius: 20,
    resizeMode: 'cover',
  },
  pinIndicator: {
    position: 'absolute',
    top: 5,
    right: 2,
    backgroundColor: '#fff',
    borderRadius: 50,
    padding: 5,
  },
  pinImage: {
    width: 30,  
    height: 30, 
    resizeMode: 'contain', 
  },
  checkmarkOverlay: {
    position: 'absolute',
    top: 0,
    right: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    borderRadius: 50,
    padding: 5,
  },
  selectedRecipe: {
    backgroundColor: '#f0f0f0',
  },
  fab: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    backgroundColor: '#f77f00',
    padding: 15,
    borderRadius: 50,
    elevation: 5,
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 18,
    color: '#f77f00',
    marginTop: 15,
  },
});

export default MyRecipes;
