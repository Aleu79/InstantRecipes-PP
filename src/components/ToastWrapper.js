import React from 'react';
import Toast from 'react-native-toast-message';

const ToastWrapper = ({
  text1,
  position = 'top',
  visibilityTime = 3000,
  topOffset = 50,
  backgroundColor = 'white',
  borderColor = '#555',
  borderWidth = 3,
  borderRadius = 30,
  padding = 20,
  shadowColor = '#000',
  shadowOffset = { width: 0, height: 2 },
  shadowOpacity = 0.2,
  shadowRadius = 5,
  textColor = 'black',
  textAlign = 'center',
  fontWeight = 'bold',
}) => {
  Toast.show({
    text1,
    position,
    visibilityTime,
    topOffset,
    animationType: 'slide-in',
    style: {
      backgroundColor,
      borderColor,
      borderWidth,
      borderRadius,
      padding,
      shadowColor,
      shadowOffset,
      shadowOpacity,
      shadowRadius,
    },
    textStyle: {
      color: textColor,
      fontWeight,
      textAlign,
    },
  });

  return null; // No es necesario renderizar nada
};

export default ToastWrapper;
