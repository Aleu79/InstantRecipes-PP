import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Button,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';

const FilterByIngredients = () => {
  const navigation = useNavigation();
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
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={{ flex: 1 }}
    >
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>Filtros</Text>

        <View style={[styles.section, { marginTop: 50 }]}>
          <Text style={styles.subtitle}>Mostrarme recetas con:</Text>
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              placeholder="Escribí ingredientes..."
              placeholderTextColor="#888"
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
                 <Text style={styles.tagText}>{item} <Icon name="close" size={20} color="#000"/></Text>
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
              placeholderTextColor="#888"
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
                <Text style={styles.tagText}>{item} <Icon name="close" size={20} color="#000"/></Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.navigate('SearchScreen')}
        >
          <Text style={styles.backText}>Volver</Text>
        </TouchableOpacity>
      </ScrollView>

      <TouchableOpacity style={styles.showRecipesButton}>
        <Text style={styles.showRecipesText}>Mostrar 131562 recetas</Text>
      </TouchableOpacity>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 16,
    marginTop: 40,
    backgroundColor: '#fafafa',
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 24,
    textAlign: 'center',
  },
  section: {
    marginBottom: 32,
  },
  subtitle: {
    fontSize: 18,
    color: '#555',
    marginBottom: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  input: {
    flex: 1,
    backgroundColor: '#fff',
    borderColor: '#ddd',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    height: 40,
    marginRight: 8,
    color: '#333',
  },
  tagContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  tag: {
    backgroundColor: '#e0e0e0',
    borderRadius: 20,
    paddingVertical: 6,
    paddingHorizontal: 12,
    marginRight: 8,
    marginBottom: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tagText: {
    color: '#333',
  },
  backButton: {
    alignSelf: 'center',
    marginBottom: 16,
  },
  backText: {
    color: '#f57c00',
    textDecorationLine: 'underline',
    fontSize: 16,
  },
  showRecipesButton: {
    backgroundColor: '#f57c00',
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginHorizontal: 16,
    marginBottom: 16,
  },
  showRecipesText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 18,
  },
});

export default FilterByIngredients;
