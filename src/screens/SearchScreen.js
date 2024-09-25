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
      <View style={styles.categoriesContainer}>
        {['Veggie', 'Postres', 'Carnes', 'Bebidas', 'Panadería', 'Sin TACC'].map((category, index) => (
          <TouchableOpacity
            key={index}
            style={[styles.btncategoria, { backgroundColor: ['#B22222', '#FF7700', '#FF4500', '#FFA500', '#C86038', '#FFA500'][index] }]}
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
  categoriesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  btncategoria: {
    borderRadius: 25,
    paddingVertical: 16,
    paddingHorizontal: 24,
    marginBottom: 16,
    width: '48%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  textcategoria: {
    color: '#FFF',
    fontWeight: 'bold',
    fontSize: 18,
  },
});

export default SearchScreen;
