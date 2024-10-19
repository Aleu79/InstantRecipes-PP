import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import Header from '../Headers/Header';
import BottomNavBar from '../BottomNavbar';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../../context/ThemeContext';

const Settings = () => {
  const navigation = useNavigation();
  const { isDarkTheme, toggleTheme } = useTheme();

  return (
    <ScrollView contentContainerStyle={[styles.container, isDarkTheme && styles.darkContainer]}>
      <Header />

      <View style={styles.separator} />

      <Text style={[styles.text, isDarkTheme && styles.darkText]}>Ajustes</Text>

      <View style={styles.menuContainer}>
        <TouchableOpacity style={styles.menuItem} onPress={() => navigation.navigate('Terminos')}>
          <Icon name="document-text-outline" size={24} color={isDarkTheme ? '#fff' : '#333'} />
          <Text style={[styles.menuText, isDarkTheme && styles.darkText]}>Términos y Condiciones</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.menuItem} onPress={() => navigation.navigate('DevelopersScreen')}>
          <Icon name="desktop-outline" size={24} color={isDarkTheme ? '#fff' : '#333'} />
          <Text style={[styles.menuText, isDarkTheme && styles.darkText]}>Desarrolladores</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.menuItem} onPress={toggleTheme}>
          <Icon name="sunny-outline" size={24} color={isDarkTheme ? '#fff' : '#333'} />
          <Text style={[styles.menuText, isDarkTheme && styles.darkText]}>Tema</Text>
        </TouchableOpacity>
      </View>

      <BottomNavBar navigation={navigation} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: '#fafafa',
    padding: 20,
  },
  darkContainer: {
    backgroundColor: '#222',
  },
  menuContainer: {
    marginVertical: 20,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
  },
  menuText: {
    marginLeft: 10,
    fontSize: 18,
    color: '#333',
  },
  darkText: {
    color: '#fff',
  },
  text: {
    fontSize: 24,
    fontWeight: 'bold',
    marginLeft: 10,
    marginTop: 10,
    color: '#333',
  },
  separator: {
    height: 1,
    backgroundColor: '#ccc',
    marginVertical: 20,
  },
});

export default Settings;
