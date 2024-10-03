import React, { useState } from 'react';
import { View, Text, StyleSheet, Image, ScrollView, TextInput, TouchableOpacity, Alert } from 'react-native';
import Header from '../components/Headers/Header';
import * as ImagePicker from 'expo-image-picker'; 
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage'; 
import { storage } from '../../firebase/firebase-config';
import Icon from 'react-native-vector-icons/Ionicons';
import TabOption from '../components/TabOption';

const CreateRecipeScreen = () => {
  const [activeTab, setActiveTab] = useState('ingredients');
  const [recipeName, setRecipeName] = useState('');
  const [recipeImage, setRecipeImage] = useState(null);
  const [ingredients, setIngredients] = useState(['']);
  const [preparation, setPreparation] = useState(['']);
  const [glutenFree, setGlutenFree] = useState(false);
  const [vegan, setVegan] = useState(false);
  const [vegetarian, setVegetarian] = useState(false);

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permiso necesario', 'Se requieren permisos para acceder a la galería.');
      return;
    }

    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      const selectedImage = result.assets[0];
      const response = await fetch(selectedImage.uri);
      const blob = await response.blob();

      const filename = selectedImage.uri.substring(selectedImage.uri.lastIndexOf('/') + 1);
      const imageRef = ref(storage, `recipeImages/${filename}`);

      try {
        await uploadBytes(imageRef, blob);
        const url = await getDownloadURL(imageRef);
        setRecipeImage(url); 
      } catch (error) {
        Alert.alert('Error', 'No se pudo subir la imagen.');
      }
    }
  };

  const saveRecipe = async () => {
    alert(`Receta "${recipeName}" guardada con éxito con imagen.`);
    console.log({
        recipeName,
        recipeImage,
        ingredients,
        preparation,
        glutenFree,
        vegan,
        vegetarian,
      });
  };

  const handleAddIngredient = () => {
    setIngredients([...ingredients, '']);
  };

  const handleAddStep = () => {
    setPreparation([...preparation, '']);
  };

  const handleIngredientChange = (text, index) => {
    const newIngredients = [...ingredients];
    newIngredients[index] = text;
    setIngredients(newIngredients);
  };

  const handleStepChange = (text, index) => {
    const newPreparation = [...preparation];
    newPreparation[index] = text;
    setPreparation(newPreparation);
  };

  const handleRemoveIngredient = (index) => {
    const newIngredients = ingredients.filter((_, i) => i !== index);
    setIngredients(newIngredients);
  };

  const handleRemoveStep = (index) => {
    const newPreparation = preparation.filter((_, i) => i !== index);
    setPreparation(newPreparation);
  };

  return (
    <>
      <View style={styles.imageContainer}>
        <TouchableOpacity onPress={pickImage}>
          <Image 
            source={{ uri: recipeImage || 'https://via.placeholder.com/400x200' }} 
            style={styles.recipeImage} 
          />
        </TouchableOpacity>
        <View style={styles.headerContainer}>
          <Header />
        </View>
      </View>

      <ScrollView style={styles.container}>
        <View style={styles.contentContainer}>
          <Text style={styles.recipeName}>Crear Nueva Receta</Text>

          <TextInput
            style={styles.input}
            placeholder="Nombre de la receta"
            value={recipeName}
            onChangeText={setRecipeName}
          />

          <View style={styles.inputcontainer}>
            <TextInput
                style={styles.inputdetail}
                placeholder="Porciones"
                value={recipeName}
                onChangeText={setRecipeName}
            />
            <TextInput
                style={styles.inputdetail}
                placeholder="Minutos de cocción"
                value={recipeName}
                onChangeText={setRecipeName}
            />
            <TextInput
                style={styles.inputdetail}
                placeholder="Minutos de preparación"
                value={recipeName}
                onChangeText={setRecipeName}
            />
          </View>

          <View style={styles.dietOptionsContainer}>
            <View>
                <TouchableOpacity
                    style={[styles.dietOptionButton, vegan ? styles.activeDietOption : styles.inactiveDietOption]}
                    onPress={() => setVegan(!vegan)}
                >
                    <Text style={[styles.tabText, vegan && styles.activeTabText]}>Vegano</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.dietOptionButton, !vegan ? styles.activeDietOption : styles.inactiveDietOption]}
                    onPress={() => setVegan(!vegan)}
                >
                    <Text style={[styles.tabText, !vegan && styles.activeTabText]}>No Vegano</Text>
                </TouchableOpacity>
            </View>
            <View>
                <TouchableOpacity
                    style={[styles.dietOptionButton, glutenFree ? styles.activeDietOption : styles.inactiveDietOption]}
                    onPress={() => setGlutenFree(!glutenFree)}
                >
                    <Text style={[styles.tabText, glutenFree && styles.activeTabText]}>Gluten Free</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.dietOptionButton, !glutenFree ? styles.activeDietOption : styles.inactiveDietOption]}
                    onPress={() => setGlutenFree(!glutenFree)}
                >
                    <Text style={[styles.tabText, !glutenFree && styles.activeTabText]}>Con Gluten</Text>
                </TouchableOpacity>
            </View>
            <View>
                <TouchableOpacity
                    style={[styles.dietOptionButton, vegan ? styles.activeDietOption : styles.inactiveDietOption]}
                    onPress={() => setVegan(!vegan)}
                >
                    <Text style={[styles.tabText, vegan && styles.activeTabText]}>Vegetariano</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.dietOptionButton, !vegan ? styles.activeDietOption : styles.inactiveDietOption]}
                    onPress={() => setVegan(!vegan)}
                >
                    <Text style={[styles.tabText, !vegan && styles.activeTabText]}>No Vegetariano</Text>
                </TouchableOpacity>
            </View>
          </View>


          <View style={styles.tabsContainer}>
            <TouchableOpacity
              style={[styles.tabButton, activeTab === 'ingredients' ? styles.activeTab : styles.inactiveTab]}
              onPress={() => setActiveTab('ingredients')}
            >
              <Text style={[styles.tabText, activeTab === 'ingredients' && styles.activeTabText]}>Ingredientes</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.tabButton, activeTab === 'preparation' ? styles.activeTab : styles.inactiveTab]}
              onPress={() => setActiveTab('preparation')}
            >
              <Text style={[styles.tabText, activeTab === 'preparation' && styles.activeTabText]}>Preparación</Text>
            </TouchableOpacity>
          </View>

          {activeTab === 'ingredients' ? (
            <View style={styles.ingredientsContainer}>
              {ingredients.map((ingredient, index) => (
                <View key={index} style={styles.ingredientRow}>
                  <TextInput
                    style={styles.textArea}
                    placeholder={`Ingrediente ${index + 1}`}
                    value={ingredient}
                    onChangeText={(text) => handleIngredientChange(text, index)}
                  />
                  <TouchableOpacity onPress={() => handleRemoveIngredient(index)} style={styles.removeButton}>
                    <Icon name="trash-outline" size={24} color="#FF6347" />
                  </TouchableOpacity>
                </View>
              ))}
              <TouchableOpacity onPress={handleAddIngredient} style={styles.addButton}>
                <Text style={styles.addButtonText}>+ Añadir ingrediente</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.preparationContainer}>
              {preparation.map((step, index) => (
                <View key={index} style={styles.ingredientRow}>
                  <TextInput
                    style={styles.textArea}
                    placeholder={`Paso ${index + 1}`}
                    value={step}
                    onChangeText={(text) => handleStepChange(text, index)}
                  />
                  <TouchableOpacity onPress={() => handleRemoveStep(index)} style={styles.removeButton}>
                    <Icon name="trash-outline" size={24} color="#FF6347" />
                  </TouchableOpacity>
                </View>
              ))}
              <TouchableOpacity onPress={handleAddStep} style={styles.addButton}>
                <Text style={styles.addButtonText}>+ Añadir paso</Text>
              </TouchableOpacity>
            </View>
          )}

          <TouchableOpacity style={styles.saveButton} onPress={saveRecipe}>
            <Text style={styles.saveButtonText}>Guardar Receta</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  imageContainer: {
    position: 'relative',
  },
  recipeImage: {
    width: '100%',
    height: 330,
    borderTopLeftRadius: 40,
    borderTopRightRadius: 40,
  },
  headerContainer: {
    position: 'absolute',
    top: 40,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 10,
  },
 contentContainer: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 40,
    borderTopRightRadius: 40,
    marginTop: -30,
    padding: 20,
  },
  recipeName: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'left',
    marginTop: 20,
  },
  input: {
    backgroundColor: '#f1f1f1',
    borderRadius: 30,
    padding: 15,
    marginBottom: 20,
    fontSize: 16,
    height: 50,
    paddingLeft: 20,
  },
  inputcontainer: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  inputdetail: {
    backgroundColor: '#f1f1f1',
    borderRadius: 30,
    padding: 15,
    marginBottom: 20,
    marginHorizontal: 5,
    fontSize: 16,
    height: 50,
    width: '30%',
    paddingLeft: 20,
  },
  dietOptionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
    borderRadius: 25,
    backgroundColor: '#f5f5f5',
    padding: 5,
  },
  dietOptionButton: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
  },
  activeDietOption: {
    backgroundColor: '#fff',
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 10,
  },
  inactiveDietOption: {
    backgroundColor: 'transparent',
  },
  tabsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 20,
    borderRadius: 25,
    backgroundColor: '#f5f5f5',
    padding: 5,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
  },
  activeTab: {
    backgroundColor: '#fff',
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 10,
  },
  inactiveTab: {
    backgroundColor: 'transparent',
  },
  tabText: {
    fontSize: 16,
    color: '#888',
  },
  activeTabText: {
    color: '#000',
    fontWeight: 'bold',
  },
  ingredientsContainer: {
    marginBottom: 20,
  },
  preparationContainer: {
    marginBottom: 20,
  },
  ingredientRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  textArea: {
    flex: 1,
    backgroundColor: '#f1f1f1',
    borderRadius: 30,
    padding: 15,
    fontSize: 16,
    marginRight: 10,
  },
  removeButton: {
    justifyContent: 'center',
    alignItems: 'center',
    width: 40,
    height: 40,
  },
  addButton: {
    padding: 10,
    alignItems: 'center',
  },
  addButtonText: {
    color: '#008CBA',
    fontSize: 16,
  },
  saveButton: {
    backgroundColor: '#4CAF50',
    borderRadius: 30,
    padding: 15,
    alignItems: 'center',
    marginTop: 20,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default CreateRecipeScreen;
