import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Image,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import axios from 'axios';

const FilterByIngredients = () => {
  const navigation = useNavigation();
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestedIngredients, setSuggestedIngredients] = useState([]);
  const [includedList, setIncludedList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchIngredients = async () => {
      setLoading(true);
      try {
        const response = await axios.get(
          `https://api.spoonacular.com/food/ingredients/autocomplete?query=&apiKey=7049b3cba3134fb090258c4f100093ff&number=50`
        );
        setSuggestedIngredients(response.data);
        setError(null);
      } catch (err) {
        setError('Opss nos quedamos sin peticiones');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchIngredients();
  }, []);

  const handleSearch = async (query) => {
    setSearchQuery(query);
    if (query.length > 1) {
      setLoading(true);
      try {
        const response = await axios.get(
          `https://api.spoonacular.com/food/ingredients/autocomplete?query=${query}&apiKey=7049b3cba3134fb090258c4f100093ff&number=10`
        );
        setSuggestedIngredients(response.data);
      } catch (err) {
        console.error('Error buscando ingredientes:', err);
      } finally {
        setLoading(false);
      }
    }
  };

  const handleSelectIngredient = (ingredient) => {
    if (!includedList.some((item) => item.name === ingredient.name)) {
      setIncludedList([...includedList, ingredient]);
    }
    setSearchQuery('');
  };

  const handleRemoveIngredient = (ingredient) => {
    setIncludedList(includedList.filter((item) => item.name !== ingredient.name));
  };

  const applyFilters = () => {
    console.log("enviando filtros:", includedList);  
    navigation.navigate('SearchScreen', { includedList });
  };

  const isButtonEnabled = includedList.length > 0;

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={{ flex: 1 }}
    >
      <ScrollView contentContainerStyle={styles.container}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="chevron-back" size={24} color="black" />
        </TouchableOpacity>
        <Text style={styles.title}>Filtros</Text>

        <View style={styles.section}>
          <Text style={styles.subtitle}>Buscar ingredientes:</Text>
          <TextInput
            style={styles.input}
            placeholder="Escribí ingredientes..."
            placeholderTextColor="#888"
            value={searchQuery}
            onChangeText={handleSearch}
          />
          {loading && <ActivityIndicator size="small" color="#000" />}
          {error && (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>{error}</Text>
              <Image
                source={require('../../assets/sinpeticiones.png')}  
                style={styles.errorImage}
              />
            </View>
          )}
          {searchQuery && suggestedIngredients.length > 0 && (
            <ScrollView style={styles.suggestionsContainer} contentContainerStyle={{ paddingBottom: 10 }}>
              {suggestedIngredients.map((ingredient, index) => (
                <TouchableOpacity
                  key={index}
                  style={styles.suggestion}
                  onPress={() => handleSelectIngredient(ingredient)}
                >
                  <Image
                    source={{
                      uri: `https://spoonacular.com/cdn/ingredients_100x100/${ingredient.image}`,
                    }}
                    style={styles.suggestionImage}
                  />
                  <Text style={styles.suggestionText}>{ingredient.name}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          )}
          <View style={styles.tagScrollContainer}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {includedList.map((item, index) => (
                <TouchableOpacity
                  key={index}
                  style={styles.tag}
                  onPress={() => handleRemoveIngredient(item)}
                >
                  <Text style={styles.tagText}>
                    {item.name} <Ionicons name="close" size={16} color="#000" />
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>

        <TouchableOpacity
          style={[
            styles.applyButton,
            isButtonEnabled ? styles.applyButtonEnabled : styles.applyButtonDisabled,
          ]}
          onPress={applyFilters}
          disabled={!isButtonEnabled} 
        >
          <Text style={styles.applyText}>Aplicar filtros</Text>
          <Ionicons
            name={isButtonEnabled ? "lock-open" : "lock-closed"}
            size={24}
            color={isButtonEnabled ? "green" : "red"}
            style={styles.lockIcon}
          />
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 16,
    marginTop: 40,
    backgroundColor: '#fff',
  },
  backButton: {
    padding: 5,
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
  input: {
    backgroundColor: '#fff',
    borderColor: '#ddd',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    height: 40,
    marginBottom: 8,
    color: '#333',
  },
  suggestionsContainer: {
    backgroundColor: '#fff',
    borderColor: '#ddd',
    borderWidth: 1,
    borderRadius: 8,
    maxHeight: 150, 
    overflow: 'hidden',
  },
  suggestion: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderBottomColor: '#ddd',
    borderBottomWidth: 1,
  },
  suggestionImage: {
    width: 40,
    height: 40,
    marginRight: 10,
    borderRadius: 4,
  },
  suggestionText: {
    color: '#333',
  },
  tagScrollContainer: {
    marginTop: 10,
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
  applyButton: {
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginHorizontal: 16,
    marginBottom: 16,
    flexDirection: 'row',
    justifyContent: 'center',
  },
  applyButtonEnabled: {
    backgroundColor: '#f57c00', 
  },
  applyButtonDisabled: {
    backgroundColor: '#555', 
  },
  applyText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 18,
    marginRight: 10,
  },
  lockIcon: {
    marginLeft: 10,
  },
  errorText: {
    color: 'red',
    marginTop: 10,
  },
  errorContainer: {
    flexDirection: 'column',  
    alignItems: 'center',     
    marginTop: 20,
  },
  errorImage: {
    width: 300,  
    height: 300, 
    marginTop: 10,  
  },
  errorText: {
    color: 'red',
    fontSize: 16,  
    textAlign: 'center',  
  },
});

export default FilterByIngredients;
