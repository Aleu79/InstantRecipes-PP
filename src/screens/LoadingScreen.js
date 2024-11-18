import React from 'react';
import { View, ActivityIndicator, StyleSheet, ImageBackground } from 'react-native';

const LoadingScreen = () => {
  return (
    <ImageBackground 
      source={require('../../assets/splash.png')} 
      style={styles.background}
      resizeMode="cover"
    >
      <ActivityIndicator size="large" color="#ff6347" style={styles.spinner} />
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  background: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  spinner: {
    position: 'absolute', 
    bottom: 40, 
  },
});

export default LoadingScreen;
