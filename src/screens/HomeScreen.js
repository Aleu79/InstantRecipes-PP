import React, { useContext, useRef, useState, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Image } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons'; 
import { UserContext } from '../context/UserContext';
import { auth } from '../../firebase/firebase-config';
import { doc, getDoc, getFirestore } from 'firebase/firestore';
import BottomNavBar from '../components/BottomNavbar';

const HomeScreen = ({ navigation }) => {
  const categoriesScrollRef = useRef(); 
  const [menuVisible, setMenuVisible] = useState(false);
  const { user } = useContext(UserContext);
  const [profileImage, setProfileImage] = useState(null); 
  const db = getFirestore();

  useEffect(() => {
    const handleUpdateProfile = async () => {
      const currentUser = auth.currentUser;
      console.log('Usuario autenticado actual:', currentUser);  // Verifica qué usuario está autenticado

      if (currentUser) {
        try {
          const userRef = doc(db, 'users', currentUser.email);
          const userDoc = await getDoc(userRef);
          console.log('Documento del usuario:', userDoc.data());  // Verifica los datos del documento
          console.log('Profile image URL:', profileImage);
          if (userDoc.exists()) {
            const userData = userDoc.data();
            console.log('Datos del usuario recuperados:', userData);  // Muestra los datos que se recuperan
            setProfileImage(userData.myuserfoto || null); // Recuperar la imagen de perfil
          } else {
            console.log('No se encontraron datos para este usuario.');
          }
        } catch (error) {
          console.error('Error al obtener el documento del usuario:', error);  // Muestra si ocurre algún error
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
    console.log('Menú desplegable visible:', menuVisible);  
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollViewContainer}>
        <View style={styles.bienvenida}>
          <Text style={styles.greetingText}>
            Hola, <Text style={styles.username}>{user ? user.username || 'Usuario' : 'Invitado'}!</Text>
          </Text>
          <View style={styles.containernot}>
            <TouchableOpacity onPress={() => console.log('Notificaciones')}>
              <Icon name="notifications" size={30} color="orange" style={styles.notificacion}/>
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

        <Text style={styles.sectionTitle}>Categorías</Text>
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
                console.log('Categoría seleccionada:', category);  // Muestra qué categoría se selecciona
                navigation.navigate('CategoryRecipesScreen', { category });
              }}
            >
              <Image source={{ uri: categoryImages[category] }} style={styles.categoryImage} />
              <Text style={styles.categoryButtonText}>{category}</Text>
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
            console.log('Navegando a crear receta');
            navigation.navigate('CreateRecipeScreen'); 
          }}>
            <Icon name="book-outline" size={24} color="#333" style={styles.menuicon}/>
            <Text style={styles.menuItemText}>Crear Receta</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.menuItem} onPress={() => { 
            setMenuVisible(false); 
            console.log('Navegando a mis recetas');
            navigation.navigate('MyRecipes'); 
          }}>
            <Icon name="cafe-outline" size={24} color="#333" style={styles.menuicon}/>
            <Text style={styles.menuItemText}>Mis Recetas</Text>
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
    backgroundColor: '#fafafa',
  },
  scrollViewContainer: {
    paddingTop: 50,
    paddingBottom: 100,
  },
  carouselContainer: {
    marginBottom: 20,
  },
  carouselImage: {
    width: 300,
    height: 150,
    borderRadius: 10,
    marginRight: 10,
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
    color: '#000',
    flex: 1, 
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
    color: '#000',
    fontWeight: 'bold',
    fontSize: 14,
    maxWidth: '100%',
  },
  floatingButton: {
    position: 'absolute',
    bottom: 90,
    right: 20,
    backgroundColor: '#FFA500',
    borderRadius: 30,
    width: 60,
    height: 60,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 4,
    elevation: 5,
  },
  menuContainer: {
    position: 'absolute',
    bottom: 160, 
    right: 20,
    backgroundColor: '#FFF',
    borderRadius: 8,
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 5,
  },
  menuItem: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuItemText: {
    fontSize: 16,
  },
  menuicon: {
    marginRight: 8,
  },
  containernot: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  profileImage: {
    width: 60,
    height: 60,
    borderRadius: 40,
  },
  notificacion: {
    marginRight: 20,
  },
});


export default HomeScreen;
