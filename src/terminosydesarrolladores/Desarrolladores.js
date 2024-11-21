import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import Header from '../components/Headers/Header';
import * as Animatable from 'react-native-animatable';

const DevelopersScreen = ({ navigation }) => {
  return (
    <View style={styles.container}>
      <Animatable.View animation="fadeInDown" duration={1000} style={styles.headerContainer}>
        <Header title="Desarrolladores" goBack={() => navigation.goBack()} />
      </Animatable.View>

      <View style={styles.contentContainer}>
        <Animatable.View animation="zoomIn" duration={1500} style={styles.iconTextContainer}>
          <Icon name="code-slash-outline" size={40} color="#4CAF50" />
          <Text style={styles.titleText}>Desarrolladores</Text>
        </Animatable.View>

        <Animatable.View animation="bounceIn" duration={1500} style={styles.developersContainer}>
          <View style={styles.developerCard}>
            <Image
              source={require('../../assets/logoapp.png')}
              style={styles.developerImage}
              resizeMode="cover"
            />
            <Text style={styles.developerName}>Soy Damian Aguero</Text>
            <Text style={styles.developerInfo}>
              Apasionado por la tecnología, desarrollo y el diseño funcional.
            </Text>
          </View>

          <View style={styles.developerCard}>
            <Image
              source={require('../../assets/logoapp.png')}
              style={styles.developerImage}
              resizeMode="cover"
            />
            <Text style={styles.developerName}>Soy Rocio Gutierrez</Text>
            <Text style={styles.developerInfo}>
              Creativa y detallista, dedicada al desarrollo y diseño innovador.
            </Text>
          </View>
        </Animatable.View>

        <Text style={styles.footerText}>
          ¡Estén atentos! Pronto actualizaremos esta sección con más detalles.
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f3f4f6',
  },
  headerContainer: {
    marginTop: 32,
    marginBottom: 16,
  },
  contentContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  iconTextContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  titleText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#333',
    marginLeft: 8,
  },
  developersContainer: {
    flexDirection: 'column', // Cambio a columna para apilar las tarjetas verticalmente
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
  },
  developerCard: {
    alignItems: 'center',
    marginBottom: 20, // Añadido margen entre las tarjetas
  },
  developerImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    marginBottom: 10,
  },
  developerName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  developerInfo: {
    fontSize: 14,
    textAlign: 'center',
    color: '#4b5563',
    marginTop: 4,
  },
  footerText: {
    fontSize: 16,
    textAlign: 'center',
    color: '#6b7280',
    marginTop: 20,
  },
});

export default DevelopersScreen;
