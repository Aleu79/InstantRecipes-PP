import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Button,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
} from 'react-native';

const FilterByIngredients = () => {
  const [includeIngredients, setIncludeIngredients] = useState('');
  const [excludeIngredients, setExcludeIngredients] = useState('');
  const [includedList, setIncludedList] = useState([]);
  const [excludedList, setExcludedList] = useState([]);

  const handleAddIncluded = () => {
    if (includeIngredients.trim()) {
      setIncludedList([...includedList, includeIngredients.trim()]);
      setIncludeIngredients('');
    }
  };

  const handleAddExcluded = () => {
    if (excludeIngredients.trim()) {
      setExcludedList([...excludedList, excludeIngredients.trim()]);
      setExcludeIngredients('');
    }
  };

  const handleRemoveItem = (list, setList, item) => {
    setList(list.filter((i) => i !== item));
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Filtros</Text>

      <View style={styles.section}>
        <Text style={styles.subtitle}>Mostrarme recetas con:</Text>
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="Escribí ingredientes..."
            value={includeIngredients}
            onChangeText={setIncludeIngredients}
          />
          <Button title="Agregar" onPress={handleAddIncluded} />
        </View>
        <View style={styles.tagContainer}>
          {includedList.map((item, index) => (
            <TouchableOpacity
              key={index}
              style={styles.tag}
              onPress={() =>
                handleRemoveItem(includedList, setIncludedList, item)
              }
            >
              <Text style={styles.tagText}>{item} ✕</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.subtitle}>Mostrarme recetas sin:</Text>
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="Escribí ingredientes..."
            value={excludeIngredients}
            onChangeText={setExcludeIngredients}
          />
          <Button title="Agregar" onPress={handleAddExcluded} />
        </View>
        <View style={styles.tagContainer}>
          {excludedList.map((item, index) => (
            <TouchableOpacity
              key={index}
              style={styles.tag}
              onPress={() =>
                handleRemoveItem(excludedList, setExcludedList, item)
              }
            >
              <Text style={styles.tagText}>{item} ✕</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <TouchableOpacity style={styles.clearButton}>
        <Text style={styles.clearText}>Borrar</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.showRecipesButton}>
        <Text style={styles.showRecipesText}>Mostrar 131562 recetas</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 16,
    backgroundColor: '#000',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 16,
  },
  section: {
    marginBottom: 24,
  },
  subtitle: {
    fontSize: 18,
    color: '#fff',
    marginBottom: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  input: {
    flex: 1,
    backgroundColor: '#333',
    color: '#fff',
    borderRadius: 8,
    paddingHorizontal: 12,
    marginRight: 8,
  },
  tagContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  tag: {
    backgroundColor: '#444',
    borderRadius: 20,
    paddingVertical: 6,
    paddingHorizontal: 12,
    marginRight: 8,
    marginBottom: 8,
  },
  tagText: {
    color: '#fff',
  },
  clearButton: {
    alignSelf: 'center',
    marginBottom: 16,
  },
  clearText: {
    color: '#fff',
    textDecorationLine: 'underline',
  },
  showRecipesButton: {
    backgroundColor: '#f57c00',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  showRecipesText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});

export default FilterByIngredients;