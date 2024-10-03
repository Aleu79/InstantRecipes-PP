import React, { useRef, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Image } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons'; 
import HeaderHome from '../components/Headers/HeaderHome';
import BottomNavBar from '../components/BottomNavbar';

const HomeScreen = ({ navigation }) => {
  const categoriesScrollRef = useRef(); 
  const [menuVisible, setMenuVisible] = useState(false);

  const toggleMenu = () => setMenuVisible(!menuVisible);

  return (
    <View style={styles.container}>
      <HeaderHome />
      <ScrollView contentContainerStyle={styles.scrollViewContainer}>
        {/* Título de Ingredientes */}
        <Text style={styles.sectionTitle}>Ingredientes</Text>
        <View style={styles.ingredientsContainer}>
          {/* Chips de Ingredientes con Iconos de Cerrar */}
          {['Harina', 'Papas', 'Manteca', 'Salmón'].map((ingredient, index) => (
            <View key={index} style={styles.chip}>
              <Text style={styles.chipText}>{ingredient}</Text>
              <TouchableOpacity style={styles.closeIcon}>
                <Icon name="close" size={14} color="#333" />
              </TouchableOpacity>
            </View>
          ))}
          <TouchableOpacity style={styles.addChip}>
            <Text style={styles.chipText}>+</Text>
          </TouchableOpacity>
        </View>

        {/* Carrusel de Categorías */}
        <Text style={styles.sectionTitle}>Categorías</Text>
        <ScrollView
          ref={categoriesScrollRef}
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.categoriesContainer}
        >
          {/* Botones de categorías */}
          {['Veggie', 'Carnes', 'Bebidas', 'Panadería', 'Postres', 'Sin TACC'].map((category, index) => (
            <TouchableOpacity
              key={index}
              style={[styles.categoryButton, { backgroundColor: ['#B22222', '#FFA500', '#FF4500', '#C86038', '#FF7700', '#FFA500'][index] }]}
              onPress={() => navigation.navigate('CategoryRecipesScreen', { category })}
            >
              <Text style={styles.categoryButtonText}>{category}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Sección de Recomendados */}
        <Text style={styles.sectionTitle}>Recomendados</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={styles.recommendedContainer}>
            {[1, 2, 3].map((_, index) => (
              <TouchableOpacity key={index} style={styles.imageContainer} onPress={() => navigation.navigate('RecipeView')}>
                <Image style={styles.imgRecipes} source={{ uri: 'https://via.placeholder.com/150' }} />
                <Text style={styles.imageLabel}>Nombre {index + 1}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>

        {/* Botón "Ver más" */}
        <TouchableOpacity style={styles.moreButton}>
          <Text style={styles.moreButtonText}>Ver más</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Botón Flotante */}
      <TouchableOpacity style={styles.floatingButton} onPress={toggleMenu}>
        <Icon name="add" size={30} color="#fff"/>
      </TouchableOpacity>

      {/* Menú Emergente */}
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
  sectionTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginVertical: 16,
    marginHorizontal: 16,
  },
  ingredientsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 10,
    borderRadius: 16,
    backgroundColor: '#f1f1f1',
    marginHorizontal: 16,
    marginBottom: 20,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fafafa',
    borderRadius: 16,
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginRight: 8,
    marginBottom: 8,
  },
  addChip: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginBottom: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chipText: {
    color: '#333',
    marginRight: 4,
  },
  closeIcon: {
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 4,
  },
  categoriesContainer: {
    paddingHorizontal: 16,
    marginBottom: 20,
  },
  categoryButton: {
    borderRadius: 25,
    paddingVertical: 16,
    paddingHorizontal: 24,
    marginRight: 8,
    justifyContent: 'center',
    alignItems: 'center',
    width: 150,
    height: 90,
  },
  categoryButtonText: {
    color: '#FFF',
    fontWeight: 'bold',
    fontSize: 18,
  },
  recommendedContainer: {
    flexDirection: 'row',
    marginBottom: 20,
    paddingHorizontal: 16,
  },
  imageContainer: {
    width: 150,
    height: 150,
    borderRadius: 20,
    marginRight: 10,
    position: 'relative',
  },
  imgRecipes: {
    width: '100%',
    height: '100%',
    borderRadius: 20,
  },
  imageLabel: {
    position: 'absolute',
    bottom: 10,
    left: 10,
    color: '#FFF',
    fontWeight: 'bold',
    fontSize: 16,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  moreButton: {
    backgroundColor: '#FFF',
    padding: 12,
    borderRadius: 24,
    alignItems: 'center',
    marginVertical: 10,
    marginHorizontal: 16,
  },
  moreButtonText: {
    color: '#000',
    fontSize: 16,
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
  floatingButtonText: {
    color: '#FFF',
    fontSize: 30,
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
    justifyContent:'center',
  },
  menuItemText: {
    fontSize: 16,
  },
  menuicon : {
    marginRight: 8,
  },
});

export default HomeScreen;
