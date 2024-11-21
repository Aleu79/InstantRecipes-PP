import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ImageBackground } from 'react-native';

const LoadingScreen = () => {
  const [dots, setDots] = useState([false, false, false]);

  useEffect(() => {
    const interval = setInterval(() => {
      setDots((prev) => {
        const nextDots = [...prev];
        const firstFalse = nextDots.indexOf(false);
        if (firstFalse !== -1) {
          nextDots[firstFalse] = true;
        } else {
          nextDots.fill(false);
        }
        return nextDots;
      });
    }, 500);

    return () => clearInterval(interval);
  }, []);

  return (
    <ImageBackground 
      source={require('../../assets/splash.png')} 
      style={styles.background}
      resizeMode="cover"
    >
      <View style={styles.dotsContainer}>
        {dots.map((dot, index) => (
          <View
            key={index}
            style={[styles.dot, dot && styles.dotActive]}
          />
        ))}
      </View>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  background: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dotsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    position: 'absolute',
    bottom: 40, 
  },
  dot: {
    width: 15,
    height: 15,
    borderRadius: 7.5,
    margin: 5,
    backgroundColor: '#FFA500',
    opacity: 0.3,
  },
  dotActive: {
    opacity: 1,
  },
});

export default LoadingScreen; 