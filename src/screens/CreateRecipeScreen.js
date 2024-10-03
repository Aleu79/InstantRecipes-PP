import React, { useState } from 'react';
import { View, Text, StyleSheet, Image, ScrollView, TextInput, TouchableOpacity } from 'react-native';
import Header from '../components/Headers/Header';
import * as ImagePicker from 'expo-image-picker'; 
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage'; 
import { storage } from '../../firebase/firebase-config';
import Icon from 'react-native-vector-icons/Ionicons';

const CreateRecipeScreen = () => {
  const [activeTab, setActiveTab] = useState('ingredients');
  const [recipeName, setRecipeName] = useState('');
  const [recipeImage, setRecipeImage] = useState(null);
  const [ingredients, setIngredients] = useState(['']);
  const [preparation, setPreparation] = useState(['']);
  const [vegan, setVegan] = useState(true);
  const [glutenFree, setGlutenFree] = useState(true);
  const [vegetarian, setVegetarian] = useState(true);
  const [servings, setServings] = useState(''); 
  const [prepTime, setPrepTime] = useState(''); 

  const pickImage = async () => {
    // Implementación para seleccionar imagen
  };

  const saveRecipe = async () => {
    alert(`Receta "${recipeName}" guardada con éxito.`);
    console.log({
        recipeName,
        recipeImage,
        ingredients,
        preparation,
        vegan,
        glutenFree,
        vegetarian,
        prepTime,
        servings,
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

            <View style={styles.row}>
                <View style={styles.iconInputWrapper}>
                    <Icon name="people-outline" size={24} color="#333" />
                    <TextInput
                        style={styles.inputDetail}
                        placeholder="Porciones"
                        value={servings}
                        onChangeText={setServings}
                    />
                    </View>
                    <View style={styles.iconInputWrapper}>
                    <Icon name="time-outline" size={24} color="#333" />
                    <TextInput
                        style={styles.inputDetail}
                        placeholder="Tiempo de preparación"
                        value={prepTime}
                        onChangeText={setPrepTime}
                        multiline={true}
                    />
                </View>
            </View> 

          {/* Tabs de Gluten Free, Vegetariano, Vegano */}
            <View style={styles.tabsContainer}>
                <TouchableOpacity
                    style={[styles.tabButton, vegan ? styles.activeTab : styles.inactiveTab]}
                    onPress={() => setVegan(true)}
                >
                    <Text style={[styles.tabText, vegan && styles.activeTabText]}>Vegano</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.tabButton, !vegan ? styles.activeTab : styles.inactiveTab]}
                    onPress={() => setVegan(false)}
                >
                    <Text style={[styles.tabText, !vegan && styles.activeTabText]}>No Vegano</Text>
                </TouchableOpacity>
                </View>

                <View style={styles.tabsContainer}>
                <TouchableOpacity
                    style={[styles.tabButton, glutenFree ? styles.activeTab : styles.inactiveTab]}
                    onPress={() => setGlutenFree(true)}
                >
                    <Text style={[styles.tabText, glutenFree && styles.activeTabText]}>Gluten Free</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.tabButton, !glutenFree ? styles.activeTab : styles.inactiveTab]}
                    onPress={() => setGlutenFree(false)}
                >
                    <Text style={[styles.tabText, !glutenFree && styles.activeTabText]}>Con Gluten</Text>
                </TouchableOpacity>
                </View>

                <View style={styles.tabsContainer}>
                <TouchableOpacity
                    style={[styles.tabButton, vegetarian ? styles.activeTab : styles.inactiveTab]}
                    onPress={() => setVegetarian(true)}
                >
                    <Text style={[styles.tabText, vegetarian && styles.activeTabText]}>Vegetariano</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.tabButton, !vegetarian ? styles.activeTab : styles.inactiveTab]}
                    onPress={() => setVegetarian(false)}
                >
                    <Text style={[styles.tabText, !vegetarian && styles.activeTabText]}>No Vegetariano</Text>
                </TouchableOpacity>
            </View>


          {/* Tabs de Ingredientes y Preparación */}
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

          {/* Renderizar contenido según la pestaña activa */}
          {activeTab === 'ingredients' && (
            <View style={styles.ingredientsContainer}>
              {ingredients.map((ingredient, index) => (
                <View key={index} style={styles.ingredientRow}>
                  <TextInput
                    style={styles.textArea}
                    placeholder={`Ingrediente ${index + 1}`}
                    value={ingredient}
                    onChangeText={(text) => handleIngredientChange(text, index)}
                  />
                </View>
              ))}
              <TouchableOpacity onPress={handleAddIngredient} style={styles.addButton}>
                <Text style={styles.addButtonText}>+ Añadir ingrediente</Text>
              </TouchableOpacity>
            </View>
          )}

          {activeTab === 'preparation' && (
            <View style={styles.preparationContainer}>
              {preparation.map((step, index) => (
                <View key={index} style={styles.ingredientRow}>
                  <TextInput
                    style={styles.textArea}
                    placeholder={`Paso ${index + 1}`}
                    value={step}
                    onChangeText={(text) => handleStepChange(text, index)}
                  />
                </View>
              ))}
              <TouchableOpacity onPress={handleAddStep} style={styles.addButton}>
                <Text style={styles.addButtonText}>+ Añadir paso</Text>
              </TouchableOpacity>
            </View>
          )}

          <TouchableOpacity onPress={saveRecipe} style={styles.saveButton}>
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
    row: {
      flexDirection: 'row',
      justifyContent: 'center',
      marginBottom: 20,
    },
    iconInputWrapper: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      justifyContent: 'center',
      flex: 1,
      marginHorizontal: 35,
      paddingBottom: 5,
      maxWidth: '50%',
    },
    inputDetail: {
      flex: 1,
      fontSize: 16,
      marginLeft: 10,
      backgroundColor: 'transparent',
      width: '30%',
      lineHeight: 20,
      height: 'auto',
      textAlignVertical: 'top',
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
