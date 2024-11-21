import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import Header from '../components/Headers/Header';
import * as Animatable from 'react-native-animatable';

const SupportScreen = ({ navigation }) => {
  return (
    <View style={styles.container}>
      <View style={styles.headerContainer}>
        <Header title="SupportScreen" goBack={() => navigation.goBack()} />
      </View>
      <View style={styles.content}>
        {/* Animación para el ícono */}
        <Animatable.View animation="fadeIn" duration={1000}>
          <MaterialIcons name="support-agent" size={200} color="#4CAF50" />
        </Animatable.View>

        {/* Animación para el título */}
        <Animatable.Text animation="bounceIn" duration={1500} style={styles.header}>
          ¡Próximamente!
        </Animatable.Text>

        {/* Animación para el texto */}
        <Animatable.Text animation="fadeInUpBig" duration={1500} style={styles.text}>
          Estamos trabajando para habilitar esta sección y ofrecerte la mejor experiencia de soporte.
          ¡Gracias por tu paciencia!
        </Animatable.Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f8f8',
  },
  headerContainer: {
    marginTop: 32,
    marginBottom: 16,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  header: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 20,
    textAlign: 'center',
  },
  text: {
    fontSize: 16,
    color: '#555',
    textAlign: 'center',
    marginTop: 10,
  },
});

export default SupportScreen;
