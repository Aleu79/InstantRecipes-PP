import React, { useContext, useRef } from 'react';
import { ScrollView, View, TextInput, TouchableOpacity, Image, StyleSheet, Text } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { UserContext } from '../context/UserContext';
import Header from '../components/Headers/Header';

const SearchScreen = ({ navigation }) => {
  const categoriesScrollRef = useRef();
  const { user } = useContext(UserContext);

  // URLs de las imágenes para las categorías
  const categoryImages = [
    { url: 'https://images.themodernproper.com/billowy-turkey/production/posts/VegetableStirFry_9.jpg?w=600&q=82&auto=format&fit=crop&dm=1703377301&s=da9a5f34539f904ba0ad0f334d38db2f', category: 'Veggie' },
    { url: 'https://comerbeber.com/archivos/styles/xlarge/public/imagen/2022/02/carne-con-chimichurri-cv_1200.jpg', category: 'Carnes' },
    { url: 'https://i0.wp.com/chasety.com/wp-content/uploads/2023/09/realchasecurtis_Blackberry_Thyme_Lemonade_sitting_on_plate_on_288e693e-1655-44ae-9156-902a25fce640.png?w=816&ssl=1', category: 'Bebidas' },
    { url: 'https://i0.wp.com/www.pardonyourfrench.com/wp-content/uploads/2019/01/Classic-French-Croissant-Recipe-75.jpg?fit=1170%2C1755&ssl=1', category: 'Panadería' },
    { url: 'https://driscolls.imgix.net/-/media/assets/recipes/mixed-berry-tart.ashx?w=926&h=695&fit=crop&crop=entropy&q=50&auto=format,compress&cs=srgb&ixlib=imgixjs-3.4.2', category: 'Postres' },
    { url: 'https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEjyJ2LWwGUTPLR0pFNvc0ZwaxOw_hojR5GV5d0K0pBI4XEVYgpYfL679Hy4zkwPXIRA8H9Ni_gqpN1EVtlkWqwis0291bEv6UWsxRstb46IkYpEJC7lpNyOwDCM517gRpxHNwqTHP8LXCIg/w512-h640/Coquitos+Nestl%25C3%25A9+III.jpg', category: 'Sin TACC' }
  ];

  return (
    <View style={styles.container}>
      <Header />
      <View style={styles.navbar}>
        <View>
          <Text style={styles.greetingText}>
            Hola, <Text style={styles.username}>{user ? user.username || 'Usuario' : 'Invitado'}!</Text>
          </Text>
          <Text style={styles.searchPrompt}>Busca tus recetas favoritas!</Text>
        </View>
      </View>
      <View>
          <TextInput
            placeholder="Buscar"
            style={styles.searchInput}
          />
      </View>

      {/* Categorías */}
      <View style={styles.carouselContainer}>
        <ScrollView
          ref={categoriesScrollRef}
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.categoriesContainer}
        >
          {/* Botones de categorías */}
          {categoryImages.map((item, index) => (
            <View key={index} style={styles.categoryContainer}>
              <TouchableOpacity
                style={styles.btncategoria}
                onPress={() => navigation.navigate(item.category)}
              >
                <Image source={{ uri: item.url }} style={styles.categoryImage} />
              </TouchableOpacity>
              <Text style={styles.categoryText}>{item.category}</Text>
            </View>
          ))}
        </ScrollView>
      </View>

    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fafafa',
    paddingTop: 50,
    paddingHorizontal: 16,
  },
  navbar: {
    alignItems: 'left',
    marginBottom: 20,
  },
  greetingText: {
    fontSize: 14, // Tamaño más pequeño para el saludo
    color: '#888', // Color gris
  },
  searchPrompt: {
    fontSize: 24, // Tamaño más grande para la búsqueda
    fontWeight: 'bold', // Negrita
    color: '#FF4500',
  },
  searchInput: {
    backgroundColor: '#f1f1f1',
    borderRadius: 30,
    fontSize: 16,
    padding: 15,
    height: 50,
    paddingLeft: 30,
  },
  carouselContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-start',
    marginBottom: 20,
    paddingHorizontal: 16,
    marginTop: 15,
    width: '100%',
  },
  categoryContainer: {
    alignItems: 'center', // Alinear los textos e imágenes al centro
    marginRight: 10,
    marginBottom: 10,
  },
  btncategoria: {
    width: 80, // Tamaño del botón redondo
    height: 80,
    borderRadius: 40, // Completamente redondo
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFA500',
  },
  categoryImage: {
    width: '100%', // Hacer que la imagen cubra todo el botón
    height: '100%',
    borderRadius: 40, // Mantener el redondeado de la imagen dentro del botón
    resizeMode: 'cover', // Asegurarse que la imagen cubra todo el área
  },
  categoryText: {
    marginTop: 5,
    fontSize: 14,
    color: '#333',
    textAlign: 'center',
  },
});

export default SearchScreen;
