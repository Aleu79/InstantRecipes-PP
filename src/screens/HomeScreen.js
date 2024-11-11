import React, { useContext, useRef, useState, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Image,  StatusBar } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons'; 
import { UserContext } from '../context/UserContext';
import { useTheme } from '../context/ThemeContext'; 
import { auth } from '../../firebase/firebase-config';
import { doc, getDoc, getFirestore } from 'firebase/firestore';
import Categories from '../components/Categories';
import Recipes from '../components/Recipes';
import axios from 'axios';
import BottomNavBar from '../components/BottomNavbar';

const HomeScreen = ({ navigation }) => {
  const { isDarkTheme } = useTheme();  
  const categoriesScrollRef = useRef(); 
  const [menuVisible, setMenuVisible] = useState(false);
  const { user } = useContext(UserContext);
  const [profileImage, setProfileImage] = useState(null);  
  const [activeCategory, setActiveCategory] = useState('Beef');
  const [categories, setCategories] = useState([]);
  const [meals, setMeals] = useState([]);
  const db = getFirestore();

  useEffect(() => {
    handleUpdateProfile();
    getCategories();
    getRecipes(); 
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
        console.log(response);
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

  const categoryImages = {
    Beef: 'https://i.pinimg.com/564x/80/9a/a7/809aa70dd33e3afef618f139a7c50b43.jpg',
    Vegano: 'https://i.pinimg.com/564x/80/9a/a7/809aa70dd33e3afef618f139a7c50b43.jpg',
    'Sin Lacteos': 'https://i.pinimg.com/564x/fb/fd/a2/fbfda2193d781e9e357860bbea548fa2.jpg',
    Vegetariano: 'https://www.anitahealthy.com/wp-content/uploads/2020/02/Veggie-Bowl-de-Lentilhas-e-abo%CC%81bora-2-1-600x800.jpg',
    'Sin Tacc': 'https://i.pinimg.com/564x/6a/d3/3d/6ad33d29ebcbfe87b8fd7a1d4086749b.jpg',
  };

  const toggleMenu = () => {
    setMenuVisible(!menuVisible);
  };
  const handlePress = () => {
    navigation.navigate('SearchScreen');
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

        {/* Search bar  */}
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
