import React, { useRef } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Image } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons'; 
import HeaderHome from '../components/Headers/HeaderHome';

const HomeScreen = ({ navigation }) => {
  const categoriesScrollRef = useRef(); 
 
  return (
    <View style={styles.container}>
      <HeaderHome></HeaderHome>
      <ScrollView>
        {/* Título de Ingredientes */}
        <Text style={styles.sectionTitle}>Ingredientes</Text>
        <View style={styles.containeringredientes}>
          {/* Chips de Ingredientes con Iconos de Cerrar */}
          {['Harina', 'Papas', 'Manteca', 'Salmón'].map((ingredient, index) => (
            <View key={index} style={styles.chip}>
              <Text style={styles.chipText}>{ingredient}</Text>
              <TouchableOpacity style={styles.closeIcon}>
                <Icon name="close" size={14} color="#333" />
              </TouchableOpacity>
            </View>
          ))}
          <View style={styles.addChip}><Text style={styles.chipText}>+</Text></View>
        </View>

        {/* Carrusel de Categorías con Flechas */}
        <View style={styles.carouselContainer}>
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
                style={[styles.btncategoria, { backgroundColor: ['#B22222', '#FFA500', '#FF4500', '#C86038', '#FF7700', '#FFA500'][index] }]}
                onPress={() => navigation.navigate(category)}
              >
                <Text style={styles.textcategoria}>{category}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Sección de Recomendados */}
        <Text style={styles.sectionTitle}>Recomendados</Text>
        <View style={styles.recommendedContainer}>
          <TouchableOpacity style={styles.imageContainer} onPress={() => navigation.navigate('RecipeView')}>
            <Image style={styles.imgrecipes} source={{ uri: 'https://via.placeholder.com/150' }} />
            <Text style={styles.imageLabel}>Nombre</Text>
          </TouchableOpacity>
        </View>

        {/* Botón "Ver más" */}
        <TouchableOpacity style={styles.moreButton}>
          <Text style={styles.moreButtonText}>Ver más</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Botón Flotante */}
      <TouchableOpacity style={styles.floatingButton}>
        <Text style={styles.floatingButtonText}>+</Text>
      </TouchableOpacity>

      
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fafafa',
    paddingTop: 50,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginVertical: 8,
    marginHorizontal: 16,
    marginTop: 10,
  },
  containeringredientes: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 10,
    paddingTop: 15,
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
  carouselContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    paddingHorizontal: 16,
    marginTop: 15,
  },
  categoriesContainer: {
    flexDirection: 'row',
    marginBottom: 20,
    paddingHorizontal: 16,
    marginTop: 15,
  },
  btncategoria: {
    borderRadius: 25,
    paddingVertical: 16,
    paddingHorizontal: 24,
    marginRight: 8,
    justifyContent: 'center',
    alignItems: 'center',
    width: 150,
    height: 90,
  },
  textcategoria: {
    color: '#FFF',
    fontWeight: 'bold',
    fontSize: 18,
  },
  recommendedContainer: {
    flexDirection: 'column',
    alignItems: 'center',
    marginBottom: 20,
    paddingHorizontal: 16,
  },
  imageContainer: {
    width: '100%',
    marginBottom: 10,
  },
  imgrecipes: {
    width: '100%',
    height: 150,
    borderRadius: 20,
  },
  imageLabel: {
    position: 'absolute',
    top: 10,
    left: 10,
    color: '#FFF',
    fontWeight: 'bold',
    fontSize: 20,
    paddingHorizontal: 6,
    paddingVertical: 2,
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
    bottom: 20,
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
});

export default HomeScreen;
