import React from 'react';
import { TouchableOpacity, StyleSheet, View } from 'react-native';
import { useLanguage } from '../context/LanguajeContext';
import Icon from 'react-native-vector-icons/FontAwesome'; 

const TranslateButton = ({ style }) => {
  const { toggleLanguage } = useLanguage();

  return (
    <TouchableOpacity style={[styles.button, style]} onPress={toggleLanguage}>
      <Icon 
        name="language"  
        size={30} 
        color="white" 
      />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    padding: 10,
    backgroundColor: '#007AFF',
    borderRadius: 50,  
  },
});

export default TranslateButton;
