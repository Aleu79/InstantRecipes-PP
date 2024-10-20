import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native'; 
import { useTheme } from '../../context/ThemeContext';

const Header = () => {
  const { isDarkTheme } = useTheme(); 
  const navigation = useNavigation(); 
 
  return (
    <>
      <View style={isDarkTheme ? styles.darkIconsContainer : styles.lightIconsContainer}>
        <TouchableOpacity style={styles.backIcon} onPress={() => navigation.goBack()}>
          <Icon name="chevron-back" size={30} color={isDarkTheme ? "#fff" : "#333"} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.editIcon} onPress={() => navigation.navigate('UserEdit')}>
          <Icon name="pencil" size={26} color={isDarkTheme ? "#fff" : "#333"} />
        </TouchableOpacity>
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  lightIconsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: '5%',
    marginTop: '5%',
    backgroundColor: '#F2F2F2',
  },
  darkIconsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: '5%',
    marginTop: '5%',
    backgroundColor: '#000',
  },
  backIcon: {
    position: 'static',
    top: 10,
    left: 10,
    marginBottom: '5%',
  },
  editIcon: {
    position: 'static',
    top: 10,
    right: 10,
    marginBottom: '5%',
  },
});

export default Header;
