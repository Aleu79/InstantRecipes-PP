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
import AsyncStorage from '@react-native-async-storage/async-storage';

const FilterByIngredients = () => {
  const navigation = useNavigation();
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestedIngredients, setSuggestedIngredients] = useState([]);
  const [includedList, setIncludedList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [retryTime, setRetryTime] = useState(null); 

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
        setError("Oops, nos quedamos sin peticiones.")
        console.error(err);
        startRetryTimer();
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

  const startRetryTimer = async () => {
    const timerDuration = 24 * 60 * 60; // Duración inicial (24 horas)
    const now = Math.floor(Date.now() / 1000); // Tiempo actual en segundos
    const targetTime = now + timerDuration; // Tiempo futuro al que expira el temporizador
  
    // Guardar el tiempo de finalización en AsyncStorage
    await AsyncStorage.setItem('retryTargetTime', targetTime.toString());
  
    const timerInterval = setInterval(async () => {
      const currentTime = Math.floor(Date.now() / 1000);
      const remainingTime = targetTime - currentTime;
  
      if (remainingTime <= 0) {
        clearInterval(timerInterval);
        setRetryTime(null);
        await AsyncStorage.removeItem('retryTargetTime');
      } else {
        setRetryTime(remainingTime);
      }
    }, 1000);
  };
  

  const formatTime = (seconds) => {
    const days = Math.floor(seconds / (60 * 60 * 24));
    const hours = Math.floor((seconds % (60 * 60 * 24)) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = seconds % 60;

    return `${days > 0 ? `${days}d ` : ''}${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(remainingSeconds).padStart(2, '0')}`;
  };

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
          {error ? (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>{error}</Text>
              <Image
                source={require('../../assets/sinpeticiones.png')}  
                style={styles.errorImage}
              />
              <Text style={styles.retryText}>
                {retryTime !== null ? `Reintentar en: ${formatTime(retryTime)}` : ''}
              </Text>
            </View>
          ) : (
            <>
              <Text style={styles.subtitle}>Buscar ingredientes:</Text>
              <TextInput
                style={styles.input}
                placeholder="Escribí ingredientes..."
                placeholderTextColor="#888"
                value={searchQuery}
                onChangeText={handleSearch}
                editable={retryTime === null} 
              />
              {loading && <ActivityIndicator size="small" color="#000" />}
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
            </>
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
  errorContainer: {
    alignItems: 'center',
    marginTop: 20,
  },
  errorText: {
    color: 'red',
    fontSize: 18,
    fontWeight: 'bold',
  },
  errorImage: {
    width: 300,
    height: 300,
    marginTop: 10,
  },
  retryText: {
    color: '#888',
    fontSize: 16,
    marginTop: 10,
  },
});

export default FilterByIngredients;
