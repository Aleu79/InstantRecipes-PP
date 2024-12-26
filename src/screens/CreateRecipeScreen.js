import React, { useState, useEffect , useContext} from 'react';
import { View, Text, StyleSheet, Image, ScrollView, TextInput, TouchableOpacity, Alert } from 'react-native';
import Header from '../components/Headers/Header';
import * as ImagePicker from 'expo-image-picker'; 
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage'; 
import { storage } from '../../firebase/firebase-config';
import Icon from 'react-native-vector-icons/Ionicons';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { db } from '../../firebase/firebase-config'; 
import { auth } from '../../firebase/firebase-config'; 
import { useNavigation } from '@react-navigation/native';
import { Switch } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { UserContext } from '../context/UserContext'
import ToastWrapper from '../components/ToastWrapper';


const CreateRecipeScreen = () => {
  const { addNotification } = useContext(UserContext); 
  const navigation = useNavigation();
  const [activeTab, setActiveTab] = useState('ingredients');
  const [recipeName, setRecipeName] = useState('');
  const [recipeImage, setRecipeImage] = useState(null);
  const [ingredients, setIngredients] = useState([
    { name: '', quantity: '', unit: '' }
  ]);  
  const [preparation, setPreparation] = useState(['']);
  const [isVegan, setIsVegan] = useState(false);
  const [isVegetarian, setIsVegetarian] = useState(false);
  const [isGlutenFree, setIsGlutenFree] = useState(false);
  const [isDairyFree, setIsDairyFree] = useState(false);
  const [servings, setServings] = useState(''); 
  const [prepTime, setPrepTime] = useState('');
  const [categories] = useState(['Sin TACC', 'Sin lácteos', 'Vegetariano', 'Vegano']); 
  const [selectedCategory, setSelectedCategory] = useState('');
  const [isUploading, setIsUploading] = useState(false);

 

  // Solicitar permisos 
  const requestPermissions = async () => {
    const { status: mediaLibraryStatus } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (mediaLibraryStatus !== 'granted') {
      Alert.alert('Permiso requerido', 'Lo sentimos, necesitamos permisos para acceder a la galería.');
      return false;
    }
    return true;
  };  
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
  
    setIsUploading(true); 
  
    try {
      await uploadBytes(imageRef, blob);
  
      const url = await getDownloadURL(imageRef);
  
      setRecipeImage(url);
      ToastWrapper({ text1: 'La imagen se subió correctamente.' });
    } catch (error) {
      console.error('Error al subir la imagen:', error);
      ToastWrapper({ text1: 'No se pudo subir la imagen.' });
    } finally {
      setIsUploading(false);  
    }
  };
  

  const handleNavigateToRecipe = () => {
    navigation.navigate('MyRecipes', {
      recipe: {
        name: recipeName,
        image: recipeImage,
        ingredients,
        instructions: preparation,
        glutenFree: isGlutenFree,
        vegan: isVegan,
        vegetarian: isVegetarian,
        dairyFree: isDairyFree,
        preparationMinutes: prepTime,
        servings,
      },
    });
  };
  const generateId = () => {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()';
    let result = '';
    const length = 10;  
    
    for (let i = 0; i < length; i++) {
      const randomIndex = Math.floor(Math.random() * characters.length);
      result += characters[randomIndex];
    }
  
    return result;
  };
  

  const sanitizeInput = (input) => {
    return input.trim(); // Elimina espacios en blanco al inicio y al final
  };
  
  const saveRecipe = async () => {
    const user = auth.currentUser ; 
    if (!user) {
      Alert.alert('Error', 'Debes estar autenticado para guardar una receta.');
      return;
    }
  
    const sanitizedRecipeName = sanitizeInput(recipeName);
    const sanitizedServings = sanitizeInput(servings);
    const sanitizedPrepTime = sanitizeInput(prepTime);
  
    if (!recipeImage) {
      Alert.alert('Error', 'Debes subir una imagen para la receta.');
      return;
    }
  
    if (ingredients.length === 0 || ingredients.every(ingredient => !ingredient.name.trim())) {
      Alert.alert('Error', 'Debes agregar al menos un ingrediente.');
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
        addNotification('Error', 'Ya has alcanzado el límite de 10 recetas por mes.');   
        return;
      }
  
      const recipeData = {
        id: generateId(),
        recipeName: sanitizedRecipeName,
        recipeImage,
        ingredients,
        preparation,
        glutenFree: isGlutenFree,
        vegan: isVegan,
        vegetarian: isVegetarian,
        dairyFree: isDairyFree,
        prepTime: sanitizedPrepTime,
        servings: sanitizedServings,
        category: selectedCategory,
      };
  
      try {
        await setDoc(userDocRef, {
          misRecetas: [...currentRecipes, recipeData],
        }, { merge: true }); 
        ToastWrapper({ text1: `Receta "${sanitizedRecipeName}" guardada con éxito.` });
        addNotification(`Receta "${sanitizedRecipeName}" guardada con éxito.`, 'Receta guardada con éxito');   
  
        handleNavigateToRecipe();
  
      } catch (error) {
        console.error('Error al guardar la receta:', error);
        Alert.alert('Error', 'No se pudo guardar la receta. Inténtalo de nuevo más tarde.');
        addNotification('Error', 'No se pudo guardar la receta. Inténtalo de nuevo más tarde.');   
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
        {isUploading ? (
          <Text style={styles.loadingText}>Cargando...</Text>
        ) : (
          <TouchableOpacity onPress={pickImage}>
            <Image
              source={{ uri: recipeImage || 'https://dummyimage.com/400x200/c4c4c4/787878.png&text=Inserta+tu+imagen' }}
              style={styles.recipeImage}
            />
          </TouchableOpacity>
        )}
        <View style={styles.headerContainer}>
          <Header />
        </View>
      </View>
  
      <ScrollView style={styles.container}>
        <View style={styles.contentContainer}>
          {/* Nombre de la receta */}
          <TextInput
            style={styles.recipeName}
            placeholder="Nombre de la receta"
            value={recipeName}
            onChangeText={setRecipeName}
          />
  
          {/* Porciones y tiempo de preparación */}
          <View style={styles.detailscontainer}>
            <View style={styles.detailssubcontainer}>
              <TouchableOpacity>
                <Icon name="people-outline" size={24} color="#999" />
              </TouchableOpacity>
              <TextInput
                style={styles.inputDetail}
                placeholder="Porciones"
                value={servings}
                onChangeText={setServings}
              />
            </View>
            <View style={styles.detailssubcontainer}>
              <TouchableOpacity>
                <Icon name="time-outline" size={24} color="#999" />
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
        </View>
  
        <View style={styles.separator} />
  
        {/* Tabs de Ingredientes, Preparación y Dietas */}
        <View style={styles.tabsContainer}>
          {['ingredients', 'preparation', 'diettype'].map((tab) => (
            <TouchableOpacity
              key={tab}
              style={[styles.tabButton, activeTab === tab ? styles.activeTab : styles.inactiveTab]}
              onPress={() => setActiveTab(tab)}
            >
              <Text style={[styles.tabText, activeTab === tab && styles.activeTabText]}>
                {tab === 'ingredients'
                  ? 'Ingredientes'
                  : tab === 'preparation'
                  ? 'Preparación'
                  : 'Dietas'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
  
        {/* Contenido del Tab Activo */}
        {activeTab === 'ingredients' && (
          <View style={styles.ingredientsContainer}>
            {ingredients.map((ingredient, index) => (
              <View key={index} style={styles.mainContainer}>
                <View style={styles.ingredientWrapper}>
                  <View style={styles.ingredientInputContainer}>
                    <TextInput
                      style={styles.stepInput}
                      placeholder="Ingrediente"
                      value={ingredient.name}
                      onChangeText={(text) => handleIngredientChange(text, index, 'name')}
                    />
                  </View>
                  <View style={styles.smallInputContainer}>
                    <View style={styles.subInputRow}>
                      <TextInput
                        style={styles.smallInput}
                        placeholder="Cantidad"
                        keyboardType="numeric"
                        value={ingredient.quantity}
                        onChangeText={(text) => handleIngredientChange(text, index, 'quantity')}
                      />
                      <TextInput
                        style={styles.smallInput}
                        placeholder="Unidad"
                        value={ingredient.unit}
                        onChangeText={(text) => handleIngredientChange(text, index, 'unit')}
                      />
                    </View>
                  </View>
                </View>
                <TouchableOpacity onPress={() => handleRemoveIngredient(index)} style={styles.removeStepButton}>
                  <FontAwesome name="trash-o" size={26} color="red" />
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
                  style={styles.inputDetail}
                  placeholder="Paso de preparación"
                  value={step}
                  onChangeText={(text) => handleStepChange(text, index)}
                />
                <TouchableOpacity onPress={() => handleRemoveStep(index)} style={styles.removeStepButton}>
                  <FontAwesome name="trash-o" size={26} color="red" />
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
            {[
              { label: 'Vegano', value: isVegan, setter: setIsVegan },
              { label: 'Vegetariano', value: isVegetarian, setter: setIsVegetarian },
              { label: 'Sin TACC', value: isGlutenFree, setter: setIsGlutenFree },
              { label: 'Sin Lácteos', value: isDairyFree, setter: setIsDairyFree },
            ].map((diet) => (
              <View key={diet.label} style={styles.dietTypeRow}>
                <Text style={styles.dietTypeLabel}>{diet.label}</Text>
                <Switch value={diet.value} onValueChange={diet.setter} />
              </View>
            ))}
          </View>
        )}
  
        {/* Botón para Guardar */}
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
  loadingText: {
    fontSize: 18,
    color: 'gray',
    textAlign: 'center',
    marginVertical: 10,
  },
  recipeImage: {
    width: '100%',
    height: 330,
    resizeMode: 'adjust',
  },
  headerContainer: {
    position: 'absolute',
    alignItems: "flex-start",
    justifyContent: "space-between",
    width: "100%",
    paddingTop: 20,
    paddingLeft: 10,
    flexDirection: "row",
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
  ingredientsContainer: {
    marginBottom: 20,
  },
  mainContainer:{
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 15,
  },
  ingredientWrapper: {
    width: '85%',
  },
  ingredientInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 10,
    alignSelf: 'center',
  }, 
  removeStepButton: {
    marginHorizontal: 10,
  },
  stepInput: {
    flex: 1,
    height: 50,
    paddingHorizontal: 10,
    backgroundColor: '#f5f5f5',
    borderRadius: 10,
    marginHorizontal: 5,
    width: '80%',
  },
  smallInputContainer: {
    marginTop: 10,
    width: '95%',
    margin: 'auto',
  },
  subInputRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  smallInput: {
    width: '48%',  
    height: 45,
    paddingHorizontal: 10,
    backgroundColor: '#f5f5f5',
    borderRadius: 25,
    paddingHorizontal: 20,
  },
  detailscontainer:{
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignSelf: 'center',
  },
  detailssubcontainer:{
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
    marginHorizontal: 10,
  },
  dietTypeContainer: {
    padding: 20,
    backgroundColor: '#fff',
    borderRadius: 10,
  },
  dietTypeTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  dietTypeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginVertical: 5,

  },
  dietTypeLabel: {
    fontSize: 16,
  },
  tabsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 20,
    borderRadius: 25,
    backgroundColor: '#f5f5f5',
    padding: 5,
    width: '95%',
    margin: 'auto',
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
  ingredientWrapper: {
    marginBottom: 15,
  },
  preparationContainer: {
    width: '90%',
    margin: 'auto',
  },
  stepRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  stepInput: {
    flex: 1,
    width: '45%',
    height: 50,
    marginLeft: 10,
    fontSize: 15,
    lineHeight: 20,
    textAlignVertical: 'top',
    borderBottomColor: '#999',
    backgroundColor: '#f5f5f5',
    borderRadius: 40,
    paddingHorizontal: 20,
    textAlignVertical: 'center',
  },
  addButton: {
    backgroundColor: '#4CAF50',
    padding: 10,
    alignItems: 'center',
    borderRadius: 4,
  },
  addButtonText: {
    color: 'white',
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
  separator: {
    height: 1,
    backgroundColor: '#ddd',
    marginVertical: 16,
  },
});

export default CreateRecipeScreen;
