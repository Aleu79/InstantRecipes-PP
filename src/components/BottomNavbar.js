import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';

const BottomNavBar = ({ navigation }) => {
  return (
    <View style={styles.navbar}>
      <TouchableOpacity style={styles.navButton} onPress={() => navigation.navigate('Home')}>
        <Icon name="home-outline" size={30} color="#333" />
      </TouchableOpacity>
      <TouchableOpacity style={styles.navButton} onPress={() => navigation.navigate('SearchScreen')}>
        <Icon name="search-outline" size={30} color="#333" />
      </TouchableOpacity>
      <TouchableOpacity style={styles.navButton} onPress={() => navigation.navigate('SavedRecipes')}>
        <Icon name="bookmark-outline" size={30} color="#333" />
      </TouchableOpacity>
      <TouchableOpacity style={styles.navButton} onPress={() => navigation.navigate('UserProfile')}>
        <Icon name="person-outline" size={30} color="#333" />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  navbar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#ccc',
    paddingVertical: 10,
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
  navButton: {
    flex: 1,
    alignItems: 'center',
  },
});

export default BottomNavBar;
