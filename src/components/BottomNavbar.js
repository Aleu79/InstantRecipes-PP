import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useTheme } from '../context/ThemeContext'; 

const BottomNavBar = ({ navigation }) => {
  const { isDarkTheme } = useTheme(); 

  return (
    <View style={[styles.navbar, isDarkTheme ? styles.darkNavbar : styles.lightNavbar]}>
      <TouchableOpacity style={styles.navButton} onPress={() => navigation.navigate('HomeScreen')}>
        <Icon name="home-outline" size={30} color={isDarkTheme ? '#fff' : '#333'} />
      </TouchableOpacity>
      <TouchableOpacity style={styles.navButton} onPress={() => navigation.navigate('Notifications')}>
        <Icon name="mail-outline" size={30} color={isDarkTheme ? '#fff' : '#333'} />
      </TouchableOpacity>
      <TouchableOpacity style={styles.navButton} onPress={() => navigation.navigate('SavedRecipes')}>
        <Icon name="bookmark-outline" size={30} color={isDarkTheme ? '#fff' : '#333'} />
      </TouchableOpacity>
      <TouchableOpacity style={styles.navButton} onPress={() => navigation.navigate('UserProfile')}>
        <Icon name="person-outline" size={30} color={isDarkTheme ? '#fff' : '#333'} />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  navbar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    borderTopWidth: 1,
    paddingVertical: 10,
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
  darkNavbar: {
    backgroundColor: '#121212',
    borderTopColor: '#333',
  },
  lightNavbar: {
    backgroundColor: '#fff',
    borderTopColor: '#ccc',
  },
  navButton: {
    flex: 1,
    alignItems: 'center',
  },
});

export default BottomNavBar;
