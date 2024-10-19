import React, { useContext, useRef, useState, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Image } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons'; 
import { UserContext } from '../context/UserContext';
import { useTheme } from '../context/ThemeContext'; 
import { auth } from '../../firebase/firebase-config';
import { doc, getDoc, getFirestore } from 'firebase/firestore';
import BottomNavBar from '../components/BottomNavbar';

const HomeScreen = ({ navigation }) => {
  const { isDarkTheme } = useTheme(); // Uso del contexto para obtener el estado del tema (oscuro o claro)  
  const categoriesScrollRef = useRef(); 
  const [menuVisible, setMenuVisible] = useState(false);
  const { user } = useContext(UserContext);
  const [profileImage, setProfileImage] = useState(null); 
  const db = getFirestore();

  useEffect(() => {
    const handleUpdateProfile = async () => {
      const currentUser = auth.currentUser;

      if (currentUser) {
        try {
          const userRef = doc(db, 'users', currentUser.email);
          const userDoc = await getDoc(userRef);
          if (userDoc.exists()) {
            const userData = userDoc.data();
            setProfileImage(userData.myuserfoto || null); // Recuperar la imagen de perfil
          }
        } catch (error) {
          console.error('Error al obtener el documento del usuario:', error);
        }
      }
    };

    handleUpdateProfile();
  }, []);

  const categoryImages = {
    Vegano: 'https://i.pinimg.com/564x/80/9a/a7/809aa70dd33e3afef618f139a7c50b43.jpg',
    'Sin Lacteos': 'https://i.pinimg.com/564x/fb/fd/a2/fbfda2193d781e9e357860bbea548fa2.jpg',
    Vegetariano: 'https://www.anitahealthy.com/wp-content/uploads/2020/02/Veggie-Bowl-de-Lentilhas-e-abo%CC%81bora-2-1-600x800.jpg',
    'Sin Tacc': 'https://i.pinimg.com/564x/6a/d3/3d/6ad33d29ebcbfe87b8fd7a1d4086749b.jpg',
  };

  const toggleMenu = () => {
    setMenuVisible(!menuVisible);
  };

  return (
    <View style={[styles.container, isDarkTheme ? styles.darkContainer : styles.lightContainer]}>
      {/* El contenedor principal ajusta su estilo según el tema actual (oscuro o claro) */}       
      <ScrollView contentContainerStyle={styles.scrollViewContainer}>
        <View style={styles.bienvenida}>
          <Text style={[styles.greetingText, isDarkTheme ? styles.darkText : styles.lightText]}> 
            {/* El texto de saludo cambia de color según el tema */}            
            Hola, <Text style={styles.username}>{user ? user.username || 'Usuario' : 'Invitado'}!</Text>
          </Text>
          <View style={styles.containernot}>
            <TouchableOpacity onPress={() => console.log('Notificaciones')}>
              <Icon name="notifications" size={30} color={isDarkTheme ? '#fff' : 'orange'} style={styles.notificacion}/> 
              {/* El icono de notificaciones cambia de color según el tema */}
            </TouchableOpacity>
            <TouchableOpacity onPress={() => navigation.navigate('UserProfile')}>
              {profileImage ? (
                <Image source={{ uri: profileImage }} style={styles.profileImage} />
              ) : (
                <Icon name="person" size={40} color="#333" />
              )}
            </TouchableOpacity>
          </View>
        </View>

        <Text style={[styles.sectionTitle, isDarkTheme ? styles.darkText : styles.lightText]}>Categorías</Text> 
          {/* El título de la sección también cambia de color según el tema */}
        <ScrollView
          ref={categoriesScrollRef}
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.categoriesContainer}
        >
          {Object.keys(categoryImages).map((category, index) => (
            <TouchableOpacity
              key={index}
              style={styles.categoryButton}
              onPress={() => {
                navigation.navigate('CategoryRecipesScreen', { category });
              }}
            >
              <Image source={{ uri: categoryImages[category] }} style={styles.categoryImage} />
              <Text style={[styles.categoryButtonText, isDarkTheme ? styles.darkText : styles.lightText]}>{category}</Text> 
              {/* El texto de las categorías también cambia según el tema */}
            </TouchableOpacity>
          ))}
        </ScrollView>
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
            {/* Las opciones del menú también cambian de estilo según el tema */}
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
  },
  darkContainer: {
    backgroundColor: '#121212', // Color de fondo oscuro
  },
  lightContainer: {
    backgroundColor: '#fafafa', // Color de fondo claro
  },
  scrollViewContainer: {
    paddingTop: 50,
    paddingBottom: 100,
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
    color: '#fff', // Color de texto en modo oscuro
  },
  lightText: {
    color: '#000', // Color de texto en modo claro
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
  categoriesContainer: {
    paddingHorizontal: 15,
    marginBottom: 20,
  },
  categoryButton: {
    borderRadius: 75,
    paddingVertical: 8,
    paddingHorizontal: 8,
    marginRight: -20, 
    justifyContent: 'center',
    alignItems: 'center',
    width: 110,
    height: 110,
  },
  categoryImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginBottom: 8,
  },
  categoryButtonText: {
    fontWeight: 'bold',
    fontSize: 14,
    maxWidth: '100%',
  },
  floatingButton: {
    position: 'absolute',
    bottom: 90,
    right: 20,
    backgroundColor: '#FF5722',
    borderRadius: 50,
    padding: 15,
  },
  menuContainer: {
    position: 'absolute',
    bottom: 70,
    right: 20,
    backgroundColor: '#fff', // Ajusta según el tema
    borderRadius: 10,
    elevation: 5,
    padding: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
  },
  menuItemText: {
    marginLeft: 10,
    fontSize: 16,
  },
  menuicon: {
    marginRight: 10,
  },
  notificacion: {
    marginRight: 20,
  },
  profileImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
});

export default HomeScreen;
