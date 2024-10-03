import React, { useState } from 'react';
import { View, Text, StyleSheet, Image, ScrollView, TextInput, TouchableOpacity } from 'react-native';
import Header from '../components/Headers/Header';
import * as ImagePicker from 'expo-image-picker'; 
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage'; 
import { storage } from '../../firebase/firebase-config';
import Icon from 'react-native-vector-icons/Ionicons';
import { Picker } from '@react-native-picker/picker';

const CreateRecipeScreen = () => {
  const [activeTab, setActiveTab] = useState('ingredients');
  const [recipeName, setRecipeName] = useState('');
  const [recipeImage, setRecipeImage] = useState(null);
  const [ingredients, setIngredients] = useState(['']);
  const [preparation, setPreparation] = useState(['']);
  const [dietType, setDietType] = useState('vegan');
  const [glutenFree, setGlutenFree] = useState('no'); 
  const [vegetarian, setVegetarian] = useState('no'); 
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
        dietType,
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
            source={{ uri: recipeImage || 'https://dummyimage.com/400x200/c4c4c4/787878.png&text=Inserta+tu+im%C3%A1gen' }} 
            style={styles.recipeImage} 
          />
        </TouchableOpacity>
        <View style={styles.headerContainer}>
          <Header />
        </View>
      </View>

      <ScrollView style={styles.container}>
        <View style={styles.contentContainer}>
          <TextInput
            style={styles.recipeName}
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

          {/* Línea separadora */}
          <View style={styles.separator} />

          {/* Tabs de Ingredientes, Preparación y Dietas */}
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
            <TouchableOpacity
              style={[styles.tabButton, activeTab === 'diettype' ? styles.activeTab : styles.inactiveTab]}
              onPress={() => setActiveTab('diettype')}
            >
              <Text style={[styles.tabText, activeTab === 'diettype' && styles.activeTabText]}>Dietas</Text>
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
                  <TouchableOpacity onPress={() => handleRemoveIngredient(index)}>
                    <Icon name="trash-outline" size={24} color="red" />
                  </TouchableOpacity>
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
                  <TouchableOpacity onPress={() => handleRemoveStep(index)}>
                    <Icon name="trash-outline" size={24} color="red" />
                  </TouchableOpacity>
                </View>
              ))}
              <TouchableOpacity onPress={handleAddStep} style={styles.addButton}>
                <Text style={styles.addButtonText}>+ Añadir paso</Text>
              </TouchableOpacity>
            </View>
          )}

          {activeTab === 'diettype' && (
            <View style={styles.dietTypeContainer}>
              <View style={styles.pickerContainer}>
                <Text style={styles.pickerLabel}>Tipo de dieta:</Text>
                <Picker
                  selectedValue={dietType}
                  onValueChange={(itemValue) => setDietType(itemValue)}
                  style={styles.picker}
                >
                  <Picker.Item label="Vegano" value="vegan" />
                  <Picker.Item label="No Vegano" value="non-vegan" />
                </Picker>
              </View>

              <View style={styles.pickerContainer}>
                <Text style={styles.pickerLabel}>Sin TACC:</Text>
                <Picker
                  selectedValue={glutenFree}
                  onValueChange={(itemValue) => setGlutenFree(itemValue)}
                  style={styles.picker}
                >
                  <Picker.Item label="Sí" value="yes" />
                  <Picker.Item label="No" value="no" />
                </Picker>
              </View>

              <View style={styles.pickerContainer}>
                <Text style={styles.pickerLabel}>Vegetariano:</Text>
                <Picker
                  selectedValue={vegetarian}
                  onValueChange={(itemValue) => setVegetarian(itemValue)}
                  style={styles.picker}
                >
                  <Picker.Item label="Sí" value="yes" />
                  <Picker.Item label="No" value="no" />
                </Picker>
              </View>
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
    padding: 20,
    marginTop: -40,
  },
  recipeName: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  iconInputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  inputDetail: {
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
    paddingLeft: 10,
    marginLeft: 5,
    width: 100,
  },
  separator: {
    height: 1,
    backgroundColor: '#ccc',
    marginVertical: 20,
  },
  tabsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: '#000',
  },
  inactiveTab: {
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabText: {
    fontSize: 16,
  },
  activeTabText: {
    fontWeight: 'bold',
  },
  ingredientsContainer: {
    marginBottom: 20,
  },
  ingredientRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  textArea: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    padding: 10,
    marginRight: 10,
  },
  addButton: {
    backgroundColor: '#4CAF50',
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
  },
  addButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  preparationContainer: {
    marginBottom: 20,
  },
  dietTypeContainer: {
    marginBottom: 20,
  },
  pickerContainer: {
    marginBottom: 20,
  },
  pickerLabel: {
    fontWeight: 'bold',
    marginBottom: 5,
  },
  picker: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    padding: 10,
  },
  saveButton: {
    backgroundColor: '#4CAF50',
    padding: 15,
    borderRadius: 5,
    alignItems: 'center',
  },
  saveButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
});

export default CreateRecipeScreen;
