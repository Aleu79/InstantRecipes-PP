import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Image, ScrollView, TextInput, TouchableOpacity, Alert } from 'react-native';
import Header from '../components/Headers/Header';
import * as ImagePicker from 'expo-image-picker'; 
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage'; 
import { storage } from '../../firebase/firebase-config';
import Icon from 'react-native-vector-icons/Ionicons';
import { Picker } from '@react-native-picker/picker';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { db } from '../../firebase/firebase-config'; 
import { auth } from '../../firebase/firebase-config'; 

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
  const [categories] = useState(['Sin TACC', 'Sin lácteos', 'Vegetariano', 'Vegano']); 
  const [selectedCategory, setSelectedCategory] = useState('');
 

  // Request media library permissions
  const requestPermissions = async () => {
    const { status: mediaLibraryStatus } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (mediaLibraryStatus !== 'granted') {
      Alert.alert('Permiso requerido', 'Lo sentimos, necesitamos permisos para acceder a la galería.');
      return false;
    }
    return true;
  };
  let recipeCounter = 0;
  const generateId = () => {
    const timestamp = Date.now();
    const randomNum = Math.floor(Math.random() * 1000); 
    return `recipe_${timestamp}_${randomNum}`;
  };
  
  
  // Pick an image from the gallery
  const pickImage = async () => {
    const hasPermission = await requestPermissions();
    if (!hasPermission) {
      Alert.alert('Permisos denegados', 'No tienes permisos para acceder a la galería de imágenes.');
      return;
    }
  
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });
  
    if (result.canceled) {
      Alert.alert('Selección de imagen cancelada', 'No se seleccionó ninguna imagen.');
      return;
    }
  
    const selectedImage = result.assets[0];
  
    // Obtener el blob de la imagen seleccionada
    const response = await fetch(selectedImage.uri);
    const blob = await response.blob();
  
    // Extraer el nombre del archivo de la URI
    const filename = selectedImage.uri.substring(selectedImage.uri.lastIndexOf('/') + 1);
    const imageRef = ref(storage, `recipeImages/${filename}`);
  
    try {
      // Subir el blob a Firebase Storage
      await uploadBytes(imageRef, blob);
      
      // Obtener la URL de descarga de la imagen
      const url = await getDownloadURL(imageRef);
      
      // Establecer la URL de la imagen en el estado o donde lo necesites
      setRecipeImage(url);
      
      Alert.alert('Éxito', 'La imagen se subió correctamente.');
    } catch (error) {
      console.error('Error al subir la imagen:', error);
      Alert.alert('Error', 'No se pudo subir la imagen.');
    }
  };

  // Save the recipe and the image URL to Firestore
  const saveRecipe = async () => {
    const user = auth.currentUser; // Obtener el usuario autenticado
    if (!user) {
      Alert.alert('Error', 'Debes estar autenticado para guardar una receta.');
      return;
    }
  
    const userDocRef = doc(db, 'users', user.email);
    const userDoc = await getDoc(userDocRef);
  
    if (userDoc.exists()) {
      const userData = userDoc.data();
      const currentRecipes = userData.misRecetas || [];
  
      // Verificar cuántas recetas tiene el usuario
      if (currentRecipes.length >= 10) {
        Alert.alert('Error', 'Ya has alcanzado el límite de 10 recetas por mes.');
        return;
      }
  
      const recipeData = {
        id: generateId(),
        recipeName,
        recipeImage,
        ingredients,
        preparation,
        dietType,
        glutenFree,
        vegetarian,
        prepTime,
        servings,
        category: selectedCategory,
      };
  
      try {
        // Guardar la receta en el documento del usuario en Firestore
        await setDoc(userDocRef, {
          misRecetas: [...currentRecipes, recipeData],
        }, { merge: true }); 
  
        Alert.alert(`Receta "${recipeName}" guardada con éxito.`);
      } catch (error) {
        console.error('Error al guardar la receta:', error);
        Alert.alert('Error', 'No se pudo guardar la receta. Inténtalo de nuevo más tarde.');
      }
    } else {
      Alert.alert('Error', 'No se encontraron datos para este usuario.');
    }
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

          <View>
            <View style={styles.detailscontainer}>
                <TouchableOpacity>
                  <Icon name={'people-outline'} size={24} color="#999" />
                </TouchableOpacity>
                <TextInput
                  style={styles.inputDetail}
                  placeholder="Porciones"
                  value={servings}
                  onChangeText={setServings}
                />
              </View>
              <View style={styles.detailscontainer}>
                <TouchableOpacity>
                  <Icon name={'time-outline'} size={24} color="#999" />
                </TouchableOpacity>
                <TextInput
                  style={styles.inputDetail}
                  placeholder="Preparación"
                  value={prepTime}
                  onChangeText={setPrepTime}
                  multiline={true}
                />
              </View>
            </View>


            <View style={styles.iconInputWrapper}>
              <Icon name="list-outline" size={24} color="#333" />
              <Picker
                selectedValue={selectedCategory}
                style={styles.inputDetail}
                onValueChange={(itemValue) => setSelectedCategory(itemValue)}
              >
                <Picker.Item label="Vino" value="" />
                {categories.map((category, index) => (
                  <Picker.Item key={index} label={category} value={category} />
                ))}
              </Picker>
            </View>
          </View>

          <View style={styles.separator} />

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

          {activeTab === 'ingredients' && (
            <View style={styles.ingredientsContainer}>
            {ingredients.map((ingredient, index) => (
              <View key={index} style={styles.ingredientRow}>
                <TextInput
                  style={styles.ingredientInput}
                  placeholder="Ingrediente"
                  value={ingredient}
                  onChangeText={(text) => handleIngredientChange(text, index)}
                />
                <TouchableOpacity onPress={() => handleRemoveIngredient(index)}>
                  <Icon name="trash-outline" size={24} color="red" />
                </TouchableOpacity>
              </View>
            ))}
            <TouchableOpacity style={styles.addButton} onPress={handleAddIngredient}>
              <Text style={styles.addButtonText}>Agregar Ingrediente</Text>
            </TouchableOpacity>
          </View>

          )}

          {activeTab === 'preparation' && (
            <View style={styles.preparationContainer}>
              {preparation.map((step, index) => (
               <View key={index} style={styles.stepRow}>
               <TextInput
                 style={styles.stepInput}
                 placeholder="Paso de preparación"
                 value={step}
                 onChangeText={(text) => handleStepChange(text, index)}
               />
               <TouchableOpacity onPress={() => handleRemoveStep(index)} style={styles.removeStepButton}>
                 <Text style={styles.removeStepText}>X</Text>
               </TouchableOpacity>
             </View>
             
              ))}
              <TouchableOpacity style={styles.addButton} onPress={handleAddStep}>
                <Text style={styles.addButtonText}>Agregar Paso</Text>
              </TouchableOpacity>
            </View>
          )}

          {activeTab === 'diettype' && (
            <View style={styles.dietTypeContainer}>
              <Text style={styles.dietTypeText}>Tipo de dieta:</Text>
              <View style={styles.dietTypeOptions}>
                <TouchableOpacity onPress={() => setDietType('vegan')} style={[styles.dietTypeButton, dietType === 'vegan' && styles.selectedDietType]}>
                  <Text>Vegano</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => setDietType('vegetarian')} style={[styles.dietTypeButton, dietType === 'vegetarian' && styles.selectedDietType]}>
                  <Text>Vegetariano</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => setDietType('glutenFree')} style={[styles.dietTypeButton, dietType === 'glutenFree' && styles.selectedDietType]}>
                  <Text>Sin TACC</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => setDietType('dairyFree')} style={[styles.dietTypeButton, dietType === 'dairyFree' && styles.selectedDietType]}>
                  <Text>Sin Lácteos</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          <TouchableOpacity style={styles.saveButton} onPress={saveRecipe}>
            <Text style={styles.saveButtonText}>Guardar Receta</Text>
          </TouchableOpacity>
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
    resizeMode: 'adjust',
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
    fontSize: 20,
    textAlign: 'left',
    marginVertical: 40,
    padding: 10,
    backgroundColor: '#f5f5f5',
    borderRadius: 40,
    paddingHorizontal: 15,
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
    alignItems: 'center',
    justifyContent: 'flex-start',
    flex: 1,
    marginHorizontal: 35,
    paddingBottom: 5,
    borderRadius: 30,
    height: 50,
  },
  inputDetail: {
    flex: 1,
    width: '45%',
    height: 'auto',
    marginLeft: 10,
    fontSize: 15,
    lineHeight: 20,
    textAlignVertical: 'top',
    borderBottomColor: '#999',
    padding: 10,
    backgroundColor: '#f5f5f5',
    borderRadius: 40,
    paddingHorizontal: 10,
  },
  detailscontainer:{
    width: '45%',
    height: 50,
    flexDirection: 'row',
    alignItems: 'center',
    borderColor: '#e6e6e6',
    borderWidth: 1,
    borderRadius: 40,
    backgroundColor: '#f5f5f5',
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  tabsDietas: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 20,
    borderRadius: 25,
    backgroundColor: '#f5f5f5',
    padding: 5,
    width: '',
  },
  ButtonDieta: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
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
    backgroundColor: '#e86900',
    borderRadius: 30,
    padding: 15,
    alignItems: 'center',
    width: '80%',
    justifyContent:'center',
    marginVertical: 15,
    margin:'auto',
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  pickerContainer: {
    marginBottom: 16,
  },
  pickerLabel: {
    fontSize: 16,
    marginBottom: 8,
  },
  picker: {
    height: 50,
    width: '100%',
  },
  separator: {
    height: 1,
    backgroundColor: '#ddd',
    marginVertical: 16,
  },
});

export default CreateRecipeScreen;
