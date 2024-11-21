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
import Loading from '../components/Loading';

const HomeScreen = ({ navigation }) => {
  const { isDarkTheme } = useTheme();  
  const categoriesScrollRef = useRef(); 
  const [menuVisible, setMenuVisible] = useState(false);
  const { user } = useContext(UserContext);
  const [profileImage, setProfileImage] = useState(null);  
  const [activeCategory, setActiveCategory] = useState('Beef');
  const [categories, setCategories] = useState([]);
  const [meals, setMeals] = useState([]);
  const [isFirstVisit, setIsFirstVisit] = useState(null); 
  const db = getFirestore();

  useEffect(() => {
    handleUpdateProfile();
    getCategories();
    getRecipes();
    checkFirstVisit();   
    AsyncStorage.removeItem('isFirstVisit');

    const backHandler = BackHandler.addEventListener('hardwareBackPress', handleBackPress);
    return () => {
      backHandler.remove(); 
    };
  }, []);
  
  
  const handleUpdateProfile = async () => {
    const currentUser = auth.currentUser;
    if (currentUser) {
      try {
        const userRef = doc(db, 'users', currentUser.email);
        const userDoc = await getDoc(userRef);
        if (userDoc.exists()) {
          const userData = userDoc.data();
          setProfileImage(userData.myuserfoto || null);
        } else {
          console.log('No se encontró el documento del usuario');
        }
      } catch (error) {
        console.error('Error al obtener el documento del usuario:', error);
      }
    } else {
      console.log('No hay usuario autenticado');
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
  const checkFirstVisit = async () => {
    try {
      const firstVisit = await AsyncStorage.getItem('isFirstVisit');
      console.log('Valor actual de isFirstVisit en AsyncStorage:', firstVisit);
  
      if (!firstVisit) {
        setIsFirstVisit(true);
      } else if (firstVisit === 'false') {
        setIsFirstVisit(false);
      }
    } catch (error) {
      console.error('Error checking first visit:', error);
    }
  };
  
  const handleCloseWelcomeMessage = async () => {
    try {
      setIsFirstVisit(false); 
      await AsyncStorage.setItem('isFirstVisit', 'false');
      console.log('Se marcó isFirstVisit como false en AsyncStorage.');
    } catch (error) {
      console.error('Error setting isFirstVisit in AsyncStorage:', error);
    }
  };
  
  if (isFirstVisit === null) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <Loading />
      </View>
    );
  }
  return (
    <View style={[styles.container, isDarkTheme ? styles.darkContainer : styles.lightContainer]}>
      <StatusBar 
        barStyle={isDarkTheme ? 'light-content' : 'dark-content'} 
        backgroundColor={isDarkTheme ? '#121212' : '#fafafa'} 
      />
  
      {/* Mensaje de bienvenida para la primera visita */}
      {isFirstVisit && (
        <View style={styles.welcomeOverlay}>
          <LottieView
            source={require('../../assets/celebration.json')}
            autoPlay
            loop={true} 
            onAnimationFinish={() => {
              setTimeout(() => {
                setIsFirstVisit(true); 
              }, 1000); 
            }}
            style={styles.animation}
          />

          <Text style={styles.welcomeMessage}>
            ¡Bienvenido a la app de recetas instantáneas! La hicimos con mucho esfuerzo y dedicación.
            Espero que te guste.{' '}
            <Text style={styles.emphasizedText}>
              Es para aprobar las prácticas profesionalizantes, ¡y ya casi está terminada!
            </Text>
          </Text>
          <TouchableOpacity
            style={styles.closeButton}
            onPress={handleCloseWelcomeMessage}
          >
            <Text style={styles.closeButtonText}>Cerrar</Text>
          </TouchableOpacity>
        </View>
      )}
  
      {/* ScrollView principal */}
      <ScrollView contentContainerStyle={styles.scrollViewContainer}>
        {/* Sección de bienvenida */}
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
  
        {/* Barra de búsqueda */}
        <TouchableOpacity 
          style={styles.searchContainer} 
          onPress={() => navigation.navigate('SearchScreen')}
        >
          <Text style={styles.searchPlaceholder}>Buscar</Text>
          <View style={styles.searchIcon}>
            <Icon name="search" size={24} color={"#808080"} />
          </View>
        </TouchableOpacity>
  
        {/* Categorías */}
        <Text style={[styles.sectionTitle, isDarkTheme ? styles.darkText : styles.lightText]}>
          Categorías
        </Text>
        <ScrollView
          ref={categoriesScrollRef}
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.categoriesContainer}
        >
          {categories.length > 0 && (
            <Categories 
              categories={categories} 
              activeCategory={activeCategory} 
              handleChangesCategory={handleChangeCategory} 
            />
          )}
        </ScrollView>
  
        {/* Recetas */}
        <View>
          <Recipes meals={meals} categories={categories} />
        </View>
      </ScrollView>
  
      {/* Botón flotante */}
      <TouchableOpacity style={styles.floatingButton} onPress={toggleMenu}>
        <Icon name="add" size={30} color="#fff"/>
      </TouchableOpacity>
  
      {/* Menú flotante */}
      {menuVisible && (
        <View style={styles.menuContainer}>
          <TouchableOpacity 
            style={styles.menuItem} 
            onPress={() => { 
              setMenuVisible(false); 
              navigation.navigate('CreateRecipeScreen'); 
            }}
          >
            <Icon name="book-outline" size={24} color="#333" style={styles.menuicon}/>
            <Text style={[styles.menuItemText, isDarkTheme ? styles.darkText : styles.lightText]}>
              Crear Receta
            </Text> 
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.menuItem} 
            onPress={() => { 
              setMenuVisible(false); 
              navigation.navigate('MyRecipes'); 
            }}
          >
            <Icon name="cafe-outline" size={24} color="#333" style={styles.menuicon}/>
            <Text style={[styles.menuItemText, isDarkTheme ? styles.darkText : styles.lightText]}>
              Mis Recetas
            </Text>
          </TouchableOpacity>
        </View>
      )}
        <BottomNavBar navigation={navigation}/>
    </View>
    
  );

  
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 5,
  },
  welcomeOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    zIndex: 10,
  },
  animation: {
    width: 200,
    height: 200,
  },
  welcomeMessage: {
    textAlign: 'center',
    fontSize: 16,
    color: '#fff',
    marginVertical: 20,
    paddingHorizontal: 20,
  },
  emphasizedText: {
    fontWeight: 'bold',
    color: '#f8c291',
  },
  closeButton: {
    backgroundColor: '#fff',
    padding: 10,
    borderRadius: 20,
  },
  closeButtonText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
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
    color: '#000',
  },
  username: {
    fontWeight: 'bold',
    color: '#FFA500',
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginVertical: 16,
    marginHorizontal: 16,
  },
  searchContainer:{
    flexDirection: "row", 
    borderRadius: 30, 
    borderColor: '#e6e6e6',  
    backgroundColor: "#f5f5f5", 
    alignItems: "center", 
    marginVertical: 20,
    width: '90%',
    alignSelf: 'center',
    paddingLeft: 20,
    justifyContent: 'space-between',
  },
  searchInput: {
    fontSize: 16, 
    flex: 1, 
    textAlign: "justify", 
    paddingLeft: 10
  },
  searchPlaceholder: {
    color: "#aaaaaa",
    fontSize: 16,
  },  
  searchIcon:{
    alignItems: "center", 
    justifyContent: "center", 
    padding: 10, 
    borderRadius: 20, 
    marginRight: 5
  },
  categoriesContainer: {
    paddingHorizontal: 15,
    marginBottom: 20,
  },
  floatingButton: {
    position: 'absolute',
    bottom: 90,
    right: 20,
    backgroundColor: '#ff783b',
    borderRadius: 50,
    padding: 15,
  },
  menuContainer: {
    position: 'absolute',
    bottom: 150,
    right: 20,
    backgroundColor: '#fff',
    borderRadius: 8,
    elevation: 5,
    marginBottom: 10,
    width: 200,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
  },
  menuItemText: {
    marginLeft: 10,
    fontSize: 16,
  },
  containernot: {
    flexDirection: 'row',
  },
  notificacion: {
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  profileImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginLeft: 20,
  },
});

export default HomeScreen;
