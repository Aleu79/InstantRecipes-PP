import React from 'react';
import { Text } from 'react-native';
import { useLanguage } from '../context/LanguajeContext';

const TranslateButton = ({ textKey, style }) => {
  const { translations } = useLanguage();
  
  return (
    <Text style={style}>
      {translations[textKey] || textKey}
    </Text>
  );
};

export default TranslateButton;
