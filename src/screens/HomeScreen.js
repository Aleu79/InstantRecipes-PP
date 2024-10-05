import React, { useContext, useRef, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Image } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons'; 
import { UserContext } from '../context/UserContext';
import BottomNavBar from '../components/BottomNavbar';
import Header from '../components/Headers/Header';

const HomeScreen = ({ navigation }) => {
  const categoriesScrollRef = useRef(); 
  const [menuVisible, setMenuVisible] = useState(false);
  const { user } = useContext(UserContext);
  const [image, setImage] = useState(null);

  const categoryImages = {
    Veggie: 'https://i.pinimg.com/564x/80/9a/a7/809aa70dd33e3afef618f139a7c50b43.jpg',
    Carnes: 'https://i.pinimg.com/564x/fb/fd/a2/fbfda2193d781e9e357860bbea548fa2.jpg',
    Panadería: 'https://i.pinimg.com/564x/9a/69/c3/9a69c3409690f1a9a10578a48d84ac6c.jpg',
    Postres: 'https://i.pinimg.com/564x/da/8e/f3/da8ef39729c591cb116894bf412f583a.jpg',
    'Sin Tacc': 'https://i.pinimg.com/564x/6a/d3/3d/6ad33d29ebcbfe87b8fd7a1d4086749b.jpg',
  };

  const foodCarouselImages = [
    'https://i.pinimg.com/564x/4e/0f/8d/4e0f8d6bcf238b2eb1df0bc2a45ff2cd.jpg',
    'https://i.pinimg.com/564x/80/0c/70/800c70a8cb78cbe0bb0b6f8a0ae017b3.jpg',
    'https://i.pinimg.com/564x/c7/3b/2b/c73b2b7b2a7a6b7b4b72b3a6aa663b7e.jpg',
  ];

  const toggleMenu = () => setMenuVisible(!menuVisible);

  return (
    <View style={styles.container}>
      <Header>salir</Header>
      <ScrollView contentContainerStyle={styles.scrollViewContainer}>

        <View style={styles.bienvenida}>
          <Text style={styles.greetingText}>
            Hola, <Text style={styles.username}>{user ? user.username || 'Usuario' : 'Invitado'}!</Text>
          </Text>
          <TouchableOpacity onPress={() => navigation.navigate('UserProfile')}>
            {image ? (
              <Image source={{ uri: image }} style={styles.profileImage} />
            ) : (
              <Icon name="person" size={40} color="#333" />
            )}
          </TouchableOpacity>
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
              onPress={() => navigation.navigate('CategoryRecipesScreen', { category })}
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
          <TouchableOpacity style={styles.menuItem} onPress={() => { setMenuVisible(false); navigation.navigate('CreateRecipeScreen'); }}>
            <Icon name="book-outline" size={24} color="#333" style={styles.menuicon}/>
            <Text style={styles.menuItemText}>Crear Receta</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.menuItem} onPress={() => { setMenuVisible(false); navigation.navigate('MyRecipes'); }}>
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
    paddingHorizontal: 16,
    marginBottom: 20,
  },
  categoryButton: {
    borderRadius: 75,
    paddingVertical: 8,
    paddingHorizontal: 8,
    marginRight: 8,
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
    fontSize: 16,
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
});

export default HomeScreen;
