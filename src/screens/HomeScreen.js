import React, { useContext, useRef, useState, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Image, StatusBar, BackHandler, Alert } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons'; 
import { UserContext } from '../context/UserContext';
import { useTheme } from '../context/ThemeContext'; 
import { auth } from '../../firebase/firebase-config';
import { doc, getDoc, getFirestore } from 'firebase/firestore';
import Categories from '../components/Categories';
import Recipes from '../components/Recipes';
import axios from 'axios';
import BottomNavBar from '../components/BottomNavbar';
import AsyncStorage from '@react-native-async-storage/async-storage';
import LottieView from 'lottie-react-native';

const HomeScreen = ({ navigation }) => {
  const { isDarkTheme } = useTheme();  
  const categoriesScrollRef = useRef(); 
  const [menuVisible, setMenuVisible] = useState(false);
  const { user } = useContext(UserContext);
  const [profileImage, setProfileImage] = useState(null);  
  const [activeCategory, setActiveCategory] = useState('Beef');
  const [categories, setCategories] = useState([]);
  const [meals, setMeals] = useState([]);
  const [isFirstVisit, setIsFirstVisit] = useState(false); 
  const db = getFirestore();

  useEffect(() => {
    handleUpdateProfile();
    getCategories();
    getRecipes();
    checkFirstVisit();  

    const backHandler = BackHandler.addEventListener('hardwareBackPress', handleBackPress);
    return () => {
      backHandler.remove(); 
    };
  }, []);
  
  const checkFirstVisit = async () => {
    try {
      const firstVisit = await AsyncStorage.getItem('isFirstVisit');
      if (!firstVisit) {
        setIsFirstVisit(true);
        await AsyncStorage.setItem('isFirstVisit', 'false');
      }
    } catch (error) {
      console.error('Error checking first visit:', error);
    }
  };

  const handleUpdateProfile = async () => {
    const currentUser = auth.currentUser;
    if (currentUser) {
      try {
        const userRef = doc(db, 'users', currentUser.email);
        const userDoc = await getDoc(userRef);
        if (userDoc.exists()) {
          const userData = userDoc.data();
          setProfileImage(userData.myuserfoto || null);
        }
      } catch (error) {
        console.error('Error al obtener el documento del usuario:', error);
      }
    }
  };

  const getCategories = async () => {
    try {
      const response = await axios.get('https://themealdb.com/api/json/v1/1/categories.php');
      if (response && response.data) {
        setCategories(response.data.categories);
      }
    } catch (error) {
      console.log("error", error.message);
    }
  };

  const getRecipes = async (category = "Beef") => {
    try {
      const response = await axios.get(`https://themealdb.com/api/json/v1/1/filter.php?c=${category}`);
      if (response && response.data) {
        setMeals(response.data.meals);
      }
    } catch (error) {
      console.log("error", error.message);
    }
  };

  const handleChangeCategory = (category) => {
    setActiveCategory(category);
    getRecipes(category);
  };

  const toggleMenu = () => {
    setMenuVisible(!menuVisible);
  };

  const handleBackPress = () => {
    if (navigation.isFocused()) {
      Alert.alert(
        'Salir de la aplicación',
        '¿Estás seguro de que quieres salir?',
        [
          {
            text: 'Cancelar',
            style: 'cancel',
          },
          {
            text: 'Salir',
            onPress: () => BackHandler.exitApp(),
          },
        ],
        { cancelable: true }
      );
      return true;
    }
    return false;
  };

  return (
    <View style={[styles.container, isDarkTheme ? styles.darkContainer : styles.lightContainer]}>
      <StatusBar barStyle={isDarkTheme ? 'light-content' : 'dark-content'} backgroundColor={isDarkTheme ? '#121212' : '#fafafa'} />
      <ScrollView contentContainerStyle={styles.scrollViewContainer}>
        <View style={styles.bienvenida}>
          <Text style={[styles.greetingText, isDarkTheme ? styles.darkText : styles.lightText]}>
            Hola, <Text style={styles.username}>{user ? user.username || 'Usuario' : 'Invitado'}!</Text>
          </Text>
          <View style={styles.containernot}>
            <TouchableOpacity onPress={() => navigation.navigate('UserProfile')}>
              {profileImage ? (
                <Image source={{ uri: profileImage }} style={styles.profileImage} />
              ) : (
                <Icon name="person" size={40} color="#333" />
              )}
            </TouchableOpacity>
          </View>
        </View>

        {/* Show de la primera visita */}
        {isFirstVisit && (
          <View style={styles.welcomeMessageContainer}>
            <LottieView 
              source={require('../assets/celebration.json')} 
              autoPlay 
              loop 
              style={styles.animation} 
            />
            <Text style={styles.welcomeMessage}>
              ¡Bienvenido a la app de recetas instantáneas! La hicimos con mucho esfuerzo y dedicación. 
              Espero que te guste. 
              <Text style={styles.emphasizedText}> Es para aprobar las prácticas profesionalizantes, ¡y ya casi está terminada!</Text>
            </Text>
          </View>
        )}

        {/* Search bar */}
        <TouchableOpacity 
          style={styles.searchContainer} 
          onPress={() => navigation.navigate('SearchScreen')}
        >
          <Text style={styles.searchPlaceholder}>Buscar</Text>
          <View style={styles.searchIcon}>
            <Icon name="search" size={24} color={"#808080"} />
          </View>
        </TouchableOpacity>

        <Text style={[styles.sectionTitle, isDarkTheme ? styles.darkText : styles.lightText]}>Categorías</Text>
        <ScrollView
          ref={categoriesScrollRef}
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.categoriesContainer}
        >
          {categories.length > 0 && <Categories categories={categories} activeCategory={activeCategory} handleChangesCategory={handleChangeCategory}/>}
        </ScrollView>

        {/* Recipes */}
        <View>
          <Recipes meals={meals} categories={categories} />
        </View>
      </ScrollView>

      <TouchableOpacity style={styles.floatingButton} onPress={toggleMenu}>
        <Icon name="add" size={30} color="#fff"/>
      </TouchableOpacity>

      {menuVisible && (
        <View style={styles.menuContainer}>
          <TouchableOpacity style={styles.menuItem} onPress={() => { 
            setMenuVisible(false); 
            navigation.navigate('CreateRecipeScreen'); 
          }}>
            <Icon name="book-outline" size={24} color="#333" style={styles.menuicon}/>
            <Text style={[styles.menuItemText, isDarkTheme ? styles.darkText : styles.lightText]}>Crear Receta</Text> 
          </TouchableOpacity>
          <TouchableOpacity style={styles.menuItem} onPress={() => { 
            setMenuVisible(false); 
            navigation.navigate('MyRecipes'); 
          }}>
            <Icon name="cafe-outline" size={24} color="#333" style={styles.menuicon}/>
            <Text style={[styles.menuItemText, isDarkTheme ? styles.darkText : styles.lightText]}>Mis Recetas</Text> 
          </TouchableOpacity>
        </View>
      )}

      <BottomNavBar navigation={navigation} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 5,
  },
  darkContainer: {
    backgroundColor: '#121212',
  },
  lightContainer: {
    backgroundColor: '#fdfdfd',
  },
  scrollViewContainer: {
    paddingTop: '3%',
  },
  bienvenida: {
    flexDirection: 'row',
    alignItems: 'center', 
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    marginVertical: 20,
  },
  greetingText: {
    fontSize: 30, 
    fontWeight: 'bold',
    flex: 1, 
  },
  darkText: {
    color: '#fff',
  },
  lightText: {
    color: '#333',
  },
  username: {
    fontSize: 28,
    color: '#c7254e', 
  },
  containernot: {
    alignItems: 'center', 
    justifyContent: 'center', 
    paddingHorizontal: 5,
  },
  profileImage: {
    width: 40,
    height: 40,
    borderRadius: 40 / 2,
    borderWidth: 1,
    borderColor: '#666',
  },
  welcomeMessageContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  welcomeMessage: {
    fontSize: 18,
    marginVertical: 10,
    textAlign: 'center',
    color: '#333',
  },
  emphasizedText: {
    fontWeight: 'bold',
    color: '#c7254e',
  },
  animation: {
    width: 150,
    height: 150,
  },
  searchContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    borderWidth: 1,
    borderRadius: 20,
    borderColor: '#e0e0e0',
    marginBottom: 15,
  },
  searchPlaceholder: {
    fontSize: 18,
    color: '#808080',
  },
  searchIcon: {
    paddingLeft: 10,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    paddingHorizontal: 10,
    marginBottom: 10,
  },
  categoriesContainer: {
    paddingHorizontal: 10,
  },
  floatingButton: {
    position: 'absolute',
    right: 20,
    bottom: 20,
    backgroundColor: '#c7254e',
    padding: 20,
    borderRadius: 50,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.5,
    elevation: 5,
  },
  menuContainer: {
    position: 'absolute',
    right: 20,
    top: 100,
    backgroundColor: '#fff',
    width: 200,
    padding: 10,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: '#ddd',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    paddingVertical: 10,
  },
  menuItemText: {
    fontSize: 16,
    marginLeft: 10,
  },
  menuicon: {
    marginRight: 10,
  }
});

export default HomeScreen;
