import React from 'react';
import { View, TextInput, TouchableOpacity, Text, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';

const SearchScreen = ({ navigation }) => {
  return (
    <View style={styles.container}>
      {/* Barra de búsqueda */}
      <View style={styles.navbar}>
        <TextInput
          placeholder="Buscar"
          style={styles.searchInput}
        />
      </View>

      {/* Categorías */}
      <View style={styles.carouselContainer}>
        {['Veggie', 'Postres', 'Carnes', 'Bebidas', 'Panadería', 'Sin TACC'].map((category, index) => (
          <TouchableOpacity
            key={index}
            style={[styles.btncategoria, { backgroundColor: ['#B22222', '#FFA500', '#FF4500', '#C86038', '#FF7700', '#FFA500'][index] }]}
            onPress={() => navigation.navigate(category)}
          >
            <Text style={styles.textcategoria}>{category}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F2F2F2',
    paddingTop: 50,
    paddingHorizontal: 16,
  },
  navbar: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  searchInput: {
    flex: 1,
    padding: 10,
    backgroundColor: '#FFF',
    borderRadius: 10,
    fontSize: 16,
  },
  carouselContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap', // Permite que los botones se ajusten si no caben
    justifyContent: 'flex-start', // Alinea los botones a la izquierda
    marginBottom: 20,
    paddingHorizontal: 16,
    marginTop: 15,
  },
  btncategoria: {
    borderRadius: 25,
    paddingVertical: 16,
    paddingHorizontal: 24,
    marginRight: 8,
    marginBottom: 8, // Espacio entre filas
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
});

export default SearchScreen;
