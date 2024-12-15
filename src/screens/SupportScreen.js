import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Linking, Image, ScrollView } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import Header from '../components/Headers/Header';
import * as Animatable from 'react-native-animatable';

const SupportScreen = ({ navigation }) => {
  const handleSendEmail = () => {
    const email = 'instanturecipes@gmail.com'; 
    const subject = 'Soporte desde la app'; 
    const body = '¡Hola! Necesito ayuda con...'; 

    const url = `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    Linking.openURL(url).catch((err) => console.error('Error al abrir el correo', err));
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.headerContainer}>
        <Header title="Soporte Técnico" goBack={() => navigation.goBack()} />
      </View>

      <Animatable.View animation="fadeIn" duration={1000} style={styles.content}>
        {/* Animación para el ícono */}
        <View style={styles.errorContainer}>
          <Image 
            source={require('../../assets/soporte.jpg')}  
            style={styles.errorImage}
          />
        </View>

        {/* Animación para el título */}
        <Animatable.Text animation="bounceIn" duration={1500} style={styles.header}>
          ¡Estamos aquí para ayudarte!
        </Animatable.Text>

        {/* Animación para el texto explicativo */}
        <Animatable.Text animation="fadeInUpBig" duration={1500} style={styles.text}>
          Si tienes alguna pregunta o problema con la aplicación, no dudes en contactarnos. 
          Estamos trabajando para ofrecerte la mejor experiencia de soporte posible.
        </Animatable.Text>

        {/* Instrucciones claras */}
        <Animatable.Text animation="fadeInUpBig" duration={1500} style={styles.text}>
          Para cualquier consulta, simplemente presiona el botón a continuación y te ayudaremos a resolverlo rápidamente.
        </Animatable.Text>

        {/* Botón para enviar correo */}
        <TouchableOpacity style={styles.emailButton} onPress={handleSendEmail}>
          <Text style={styles.emailButtonText}>Enviar un correo a soporte</Text>
        </TouchableOpacity>
      </Animatable.View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: '#F5F5F5',
    paddingVertical: 20,
    paddingHorizontal: 16,
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
    fontSize: 32,
    fontWeight: '700',
    color: '#333',
    marginTop: 20,
    textAlign: 'center',
    letterSpacing: 1,
  },
  text: {
    fontSize: 18,
    color: '#666',
    textAlign: 'center',
    marginTop: 15,
    lineHeight: 24,
  },
  emailButton: {
    marginTop: 30,
    backgroundColor: '#4CAF50',
    paddingVertical: 14,
    paddingHorizontal: 35,
    borderRadius: 10,
    elevation: 5,
    shadowColor: '#4CAF50',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
  },
  emailButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  errorContainer: {
    alignItems: 'center',
    marginTop: 20,
  },
  errorImage: {
    width: 250,
    height: 250,
    borderRadius: 15,
    borderWidth: 2,
    borderColor: '#4CAF50',
    marginBottom: 20,
  },
});

export default SupportScreen;
