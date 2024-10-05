import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Image, ScrollView, TextInput, TouchableOpacity, Alert } from 'react-native';
import Header from '../components/Headers/Header';
import * as ImagePicker from 'expo-image-picker'; 
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage'; 
import { storage } from '../../firebase/firebase-config';
import Icon from 'react-native-vector-icons/Ionicons';
import { Picker } from '@react-native-picker/picker';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../../firebase/firebase-config'; 

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
  const [categories, setCategories] = useState([]); 
  const [selectedCategory, setSelectedCategory] = useState('');
  const [loading, setLoading] = useState(true); 

  const fetchCategories = async () => {
    try {
      const categoriesCollection = collection(db, 'categories'); 
      const snapshot = await getDocs(categoriesCollection);
      const fetchedCategories = snapshot.docs.map(doc => doc.data().name);
      setCategories(fetchedCategories);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching categories:', error);
      Alert.alert('Error', 'No se pudieron cargar las categorías. Inténtalo de nuevo más tarde.');
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const requestPermissions = async () => {
    const { status: mediaLibraryStatus } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (mediaLibraryStatus !== 'granted') {
      Alert.alert('Permiso requerido', 'Lo sentimos, necesitamos permisos para acceder a la galería.');
      return false;
    }
    return true;
  };

  // Function to pick an image
  const pickImage = async () => {
    const hasPermission = await requestPermissions();
    if (!hasPermission) return;

    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (result.assets && result.assets.length > 0) {
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
        console.error('Error al subir la imagen:', error);
        Alert.alert('Error', 'No se pudo subir la imagen.'); 
      }
    }
  };

  const saveRecipe = async () => {
    Alert.alert(`Receta "${recipeName}" guardada con éxito.`);
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
      category: selectedCategory,
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

<View>
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

            <View style={styles.iconInputWrapper}>
              <Icon name="list-outline" size={24} color="#333" />
              <Picker
                selectedValue={selectedCategory}
                style={styles.inputDetail}
                onValueChange={(itemValue) => setSelectedCategory(itemValue)}
              >
                <Picker.Item label="Seleccione una categoría" value="" />
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
                >
                  <Picker.Item label="Vegana" value="vegan" />
                  <Picker.Item label="Vegetariana" value="vegetarian" />
                  <Picker.Item label="Sin gluten" value="glutenFree" />
                </Picker>
              </View>
              <View style={styles.pickerContainer}>
                <Text style={styles.pickerLabel}>¿Sin gluten?</Text>
                <Picker
                  selectedValue={glutenFree}
                  onValueChange={(itemValue) => setGlutenFree(itemValue)}
                >
                  <Picker.Item label="Sí" value="yes" />
                  <Picker.Item label="No" value="no" />
                </Picker>
              </View>
              <View style={styles.pickerContainer}>
                <Text style={styles.pickerLabel}>¿Vegetariano?</Text>
                <Picker
                  selectedValue={vegetarian}
                  onValueChange={(itemValue) => setVegetarian(itemValue)}
                >
                  <Picker.Item label="Sí" value="yes" />
                  <Picker.Item label="No" value="no" />
                </Picker>
              </View>
            </View>
          )}
        </View>

        <TouchableOpacity style={styles.saveButton} onPress={saveRecipe}>
          <Text style={styles.saveButtonText}>Guardar receta</Text>
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
    textAlign: 'left',
    marginVertical: 40,
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
    fontSize: 16,
    marginLeft: 10,
    backgroundColor: 'transparent',
    width: '30%',
    lineHeight: 20,
    height: 'auto',
    textAlignVertical: 'top',
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
